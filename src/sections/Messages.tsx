import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MessageSquare, Send, Trash2 } from 'lucide-react'

interface Msg {
  id: string
  name: string
  text: string
  time: string
}

const STORAGE_KEY = 'mmstudio-messages'

const SEED: Msg[] = [
  { id: 'seed-1', name: '数模小队', text: '用 Skill 跑了去年 C 题，EDA 报告自动生成真的省时间！', time: '2026-08-01 21:30' },
  { id: 'seed-2', name: '匿名队友', text: '期待美赛模板，AI-use 声明检查太实用了。', time: '2026-08-05 09:12' },
]

export default function Messages() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      setMessages(raw ? (JSON.parse(raw) as Msg[]) : SEED)
    } catch {
      setMessages(SEED)
    }
  }, [])

  const persist = (list: Msg[]) => {
    setMessages(list)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  }

  const submit = () => {
    if (!name.trim() || !text.trim()) {
      setError('请填写昵称和留言内容')
      return
    }
    const msg: Msg = {
      id: `${Date.now()}`,
      name: name.trim().slice(0, 20),
      text: text.trim().slice(0, 300),
      time: new Date().toLocaleString('zh-CN', { hour12: false }),
    }
    persist([msg, ...messages])
    setText('')
    setError('')
  }

  const remove = (id: string) => persist(messages.filter((m) => m.id !== id))

  return (
    <section id="messages" className="scroll-mt-20 bg-gradient-to-b from-white via-slate-100/70 to-white py-24">
      <div className="mx-auto max-w-3xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900">留言板</h2>
          <p className="mt-3 text-slate-600">使用反馈、改进建议、组队意向 —— 都欢迎写在这里。</p>
        </div>

        <Card className="mt-10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5 text-indigo-600" /> 写下你的想法
            </CardTitle>
            <CardDescription>留言保存在本地浏览器中（演示版，后续将接入后端与账号体系）。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="昵称" maxLength={20} />
            <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="留言内容……" className="min-h-[90px]" maxLength={300} />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button onClick={submit} className="bg-indigo-600 hover:bg-indigo-700">
              <Send className="mr-1 h-4 w-4" /> 发布留言
            </Button>
          </CardContent>
        </Card>

        <div className="mt-6 space-y-3">
          {messages.length === 0 && <p className="py-8 text-center text-sm text-slate-400">还没有留言，来抢沙发～</p>}
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
                      <span className="text-xs text-slate-400">{m.time}</span>
                      <button onClick={() => remove(m.id)} className="text-slate-300 transition-colors hover:text-red-500" aria-label="删除">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
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
