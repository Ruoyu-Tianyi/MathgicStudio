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
    <section id="sponsor" className="border-t border-black/10">
      <div className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-indigo-600">Support</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-slate-900">支持这个项目</h2>
        <p className="mt-3 max-w-2xl text-slate-600">
          微信赞赏渠道已开放（见下方二维码）；进阶版 / 团队版付费订阅正在筹备中 —— 核心 Skill 永远开源，付费仅面向云端算力与协作服务。
        </p>

        {/* 方案三栏：发丝线分隔，无卡片 */}
        <div className="mt-12 grid gap-8 border-y border-black/10 py-10 md:grid-cols-3 md:gap-0 md:divide-x md:divide-black/10">
          {PLANS.map((p) => (
            <div key={p.name} className="md:px-8 md:first:pl-0 md:last:pr-0">
              <div className="flex items-center justify-between">
                <p.icon className={`h-6 w-6 ${p.active ? 'text-indigo-600' : 'text-slate-400'}`} />
                {!p.active && <Badge className="bg-amber-500 text-white">即将上线</Badge>}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{p.name}</h3>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{p.price}</p>
              <ul className="mt-5 space-y-2 border-t border-black/10 pt-4">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" /> {f}
                  </li>
                ))}
              </ul>
              <Button className={`mt-6 w-full ${p.active ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`} variant={p.active ? 'default' : 'outline'} disabled={!p.active}>
                {p.active ? '当前版本' : '敬请期待'}
              </Button>
            </div>
          ))}
        </div>

        {/* 赞赏渠道 */}
        <div className="mx-auto mt-12 flex max-w-md flex-col items-center text-center">
          <img
            src={sponsorQr}
            alt="微信支付赞赏码"
            className="w-52 rounded-xl"
          />
          <p className="mt-4 text-sm font-medium text-slate-700">微信扫一扫，请作者喝杯咖啡 ☕</p>
          <p className="mt-1 text-xs text-slate-400">
            赞赏将用于服务器与 API 成本，核心 Skill 永远开源免费。
          </p>
        </div>
      </div>
    </section>
  )
}
