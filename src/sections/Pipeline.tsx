import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { STAGES } from '@/lib/workflow'
import { ArrowRight, Milestone } from 'lucide-react'

export default function Pipeline() {
  return (
    <section id="pipeline" className="scroll-mt-20 bg-gradient-to-b from-white via-slate-100/70 to-white py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900">五阶段门禁流水线</h2>
          <p className="mt-3 text-slate-600">
            每个阶段设有完成门禁（Gate），未过门禁不进入下一阶段 —— 宁用简单模型 + 完整检验，不用复杂模型 + 无检验。
          </p>
        </div>

        {/* 阶段链条 */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {STAGES.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className="rounded-lg border border-indigo-200 bg-white px-4 py-2 text-center shadow-sm">
                <div className="text-xs font-bold text-indigo-600">{s.id}</div>
                <div className="text-sm font-medium text-slate-800">{s.name}</div>
              </div>
              {i < STAGES.length - 1 && <ArrowRight className="h-4 w-4 text-slate-400" />}
            </div>
          ))}
        </div>

        <Accordion type="single" collapsible className="mx-auto mt-8 max-w-3xl">
          {STAGES.map((s) => (
            <AccordionItem key={s.id} value={s.id} className="rounded-lg border border-slate-200 bg-white px-4">
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
                <p className="text-sm leading-relaxed text-slate-600">{s.detail}</p>
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
