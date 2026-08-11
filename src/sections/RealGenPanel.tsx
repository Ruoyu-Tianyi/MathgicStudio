import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Rocket, Download, Loader2, CheckCircle2, XCircle, Clock, Search,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { ContestId } from '@/lib/workflow'

interface JobRow {
  id: string
  status: 'pending' | 'running' | 'done' | 'failed'
  stage: string | null
  result_file_path: string | null
  error: string | null
  created_at: string
}

interface Props {
  contest: ContestId
  problemText: string
}

const STORAGE_KEY = 'mathgic-job-id'
const POLL_MS = 15000

export default function RealGenPanel({ contest, problemText }: Props) {
  const [contact, setContact] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [job, setJob] = useState<JobRow | null>(null)
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null)
  const [queryId, setQueryId] = useState('')
  const [downloading, setDownloading] = useState(false)

  // 恢复上次任务
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) fetchJob(saved)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 轮询任务状态
  useEffect(() => {
    if (!job || job.status === 'done' || job.status === 'failed') return
    const t = setInterval(() => fetchJob(job.id), POLL_MS)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job?.id, job?.status])

  async function fetchJob(id: string) {
    const { data, error } = await supabase
      .from('jobs').select('id,status,stage,result_file_path,error,created_at')
      .eq('id', id).maybeSingle()
    if (error) {
      setNotice({ ok: false, text: `查询失败：${error.message}` })
      return
    }
    if (data) {
      setJob(data as JobRow)
      localStorage.setItem(STORAGE_KEY, id)
    } else {
      setNotice({ ok: false, text: '未找到该任务，请核对任务 ID' })
    }
  }

  async function handleSubmit() {
    setSubmitting(true)
    setNotice(null)
    const { data, error } = await supabase
      .from('jobs')
      .insert({ contest, problem_text: problemText, contact: contact || null })
      .select('id,status,stage,result_file_path,error,created_at')
      .single()
    setSubmitting(false)
    if (error) {
      setNotice({ ok: false, text: `提交失败：${error.message}` })
      return
    }
    setJob(data as JobRow)
    localStorage.setItem(STORAGE_KEY, data.id)
    setNotice({ ok: true, text: '任务已进入队列！Worker 领取后开始生成，可随时离开，凭任务 ID 回来查询。' })
  }

  async function handleDownload() {
    if (!job?.result_file_path) return
    setDownloading(true)
    const { data, error } = await supabase.storage
      .from('jobs').createSignedUrl(job.result_file_path, 3600)
    setDownloading(false)
    if (error || !data?.signedUrl) {
      setNotice({ ok: false, text: `获取下载链接失败：${error?.message ?? '未知错误'}` })
      return
    }
    window.open(data.signedUrl, '_blank')
  }

  const canSubmit = problemText.trim().length >= 10 && !submitting

  return (
    <div className="mt-16 border-t border-black/10 pt-12">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-slate-900">③ 真实生成（Beta 公测）</h3>
        <Badge className="bg-indigo-600">免费</Badge>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-slate-500">
        提交后由后台 Worker 调用 Kimi K3 模型执行完整五阶段工作流，产出可编辑的 Word 论文。
      </p>

      <div className="mt-5 max-w-3xl rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
        公测说明：初期为控制成本，后台 <strong>每 2 小时集中接单一次</strong>，从提交到交付可能需要数小时，
        提交后可随时离开——凭任务 ID 回来查询，或留下邮箱 / 微信，完成后作者会通知你。
        论文由完整五阶段工作流生成（含模型推导、代码与图表），公测期间免费，正式版将按次收费。
      </div>

      <div className="mt-6 space-y-4">
        {!job && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="邮箱 / 微信（建议填写，完成后通知你）"
              className="sm:max-w-xs"
            />
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {submitting ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Rocket className="mr-1 h-4 w-4" />}
              {submitting ? '提交中…' : '提交真实生成任务'}
            </Button>
            {problemText.trim().length < 10 && (
              <span className="text-xs text-slate-500">请先在上方 ① 中输入赛题（≥10 字）</span>
            )}
          </div>
        )}

        {notice && (
          <p className={`text-sm ${notice.ok ? 'text-green-600' : 'text-red-600'}`}>{notice.text}</p>
        )}

        {/* 任务状态 */}
        {job && (
          <div className="max-w-3xl rounded-lg bg-black/[0.03] p-4">
            <div className="flex flex-wrap items-center gap-2">
              {job.status === 'pending' && <Badge variant="outline" className="border-slate-300 text-slate-600"><Clock className="mr-1 h-3 w-3" /> 排队中</Badge>}
              {job.status === 'running' && <Badge variant="outline" className="border-indigo-400 bg-indigo-50 text-indigo-700"><Loader2 className="mr-1 h-3 w-3 animate-spin" /> 生成中</Badge>}
              {job.status === 'done' && <Badge variant="outline" className="border-green-300 bg-green-50 text-green-700"><CheckCircle2 className="mr-1 h-3 w-3" /> 已完成</Badge>}
              {job.status === 'failed' && <Badge variant="outline" className="border-red-300 bg-red-50 text-red-700"><XCircle className="mr-1 h-3 w-3" /> 失败</Badge>}
              {job.stage && job.status === 'running' && (
                <span className="text-sm text-indigo-700">当前阶段：{job.stage}</span>
              )}
            </div>
            <p className="mt-2 break-all font-mono text-xs text-slate-500">
              任务 ID：{job.id}（已自动保存在本机浏览器，刷新不丢失）
            </p>
            {job.error && <p className="mt-2 text-sm text-red-600">错误信息：{job.error}</p>}
            {job.status === 'done' && (
              <Button size="sm" onClick={handleDownload} disabled={downloading} className="mt-3 bg-green-600 hover:bg-green-700">
                {downloading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Download className="mr-1 h-3 w-3" />}
                下载论文 Word 文档
              </Button>
            )}
            {job.status === 'failed' && (
              <Button size="sm" variant="outline" className="mt-3 bg-white" onClick={() => { setJob(null); localStorage.removeItem(STORAGE_KEY) }}>
                重新提交
              </Button>
            )}
          </div>
        )}

        {/* 任务查询 */}
        <div className="flex items-center gap-2 pt-2">
          <Input
            value={queryId}
            onChange={(e) => setQueryId(e.target.value)}
            placeholder="输入任务 ID 查询进度 / 下载"
            className="max-w-md font-mono text-xs"
          />
          <Button variant="outline" size="sm" onClick={() => queryId.trim() && fetchJob(queryId.trim())}>
            <Search className="mr-1 h-3 w-3" /> 查询
          </Button>
        </div>
      </div>
    </div>
  )
}
