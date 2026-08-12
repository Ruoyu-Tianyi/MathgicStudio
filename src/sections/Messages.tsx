import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  MessageSquare, Send, Trash2, ShieldCheck, LogOut, Loader2, CloudOff,
  Pin, PinOff, Heart, MessageCircle,
} from 'lucide-react'
import { supabase, ADMIN_EMAIL, type MessageRow, type ReplyRow } from '@/lib/supabase'

const NAME_KEY = 'mathgic-nickname'
const LIKED_KEY = 'mathgic-liked'

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('zh-CN', { hour12: false })
}

function loadLiked(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(LIKED_KEY) ?? '[]'))
  } catch {
    return new Set()
  }
}

export default function Messages() {
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [cloudOk, setCloudOk] = useState(true)

  // 点赞 / 评论
  const [liked, setLiked] = useState<Set<string>>(new Set())
  const [openThread, setOpenThread] = useState<string | null>(null)
  const [replies, setReplies] = useState<Record<string, ReplyRow[]>>({})
  const [replyText, setReplyText] = useState('')
  const [replySending, setReplySending] = useState(false)
  const [repliesLoading, setRepliesLoading] = useState(false)

  // 管理员状态
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminPanelOpen, setAdminPanelOpen] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [adminMsg, setAdminMsg] = useState('')
  const [adminBusy, setAdminBusy] = useState(false)

  useEffect(() => {
    setName(localStorage.getItem(NAME_KEY) ?? '')
    setLiked(loadLiked())
    void fetchMessages()

    // 恢复登录态 + 监听登录变化
    supabase.auth.getSession().then(({ data }) => {
      setIsAdmin(data.session?.user?.email === ADMIN_EMAIL)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(session?.user?.email === ADMIN_EMAIL)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  async function fetchMessages() {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('messages')
      .select('*')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50)
    if (err) {
      setCloudOk(false)
    } else {
      setCloudOk(true)
      setMessages(data as MessageRow[])
    }
    setLoading(false)
  }

  async function submit() {
    const n = name.trim()
    const t = text.trim()
    if (!n || !t) {
      setError('请填写昵称和留言内容')
      return
    }
    setSending(true)
    setError('')
    const { data, error: err } = await supabase
      .from('messages')
      .insert({ name: n.slice(0, 20), text: t.slice(0, 300) })
      .select()
      .single()
    setSending(false)
    if (err) {
      setError('发送失败：' + err.message)
      return
    }
    localStorage.setItem(NAME_KEY, n)
    setMessages((prev) => [data as MessageRow, ...prev])
    setText('')
  }

  async function remove(id: string) {
    const { error: err } = await supabase.from('messages').delete().eq('id', id)
    if (err) {
      setError('删除失败：' + err.message)
      return
    }
    setMessages((prev) => prev.filter((m) => m.id !== id))
  }

  // ── 置顶（管理员） ──
  async function togglePin(m: MessageRow) {
    const { error: err } = await supabase
      .from('messages').update({ pinned: !m.pinned }).eq('id', m.id)
    if (err) {
      setError('置顶操作失败：' + err.message)
      return
    }
    void fetchMessages() // 重新排序
  }

  // ── 点赞 ──
  async function like(m: MessageRow) {
    if (liked.has(m.id)) return
    // 乐观更新
    setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, likes: x.likes + 1 } : x)))
    const next = new Set(liked).add(m.id)
    setLiked(next)
    localStorage.setItem(LIKED_KEY, JSON.stringify([...next]))
    const { error: err } = await supabase.rpc('like_message', { msg_id: m.id })
    if (err) {
      // 回滚
      setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, likes: x.likes - 1 } : x)))
      next.delete(m.id)
      setLiked(new Set(next))
      localStorage.setItem(LIKED_KEY, JSON.stringify([...next]))
    }
  }

  // ── 评论 ──
  async function toggleThread(msgId: string) {
    if (openThread === msgId) {
      setOpenThread(null)
      return
    }
    setOpenThread(msgId)
    if (replies[msgId]) return // 已加载过
    setRepliesLoading(true)
    const { data } = await supabase
      .from('message_replies')
      .select('*')
      .eq('message_id', msgId)
      .order('created_at', { ascending: true })
      .limit(100)
    setReplies((prev) => ({ ...prev, [msgId]: (data as ReplyRow[]) ?? [] }))
    setRepliesLoading(false)
  }

  async function submitReply(msgId: string) {
    const n = isAdmin ? '若瑜（作者）' : name.trim()
    const t = replyText.trim()
    if (!n || !t) {
      setError('请先填写昵称，再写回复')
      return
    }
    setReplySending(true)
    const { data, error: err } = await supabase
      .from('message_replies')
      .insert({ message_id: msgId, name: n.slice(0, 20), text: t.slice(0, 300) })
      .select()
      .single()
    setReplySending(false)
    if (err) {
      setError('评论失败：' + err.message)
      return
    }
    localStorage.setItem(NAME_KEY, n)
    setReplies((prev) => ({ ...prev, [msgId]: [...(prev[msgId] ?? []), data as ReplyRow] }))
    setReplyText('')
  }

  async function removeReply(msgId: string, replyId: string) {
    const { error: err } = await supabase.from('message_replies').delete().eq('id', replyId)
    if (err) {
      setError('删除评论失败：' + err.message)
      return
    }
    setReplies((prev) => ({ ...prev, [msgId]: prev[msgId].filter((r) => r.id !== replyId) }))
  }

  async function sendMagicLink() {
    const email = adminEmail.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAdminMsg('请输入正确的邮箱地址')
      return
    }
    setAdminBusy(true)
    setAdminMsg('')
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    setAdminBusy(false)
    setAdminMsg(err ? '发送失败：' + err.message : '登录邮件已发送，请查收并点击邮件中的链接完成登录')
  }

  async function logout() {
    await supabase.auth.signOut()
    setAdminPanelOpen(false)
  }

  return (
    <section id="messages" className="border-t border-black/10">
      <div className="mx-auto max-w-3xl scroll-mt-20 px-4 py-24">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-indigo-600">Messages</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">留言板</h2>
        <p className="mt-3 text-slate-600">使用反馈、改进建议、组队意向 —— 都欢迎写在这里。</p>

        {/* 发布表单：扁平无卡片 */}
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <MessageSquare className="h-5 w-5 text-indigo-600" /> 写下你的想法
            </h3>
            {isAdmin ? (
              <span className="flex items-center gap-2 text-xs text-green-700">
                <ShieldCheck className="h-4 w-4" /> 管理员已登录
                <button onClick={logout} className="flex items-center gap-1 text-slate-400 hover:text-red-500">
                  <LogOut className="h-3.5 w-3.5" /> 退出
                </button>
              </span>
            ) : (
              <button
                onClick={() => setAdminPanelOpen(!adminPanelOpen)}
                className="text-xs text-slate-400 transition-colors hover:text-indigo-600"
              >
                管理
              </button>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">留言实时同步到云端，所有访客可见。</p>

          <div className="mt-4 space-y-3">
            {adminPanelOpen && !isAdmin && (
              <div className="rounded-lg bg-indigo-50/70 p-3">
                <div className="flex gap-2">
                  <Input
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="管理员邮箱"
                    type="email"
                    className="h-9 bg-white text-sm"
                  />
                  <Button size="sm" onClick={sendMagicLink} disabled={adminBusy} className="shrink-0">
                    {adminBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : '发送登录邮件'}
                  </Button>
                </div>
                {adminMsg && <p className="mt-2 text-xs text-slate-600">{adminMsg}</p>}
                <p className="mt-1 text-xs text-slate-400">免密码：点击邮件中的魔法链接即完成登录。</p>
              </div>
            )}
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="昵称（评论时也会使用）" maxLength={20} />
            <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="留言内容……" className="min-h-[90px]" maxLength={300} />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button onClick={submit} disabled={sending || !cloudOk} className="bg-indigo-600 hover:bg-indigo-700">
              {sending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Send className="mr-1 h-4 w-4" />}
              发布留言
            </Button>
          </div>
        </div>

        {/* 留言列表：发丝线分隔行 */}
        <div className="mt-10 divide-y divide-black/10 border-y border-black/10">
          {loading && (
            <p className="flex items-center justify-center gap-2 py-8 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" /> 正在加载留言…
            </p>
          )}
          {!loading && !cloudOk && (
            <p className="flex items-center justify-center gap-2 py-8 text-sm text-slate-400">
              <CloudOff className="h-4 w-4" /> 云端留言服务暂不可用，请稍后再试
            </p>
          )}
          {!loading && cloudOk && messages.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-400">还没有留言，来抢沙发～</p>
          )}
          {messages.map((m) => (
            <div key={m.id} className="py-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-black/[0.06] text-sm text-slate-700">{m.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      {m.name}
                      {m.pinned && (
                        <span className="flex items-center gap-0.5 rounded bg-indigo-50 px-1.5 py-0.5 text-xs font-medium text-indigo-700">
                          <Pin className="h-3 w-3" /> 置顶
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{formatTime(m.created_at)}</span>
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => togglePin(m)}
                            className="text-slate-300 transition-colors hover:text-indigo-600"
                            aria-label={m.pinned ? '取消置顶' : '置顶'}
                            title={m.pinned ? '取消置顶' : '置顶'}
                          >
                            {m.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                          </button>
                          <button onClick={() => remove(m.id)} className="text-slate-300 transition-colors hover:text-red-500" aria-label="删除留言">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{m.text}</p>

                  {/* 点赞 + 评论入口 */}
                  <div className="mt-2 flex items-center gap-4">
                    <button
                      onClick={() => like(m)}
                      disabled={liked.has(m.id)}
                      className={`flex items-center gap-1 text-xs transition-colors ${
                        liked.has(m.id) ? 'text-red-500' : 'text-slate-400 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`h-3.5 w-3.5 ${liked.has(m.id) ? 'fill-red-500' : ''}`} />
                      {m.likes > 0 ? m.likes : '赞'}
                    </button>
                    <button
                      onClick={() => toggleThread(m.id)}
                      className="flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-indigo-600"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      {openThread === m.id ? '收起回复' : '回复'}
                    </button>
                  </div>
                </div>
              </div>

              {/* 评论线程 */}
              {openThread === m.id && (
                <div className="ml-12 mt-3 space-y-3 border-l-2 border-black/10 pl-4">
                  {repliesLoading && !replies[m.id] && (
                    <p className="flex items-center gap-2 text-xs text-slate-400">
                      <Loader2 className="h-3 w-3 animate-spin" /> 加载评论…
                    </p>
                  )}
                  {(replies[m.id] ?? []).map((r) => (
                    <div key={r.id} className="flex items-start justify-between gap-2">
                      <p className="text-sm">
                        {r.name === '若瑜（作者）' ? (
                          <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-xs font-medium text-indigo-700">{r.name}</span>
                        ) : (
                          <span className="font-medium text-slate-800">{r.name}</span>
                        )}
                        <span className="mx-1.5 text-slate-300">·</span>
                        <span className="text-slate-600">{r.text}</span>
                        <span className="ml-2 text-xs text-slate-400">{formatTime(r.created_at)}</span>
                      </p>
                      {isAdmin && (
                        <button onClick={() => removeReply(m.id, r.id)} className="shrink-0 text-slate-300 hover:text-red-500" aria-label="删除评论">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  {(replies[m.id] ?? []).length === 0 && !repliesLoading && (
                    <p className="text-xs text-slate-400">暂无回复</p>
                  )}
                  {isAdmin && (
                    <div className="flex gap-2">
                      <Input
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="以作者身份回复…"
                        className="h-8 text-sm"
                        maxLength={300}
                      />
                      <Button size="sm" variant="outline" onClick={() => submitReply(m.id)} disabled={replySending || !replyText.trim()}>
                        {replySending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
