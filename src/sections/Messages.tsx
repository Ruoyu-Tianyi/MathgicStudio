import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MessageSquare, Send, Trash2, ShieldCheck, LogOut, Loader2, CloudOff } from 'lucide-react'
import { supabase, ADMIN_EMAIL, type MessageRow } from '@/lib/supabase'

const NAME_KEY = 'mathgic-nickname'

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('zh-CN', { hour12: false })
}

export default function Messages() {
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [cloudOk, setCloudOk] = useState(true)

  // 管理员状态
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminPanelOpen, setAdminPanelOpen] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [adminMsg, setAdminMsg] = useState('')
  const [adminBusy, setAdminBusy] = useState(false)

  useEffect(() => {
    setName(localStorage.getItem(NAME_KEY) ?? '')
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
    <section id="messages" className="scroll-mt-20 bg-gradient-to-b from-white via-slate-100/70 to-white py-24">
      <div className="mx-auto max-w-3xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900">留言板</h2>
          <p className="mt-3 text-slate-600">使用反馈、改进建议、组队意向 —— 都欢迎写在这里。</p>
        </div>

        <Card className="mt-10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5 text-indigo-600" /> 写下你的想法
              </CardTitle>
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
            <CardDescription>留言实时同步到云端，所有访客可见。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {adminPanelOpen && !isAdmin && (
              <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-3">
                <div className="flex gap-2">
                  <Input
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="管理员邮箱"
                    type="email"
                    className="h-9 text-sm"
                  />
                  <Button size="sm" onClick={sendMagicLink} disabled={adminBusy} className="shrink-0">
                    {adminBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : '发送登录邮件'}
                  </Button>
                </div>
                {adminMsg && <p className="mt-2 text-xs text-slate-600">{adminMsg}</p>}
                <p className="mt-1 text-xs text-slate-400">免密码：点击邮件中的魔法链接即完成登录。</p>
              </div>
            )}
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="昵称" maxLength={20} />
            <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="留言内容……" className="min-h-[90px]" maxLength={300} />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button onClick={submit} disabled={sending || !cloudOk} className="bg-indigo-600 hover:bg-indigo-700">
              {sending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Send className="mr-1 h-4 w-4" />}
              发布留言
            </Button>
          </CardContent>
        </Card>

        <div className="mt-6 space-y-3">
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
            <Card key={m.id}>
              <CardContent className="flex items-start gap-3 p-4">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-slate-200 text-sm text-slate-700">{m.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900">{m.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{formatTime(m.created_at)}</span>
                      {isAdmin && (
                        <button onClick={() => remove(m.id)} className="text-slate-300 transition-colors hover:text-red-500" aria-label="删除留言">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{m.text}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
