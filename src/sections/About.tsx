import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { GraduationCap, Mail, BookOpen } from 'lucide-react'
import GithubMark from '@/components/GithubMark'
import LinkedInMark from '@/components/LinkedInMark'

const SKILLS = ['数学建模', '金融市场分析', 'Python', 'LaTeX 排版', 'Agent 产品设计']

export default function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900">关于作者</h2>
        <p className="mt-3 text-slate-600">这个项目背后的工作流由参赛实战经验沉淀而成。</p>
      </div>

      <Card className="mx-auto mt-10 max-w-2xl">
        <CardContent className="flex flex-col items-center gap-6 p-8 sm:flex-row sm:items-start">
          <Avatar className="h-20 w-20 border-2 border-indigo-100">
            <AvatarFallback className="bg-indigo-600 text-2xl font-bold text-white">若</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-xl font-semibold text-slate-900">若瑜</h3>
            <p className="mt-1 flex items-center justify-center gap-1 text-sm text-slate-500 sm:justify-start">
              <GraduationCap className="h-4 w-4" /> 西南财经大学 · 独立个人开发者
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              把多次数模竞赛的解题流程沉淀为 math-modeling-contest Skill：从赛道判定、数据源路由、
              深度推理门禁到一键排版出片，全部规则写在公开仓库中，欢迎交流与共建。
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-1.5 sm:justify-start">
              {SKILLS.map((s) => (
                <Badge key={s} variant="secondary" className="bg-indigo-50 text-indigo-700">{s}</Badge>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-3 sm:justify-start">
              <Button size="sm" variant="outline" asChild>
                <a href="https://github.com/ruoyu-tianyi" target="_blank" rel="noreferrer">
                  <GithubMark className="mr-1 h-4 w-4" /> GitHub
                </a>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a href="https://github.com/Ruoyu-Tianyi/MathgicStudio/blob/main/skill/README.md" target="_blank" rel="noreferrer">
                  <BookOpen className="mr-1 h-4 w-4" /> 使用文档
                </a>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a href="mailto:ruoyu_tianyi@163.com">
                  <Mail className="mr-1 h-4 w-4" /> ruoyu_tianyi@163.com
                </a>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a href="https://www.linkedin.com/in/tianyizhou-chris" target="_blank" rel="noreferrer">
                  <LinkedInMark className="mr-1 h-4 w-4" /> LinkedIn
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
