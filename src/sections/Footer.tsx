import { Sigma } from 'lucide-react'
import GithubMark from '@/components/GithubMark'

export default function Footer() {
  return (
    <footer className="border-t border-black/10 bg-white py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center">
        <span className="flex items-center gap-2 font-semibold text-slate-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Sigma className="h-3.5 w-3.5" />
          </span>
          Mathgic Studio
        </span>
        <p className="max-w-xl text-sm text-slate-500">
          赛题进，论文出 —— 基于开源 math-modeling-contest Skill 的数学建模全自动工作流。
          演示数据仅用于功能展示，完整求解请通过任意Agent 在本地运行 Skill。
        </p>
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <a href="https://github.com/Ruoyu-Tianyi/MathgicStudio" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-indigo-600">
            <GithubMark className="h-4 w-4" /> GitHub
          </a>
          <a href="#about" className="hover:text-indigo-600">联系作者</a>
          <a href="#messages" className="hover:text-indigo-600">留言反馈</a>
        </div>
        <p className="text-xs text-slate-400">© 2026 若瑜 · Mathgic Studio · MIT License</p>
      </div>
    </footer>
  )
}
