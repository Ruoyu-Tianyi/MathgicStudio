import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Play, Download, RotateCcw, FlaskConical, CheckCircle2, Loader2,
  Database, Cog, FileText, Sparkles, FileUp,
} from 'lucide-react'
import {
  CONTESTS, STAGES, SAMPLE_PROBLEMS, judgeTrack, buildOutline,
  type ContestId, type JudgeResult,
} from '@/lib/workflow'
import { extractPdfText } from '@/lib/pdf'
import RealGenPanel from '@/sections/RealGenPanel'

type Phase = 'input' | 'running' | 'done'

interface Props {
  contest: ContestId
  onContestChange: (id: ContestId) => void
}

export default function Workspace({ contest, onContestChange }: Props) {
  const [problemText, setProblemText] = useState('')
  const [judge, setJudge] = useState<JudgeResult | null>(null)
  const [phase, setPhase] = useState<Phase>('input')
  const [stageIdx, setStageIdx] = useState(0)
  const [logLines, setLogLines] = useState<string[]>([])
  const [outline, setOutline] = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfNotice, setPdfNotice] = useState<{ ok: boolean; text: string } | null>(null)
  const [problemFile, setProblemFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const logRef = useRef<HTMLDivElement>(null)

  const c = CONTESTS[contest]
  const samples = SAMPLE_PROBLEMS.filter((s) => s.contest === contest)

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' })
  }, [logLines])

  const handleJudge = () => {
    if (problemText.trim().length < 10) return
    setJudge(judgeTrack(problemText))
  }

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // 允许重复选择同一文件
    if (!file) return
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setPdfNotice({ ok: false, text: '仅支持 PDF 文件' })
      return
    }
    setPdfLoading(true)
    setPdfNotice(null)
    try {
      const text = await extractPdfText(file)
      if (text.trim().length < 10) {
        setPdfNotice({ ok: false, text: '未能从 PDF 中提取到文字（扫描件/图片型 PDF 暂不支持，请粘贴文本）' })
      } else {
        setProblemText(text)
        setProblemFile(file) // 保留原始 PDF，提交真实生成任务时一并上传给 Worker
        setJudge(judgeTrack(text)) // 上传完成即自动判定赛道并高亮信号词
        setPdfNotice({ ok: true, text: `已从「${file.name}」提取 ${text.length} 字符并自动完成赛道判定，可在下方编辑修正` })
      }
    } catch {
      setPdfNotice({ ok: false, text: 'PDF 解析失败，请检查文件是否加密或损坏' })
    } finally {
      setPdfLoading(false)
    }
  }

  const handleRun = () => {
    const j = judge ?? judgeTrack(problemText)
    setJudge(j)
    setPhase('running')
    setStageIdx(0)
    setLogLines([])
    setOutline('')

    // 依次推进五个阶段，逐条打印日志
    let delay = 400
    STAGES.forEach((stage, si) => {
      timers.current.push(setTimeout(() => {
        setStageIdx(si)
        setLogLines((prev) => [...prev, `▶ [${stage.id}] ${stage.name} — 开始`])
      }, delay))
      stage.logs.forEach((log) => {
        delay += 520
        timers.current.push(setTimeout(() => {
          setLogLines((prev) => [...prev, `   ${log}`])
        }, delay))
      })
      delay += 300
      timers.current.push(setTimeout(() => {
        setLogLines((prev) => [...prev, `✓ [${stage.id}] 门禁通过：${stage.gate}`])
      }, delay))
      delay += 350
    })
    timers.current.push(setTimeout(() => {
      setOutline(buildOutline(c, j, problemText))
      setPhase('done')
    }, delay + 200))
  }

  const handleReset = () => {
    timers.current.forEach(clearTimeout)
    setPhase('input')
    setJudge(null)
    setLogLines([])
    setOutline('')
    setStageIdx(0)
    setPdfNotice(null)
    setProblemFile(null)
  }

  const handleDownload = () => {
    const blob = new Blob([outline], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `paper-outline-${contest}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const progress = phase === 'done' ? 100 : phase === 'running' ? Math.round(((stageIdx + 0.5) / STAGES.length) * 100) : 0

  return (
    <section id="workspace" className="border-t border-black/10">
      <div className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-indigo-600">Playground</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-slate-900">在线体验</h2>
        <p className="mt-3 max-w-2xl text-slate-600">粘贴赛题文本或直接上传 PDF，体验赛道判定与五阶段流水线，生成专属论文大纲。</p>

        <div className="mt-8 max-w-3xl rounded-lg bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
          当前为<strong>演示模式</strong>：赛道判定为真实规则（复刻 Skill 的信号计分逻辑），流水线为过程演示。
          完整求解由 Kimi + math-modeling-contest Skill 在本地执行，产出含真实数据、代码与图表的可提交论文。
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* 左列：输入 */}
          <div>
            <div className="flex items-center justify-between border-b border-black/10 pb-4">
              <h3 className="text-lg font-semibold text-slate-900">① 输入赛题</h3>
              <Tabs value={contest} onValueChange={(v) => onContestChange(v as ContestId)}>
                <TabsList>
                  <TabsTrigger value="cumcm">国赛 CUMCM</TabsTrigger>
                  <TabsTrigger value="mcm">美赛 MCM/ICM</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <p className="mt-3 text-sm text-slate-500">当前配置：{c.fullName} · 论文语言 {c.language}</p>

            <div className="mt-5 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <input ref={fileRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={handlePdfUpload} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                  disabled={pdfLoading || phase === 'running'}
                  className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                >
                  {pdfLoading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <FileUp className="mr-1 h-3 w-3" />}
                  {pdfLoading ? '正在解析 PDF…' : '上传 PDF 赛题'}
                </Button>
                {samples.map((s) => (
                  <Button
                    key={s.title}
                    variant="outline"
                    size="sm"
                    onClick={() => { setProblemText(s.text); setJudge(null); setPdfNotice(null); setProblemFile(null); handleResetText() }}
                  >
                    <Sparkles className="mr-1 h-3 w-3" /> {s.title}
                  </Button>
                ))}
              </div>
              {pdfNotice && (
                <p className={`text-xs ${pdfNotice.ok ? 'text-green-600' : 'text-red-600'}`}>{pdfNotice.text}</p>
              )}
              <Textarea
                value={problemText}
                onChange={(e) => { setProblemText(e.target.value); setJudge(null); setProblemFile(null) }}
                placeholder="在此粘贴赛题全文（含各小问）……"
                className="min-h-[220px] font-mono text-sm"
                disabled={phase === 'running'}
              />
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleJudge} disabled={problemText.trim().length < 10 || phase === 'running'}>
                  <FlaskConical className="mr-1 h-4 w-4" /> 判定赛道
                </Button>
                <Button
                  onClick={handleRun}
                  disabled={problemText.trim().length < 10 || phase === 'running'}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {phase === 'running' ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Play className="mr-1 h-4 w-4" />}
                  {phase === 'running' ? '流水线运行中…' : '开始建模'}
                </Button>
                {phase !== 'input' && (
                  <Button variant="ghost" onClick={handleReset}>
                    <RotateCcw className="mr-1 h-4 w-4" /> 重置
                  </Button>
                )}
              </div>

              {/* 赛道判定结果 */}
              {judge && phase === 'input' && (
                <div className="rounded-lg bg-black/[0.03] p-4">
                  <div className="flex items-center gap-2">
                    {judge.verdict === 'C'
                      ? <Database className="h-5 w-5 text-orange-600" />
                      : <Cog className="h-5 w-5 text-blue-600" />}
                    <span className="font-semibold text-slate-900">
                      判定为 {judge.verdict} 型（{judge.verdict === 'C' ? '数据驱动' : '机理/优化'}）
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{judge.reason}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {judge.cHits.map((h) => <Badge key={h} variant="secondary" className="bg-orange-100 text-orange-800">C · {h}</Badge>)}
                    {judge.bHits.map((h) => <Badge key={h} variant="secondary" className="bg-blue-100 text-blue-800">B · {h}</Badge>)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 右列：流水线 + 输出 */}
          <div>
            <div className="border-b border-black/10 pb-4">
              <h3 className="text-lg font-semibold text-slate-900">② 流水线执行</h3>
            </div>
            <p className="mt-3 text-sm text-slate-500">P0 审题 → P1 数据 → P2 建模 → P3 写作 → P4 交付，每阶段过门禁后推进。</p>

            <div className="mt-5 space-y-4">
              <div className="flex items-center gap-3">
                <Progress value={progress} className="h-2 flex-1" />
                <span className="w-12 text-right text-sm font-medium text-slate-600">{progress}%</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {STAGES.map((s, i) => {
                  const state = phase === 'done' || i < stageIdx ? 'done' : i === stageIdx && phase === 'running' ? 'active' : 'idle'
                  return (
                    <Badge
                      key={s.id}
                      variant="outline"
                      className={
                        state === 'done'
                          ? 'border-green-300 bg-green-50 text-green-700'
                          : state === 'active'
                            ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                            : 'text-slate-400'
                      }
                    >
                      {state === 'done' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                      {state === 'active' && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                      {s.id} {s.name}
                    </Badge>
                  )
                })}
              </div>

              <div
                ref={logRef}
                className="h-[240px] overflow-y-auto rounded-lg bg-slate-900 p-4 font-mono text-xs leading-relaxed"
              >
                {logLines.length === 0 ? (
                  <span className="text-slate-500">// 等待运行 —— 输入赛题后点击「开始建模」</span>
                ) : (
                  logLines.map((l, i) => (
                    <div key={i} className={l.startsWith('✓') ? 'text-green-400' : l.startsWith('▶') ? 'text-sky-300' : 'text-slate-300'}>
                      {l}
                    </div>
                  ))
                )}
                {phase === 'done' && <div className="mt-1 text-green-400">★ 全流程完成，论文大纲已生成 ↓</div>}
              </div>

              {/* 输出 */}
              {phase === 'done' && outline && (
                <div className="rounded-lg bg-green-50/70">
                  <div className="flex items-center justify-between border-b border-green-200/60 px-4 py-2">
                    <span className="flex items-center gap-2 text-sm font-semibold text-green-800">
                      <FileText className="h-4 w-4" /> 论文大纲（{c.name}模板 · {c.language}）
                    </span>
                    <Button size="sm" variant="outline" className="bg-white" onClick={handleDownload}>
                      <Download className="mr-1 h-3 w-3" /> 下载 .md
                    </Button>
                  </div>
                  <pre className="max-h-[280px] overflow-auto whitespace-pre-wrap p-4 font-mono text-xs leading-relaxed text-slate-700">
                    {outline}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 真实生成任务（后台 Worker + Kimi K3） */}
        <RealGenPanel contest={contest} problemText={problemText} problemFile={problemFile} />
      </div>
    </section>
  )

  function handleResetText() {
    if (phase !== 'input') handleReset()
  }
}
