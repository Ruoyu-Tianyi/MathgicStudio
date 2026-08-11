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
    <section id="contests" className="border-t border-black/10">
      <div className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-indigo-600">Contests</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-slate-900">选择你的赛场</h2>
        <p className="mt-3 max-w-2xl text-slate-600">国赛与美赛采用不同的论文结构、语言与排版规范，选择后在线体验区将自动切换配置。</p>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {(Object.keys(CONTESTS) as ContestId[]).map((id, idx) => {
            const c = CONTESTS[id]
            const active = selected === id
            return (
              <Reveal key={id} delay={idx * 140}>
                <div
                  onClick={() => onSelect(id)}
                  className={`h-full cursor-pointer rounded-xl p-8 transition-colors duration-200 ${
                    active ? 'bg-indigo-50' : 'bg-black/[0.03] hover:bg-black/[0.05]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="rounded px-2 py-0.5 text-xs font-semibold text-white"
                      style={{ backgroundColor: c.accent }}
                    >
                      {c.name}
                    </span>
                    {active && (
                      <span className="flex items-center gap-1 text-sm font-medium" style={{ color: c.accent }}>
                        <Check className="h-4 w-4" /> 已选择
                      </span>
                    )}
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-slate-900">{c.fullName}</h3>
                  <p className="mt-1 text-sm text-slate-500">{c.badge}</p>

                  <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <Globe className="h-4 w-4" /> {c.language}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {c.time}
                    </span>
                  </div>
                  <ul className="mt-4 space-y-2 border-t border-black/10 pt-4">
                    {c.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                        <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: c.accent }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={active ? 'default' : 'outline'}
                    className={`mt-6 w-full ${active ? '' : 'bg-white'}`}
                    style={active ? { backgroundColor: c.accent } : undefined}
                    asChild
                  >
                    <a href="#workspace">用{c.name}配置开始</a>
                  </Button>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
