import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Crown, Heart, Rocket } from 'lucide-react'
import sponsorQr from '@/assets/wechat-sponsor-qr.jpg'

const PLANS = [
  {
    icon: Rocket,
    name: '免费版',
    price: '¥0',
    features: ['赛道判定与论文大纲', '示例赛题体验', 'GitHub 开源 Skill 全部规则'],
    active: true,
  },
  {
    icon: Crown,
    name: '进阶版',
    price: '待定',
    features: ['完整五阶段云端求解', '真实数据源接入（Wind / World Bank 等）', 'docx / PDF 成稿下载', '灵敏度报告与红队测试详情'],
    active: false,
  },
  {
    icon: Heart,
    name: '团队版',
    price: '待定',
    features: ['三人协作项目空间', '历史版本与批注', '赛前集训题库与复盘模板'],
    active: false,
  },
]

export default function Sponsor() {
  return (
    <section id="sponsor" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900">支持这个项目</h2>
        <p className="mt-3 text-slate-600">
          微信赞赏渠道已开放（见下方二维码）；进阶版 / 团队版付费订阅正在筹备中 —— 核心 Skill 永远开源，付费仅面向云端算力与协作服务。
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {PLANS.map((p) => (
          <Card key={p.name} className={p.active ? 'border-2 border-indigo-600' : 'relative overflow-hidden'}>
            {!p.active && (
              <Badge className="absolute right-3 top-3 bg-amber-500 text-white">即将上线</Badge>
            )}
            <CardHeader>
              <p.icon className={`h-6 w-6 ${p.active ? 'text-indigo-600' : 'text-slate-400'}`} />
              <CardTitle className="pt-1">{p.name}</CardTitle>
              <CardDescription className="text-2xl font-bold text-slate-900">{p.price}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" /> {f}
                  </li>
                ))}
              </ul>
              <Button className="mt-6 w-full" variant={p.active ? 'default' : 'outline'} disabled={!p.active}>
                {p.active ? '当前版本' : '敬请期待'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 赞赏渠道 */}
      <Card className="mx-auto mt-10 max-w-md">
        <CardContent className="flex flex-col items-center p-8 text-center">
          <img
            src={sponsorQr}
            alt="微信支付赞赏码"
            className="w-52 rounded-xl border border-slate-200 shadow-sm"
          />
          <p className="mt-4 text-sm font-medium text-slate-700">微信扫一扫，请作者喝杯咖啡 ☕</p>
          <p className="mt-1 text-xs text-slate-400">
            赞赏将用于服务器与 API 成本，核心 Skill 永远开源免费。
          </p>
        </CardContent>
      </Card>
    </section>
  )
}
