import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { STAGES } from '@/lib/workflow'
import { ArrowRight, Milestone } from 'lucide-react'

export default function Pipeline() {
  return (
    <section id="pipeline" className="border-t border-black/10">
      <div className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-indigo-600">Pipeline</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-slate-900">五阶段门禁流水线</h2>
        <p className="mt-3 max-w-2xl text-slate-600">
          每个阶段设有完成门禁（Gate），未过门禁不进入下一阶段 —— 宁用简单模型 + 完整检验，不用复杂模型 + 无检验。
        </p>

        {/* 阶段链条：纯文字链，无盒子 */}
        <div className="mt-10 flex flex-wrap items-center gap-x-2 gap-y-3 font-mono text-sm">
          {STAGES.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <span>
                <span className="font-bold text-indigo-600">{s.id}</span>
                <span className="ml-1.5 text-slate-800">{s.name}</span>
              </span>
              {i < STAGES.length - 1 && <ArrowRight className="h-4 w-4 text-slate-300" />}
            </div>
          ))}
        </div>

        {/* 手风琴：发丝线分隔行 */}
        <Accordion type="multiple" className="mt-8 border-y border-black/10">
          {STAGES.map((s) => (
            <AccordionItem key={s.id} value={s.id} className="border-black/10 px-2">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex flex-wrap items-center gap-3 text-left">
                  <span className="font-mono text-sm font-bold text-indigo-600">{s.id}</span>
                  <span className="font-semibold text-slate-900">{s.name}</span>
                  <span className="text-sm text-slate-400">{s.en}</span>
                  <Badge variant="outline" className="ml-auto hidden border-amber-300 text-amber-700 sm:inline-flex">
                    <Milestone className="mr-1 h-3 w-3" /> {s.gate}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <p className="max-w-3xl text-sm leading-relaxed text-slate-600">{s.detail}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {s.outputs.map((o) => (
                    <Badge key={o} variant="secondary" className="bg-indigo-50 text-indigo-700">
                      {o}
                    </Badge>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
