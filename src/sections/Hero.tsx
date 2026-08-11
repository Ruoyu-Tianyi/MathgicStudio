import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, FileText, ShieldCheck, GitBranch, Languages } from 'lucide-react'
import GithubMark from '@/components/GithubMark'
import { useParallax } from '@/hooks/use-parallax'
import type { CSSProperties } from 'react'

const STATS = [
  { icon: GitBranch, label: '五阶段门禁流水线', value: 'P0 → P4' },
  { icon: ShieldCheck, label: '检验 + 灵敏度全覆盖', value: '6 检查 · 红队' },
  { icon: Languages, label: '国赛 / 美赛双语论文', value: 'CUMCM / MCM' },
  { icon: FileText, label: '一键出片 · 输出可编辑 Word', value: 'PDF/Markdown → Docx/PDF' },
]

// 漂浮数学符号：位置 / 视差速度 / 浮动节奏 / 透明度分层
const SYMBOLS: { ch: string; className: string; speed: number; duration: number; rotate: number }[] = [
  { ch: '∑', className: 'left-[6%] top-24 text-7xl text-indigo-300/50', speed: 0.28, duration: 7, rotate: -8 },
  { ch: 'π', className: 'right-[8%] top-40 text-6xl text-sky-300/50', speed: 0.18, duration: 8.5, rotate: 6 },
  { ch: '∫', className: 'left-[16%] top-[420px] text-6xl text-indigo-200/60', speed: -0.12, duration: 9, rotate: 4 },
  { ch: '∞', className: 'right-[14%] top-[480px] text-7xl text-indigo-300/40', speed: -0.2, duration: 7.5, rotate: -5 },
  { ch: 'Δ', className: 'left-[38%] top-16 text-5xl text-sky-200/60', speed: 0.36, duration: 6.5, rotate: 10 },
  { ch: '√', className: 'right-[32%] top-24 text-5xl text-indigo-200/50', speed: 0.3, duration: 8, rotate: -6 },
  { ch: 'λ', className: 'left-[24%] top-[300px] text-4xl text-indigo-300/40', speed: -0.26, duration: 9.5, rotate: 8 },
  { ch: '≈', className: 'right-[24%] top-[340px] text-4xl text-sky-300/40', speed: -0.16, duration: 7.2, rotate: -10 },
]

function ParallaxSymbol({ s }: { s: (typeof SYMBOLS)[number] }) {
  const ref = useParallax<HTMLDivElement>(s.speed)
  return (
    <div ref={ref} className={`pointer-events-none absolute select-none ${s.className}`} aria-hidden="true">
      <span
        className="float-slow block font-serif"
        style={{ '--float-duration': `${s.duration}s`, '--float-rotate': `${s.rotate}deg` } as CSSProperties}
      >
        {s.ch}
      </span>
    </div>
  )
}

export default function Hero() {
  const blobRight = useParallax<HTMLDivElement>(0.22)
  const blobLeft = useParallax<HTMLDivElement>(-0.14)

  return (
    <section id="top" className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white pb-16 pt-32">
      {/* 视差背景光斑 */}
      <div ref={blobRight} className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-indigo-100/60 blur-3xl" aria-hidden="true" />
      <div ref={blobLeft} className="pointer-events-none absolute left-0 top-40 h-72 w-72 rounded-full bg-sky-100/50 blur-3xl" aria-hidden="true" />

      {/* 视差漂浮符号层 */}
      <div className="absolute inset-0 hidden md:block" aria-hidden="true">
        {SYMBOLS.map((s) => (
          <ParallaxSymbol key={s.ch} s={s} />
        ))}
      </div>

      <div className="relative mx-auto max-w-6xl px-4 text-center">
        <Badge variant="secondary" className="mb-6 border border-indigo-200 bg-white px-4 py-1 text-indigo-700">
          基于 math-modeling-contest Skill · 全自动建模工作流
        </Badge>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-6xl">
          赛题进，<span className="text-indigo-600">论文出</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          输入数学建模赛题，自动完成 审题立项 → 数据获取 → 建模求解 → 论文写作 → 校验交付
          五个阶段，产出可直接提交、含模型推导、可运行代码与规范图表的完整竞赛论文。
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" asChild className="bg-indigo-600 hover:bg-indigo-700">
            <a href="#workspace">
              立即体验 <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="https://github.com/Ruoyu-Tianyi/MathModeling" target="_blank" rel="noreferrer">
              <GithubMark className="mr-1 h-4 w-4" /> GitHub 仓库
            </a>
          </Button>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-200 bg-white/80 p-4 text-left shadow-sm backdrop-blur-sm">
              <s.icon className="h-5 w-5 text-indigo-600" />
              <div className={`mt-2 font-semibold text-slate-900 ${s.value.length > 12 ? 'break-words text-sm leading-snug' : 'text-lg'}`}>{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
