# Mathgic Studio

> **Math × Magic —— 赛题进，论文出。**

数学建模竞赛全自动工作流的网页应用：输入赛题（文本或 PDF），输出结构完整的竞赛论文大纲，并完整呈现「审题 → 数据 → 建模 → 写作 → 交付」的五阶段自动化流水线。

**在线地址**：https://www.mathgic-studio.com/

## ✨ 功能特性

- 🏁 **双赛事配置**：国赛 CUMCM / 美赛 MCM-ICM 一键切换，论文结构、语言、排版规范各自适配
- 📄 **赛题输入**：粘贴文本，或直接上传 PDF（pdf.js 浏览器端解析，不上传服务器）
- 🧭 **真实赛道判定**：复刻 Skill 的 C 型（数据驱动）/ B 型（机理优化）信号计分规则，命中信号词逐条高亮
- ⚙️ **五阶段流水线演示**：P0 审题立项 → P1 数据获取 → P2 建模求解 → P3 论文写作 → P4 校验交付，终端日志流 + 门禁通过提示
- 📝 **论文大纲生成**：按所选赛事模板生成 Markdown 大纲，一键下载
- 💬 **留言板 / 作者页 / 赞赏渠道**：留言本地持久化，微信赞赏码已接入
- 🎢 **滚动视差设计**：Hero 多层视差 + 漂浮数学符号，区块滚动入场动画，尊重 `prefers-reduced-motion`

> 说明：网页端为交互演示与大纲生成。完整的五阶段求解（真实数据获取、代码运行、图表绘制、docx 排版）由 [`skill/`](skill/) 目录中的 math-modeling-contest Skill 在 Kimi Work 本地运行时执行。

## 🛠 技术栈

React 19 · TypeScript · Vite 7 · Tailwind CSS 3 · shadcn/ui · pdfjs-dist（动态导入分包）· lucide-react

## 🚀 本地开发

```bash
npm install
npm run dev       # 开发服务器（默认端口 3000）
npm run build     # 生产构建 → dist/
npm run preview   # 本地预览构建产物
```

## ☁️ 部署（Vercel）

本仓库根目录即为应用代码，Vercel **零配置**：

1. [vercel.com](https://vercel.com) → Add New → Project → Import `Ruoyu-Tianyi/Mathgic`
2. Framework 自动识别为 **Vite**，Build Command `npm run build`、Output Directory `dist` 全部自动填好，**无需修改任何设置**
3. Deploy，推送到 `main` 即自动重新部署

## 📂 仓库结构

```
├── src/                  # 应用源码
│   ├── sections/         # 页面区块（Hero / 赛事 / 体验区 / 工作流 / 作者 / 留言 / 赞助）
│   ├── components/       # Reveal 入场动画、GitHub/LinkedIn 经典图标等
│   ├── hooks/            # use-parallax 滚动视差
│   ├── lib/              # 赛道判定、五阶段数据、论文大纲生成、PDF 解析
│   └── pages/
├── skill/                # math-modeling-contest Skill 完整副本（SKILL.md / references / scripts / assets / docs）
└── index.html
```

Skill 的上游仓库：[Ruoyu-Tianyi/MathModeling](https://github.com/Ruoyu-Tianyi/MathModeling)

## 👤 作者

**若瑜** — [GitHub](https://github.com/ruoyu-tianyi) · [LinkedIn](https://www.linkedin.com/in/tianyizhou-chris) · ruoyu_tianyi@163.com

## 软件著作权

本平台已登记计算机软件著作权：

- 软件名称：Mathgic Studio 数学建模论文 Agent 工作平台 V1.0（简称：Mathgic Studio 平台）
- 著作权人：周天意
- 登记号：2026SR1152512（证书号：软著登字第 18366793 号）
- 登记日期：2026 年 11 月 9 日
- 在线查看（水印版）：https://www.tianyizhou.cn/certificates/mathgic-software-copyright

## License

自 2026-11-12 起，本仓库中的 Mathgic Studio 平台代码采用 [PolyForm Noncommercial License 1.0.0](LICENSE)：

- ✅ 可以阅读、学习、修改，并用于个人学习、研究、教学等**非商业**用途，需保留 LICENSE 中的版权声明；
- ❌ 任何**商业用途**（包括付费服务、商业产品集成、对外提供有偿建模或写作服务等）须事先取得作者书面授权，联系 contact@tianyizhou.cn。

`skill/` 目录是 [Ruoyu-Tianyi/MathModeling](https://github.com/Ruoyu-Tianyi/MathModeling) 的副本，仍按其自身的 MIT 许可发布。2026-11-12 之前已公开的版本按当时声明的 MIT 许可发布，相应副本继续适用 MIT。
