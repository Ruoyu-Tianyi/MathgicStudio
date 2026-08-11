import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, Clock, Globe } from 'lucide-react'
import { CONTESTS, type ContestId } from '@/lib/workflow'
import Reveal from '@/components/Reveal'

interface Props {
  selected: ContestId
  onSelect: (id: ContestId) => void
}

export default function Contests({ selected, onSelect }: Props) {
  return (
    <section id="contests" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900">选择你的赛场</h2>
        <p className="mt-3 text-slate-600">国赛与美赛采用不同的论文结构、语言与排版规范，选择后在线体验区将自动切换配置。</p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {(Object.keys(CONTESTS) as ContestId[]).map((id, idx) => {
          const c = CONTESTS[id]
          const active = selected === id
          return (
            <Reveal key={id} delay={idx * 140}>
              <Card
                onClick={() => onSelect(id)}
                className={`h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                  active ? 'border-2 shadow-md' : 'border border-slate-200'
                }`}
                style={active ? { borderColor: c.accent } : undefined}
              >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge style={{ backgroundColor: c.accent }} className="text-white">
                    {c.name}
                  </Badge>
                  {active && (
                    <span className="flex items-center gap-1 text-sm font-medium" style={{ color: c.accent }}>
                      <Check className="h-4 w-4" /> 已选择
                    </span>
                  )}
                </div>
                <CardTitle className="pt-2 text-xl">{c.fullName}</CardTitle>
                <CardDescription>{c.badge}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex flex-wrap gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <Globe className="h-4 w-4" /> {c.language}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" /> {c.time}
                  </span>
                </div>
                <ul className="space-y-2">
                  {c.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: c.accent }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={active ? 'default' : 'outline'}
                  className="mt-6 w-full"
                  style={active ? { backgroundColor: c.accent } : undefined}
                  asChild
                >
                  <a href="#workspace">用{c.name}配置开始</a>
                </Button>
              </CardContent>
              </Card>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
