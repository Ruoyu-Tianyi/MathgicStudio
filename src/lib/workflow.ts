// ─────────────────────────────────────────────────────────────────────────────
// Mathgic Studio — 核心数据与逻辑
// 内容依据 math-modeling-contest SKILL.md 的五阶段工作流与赛道判定规则整理
// ─────────────────────────────────────────────────────────────────────────────

export type ContestId = 'cumcm' | 'mcm'

export interface Contest {
  id: ContestId
  name: string
  fullName: string
  badge: string
  accent: string // tailwind 色阶基色，用于卡片强调
  language: string
  time: string
  features: string[]
  paperSections: string[]
}

export const CONTESTS: Record<ContestId, Contest> = {
  cumcm: {
    id: 'cumcm',
    name: '国赛',
    fullName: 'CUMCM 全国大学生数学建模竞赛',
    badge: '中文论文 · 官方模板排版',
    accent: '#c2410c',
    language: '中文（术语保留英文）',
    time: '每年 9 月 · 3 天',
    features: [
      'A/B/C 题全覆盖：机理优化与数据驱动双赛道',
      '基于官方 cumcm-template.docx 排版：OMML 原生公式、三线表',
      'GB/T 7714 参考文献自动格式化',
      '摘要 200–400 字一段式，含具体数值结果',
    ],
    paperSections: [
      '摘要', '问题重述', '模型假设', '符号说明',
      '模型的建立与求解', '模型检验', '灵敏度分析', '模型评价与推广', '参考文献', '附录',
    ],
  },
  mcm: {
    id: 'mcm',
    name: '美赛',
    fullName: 'MCM/ICM 美国大学生数学建模竞赛',
    badge: 'English Paper · One-page Summary',
    accent: '#1d4ed8',
    language: 'English',
    time: '每年 1–2 月 · 4 天',
    features: [
      'MCM A–C / ICM D–F 题型路由与模型匹配',
      'One-page Summary 打磨：问题→方法→数字→结论',
      '英文科技写作规范，公式 LaTeX 全文一致',
      'AI-use 声明与引用格式检查',
    ],
    paperSections: [
      'Summary', 'Introduction', 'Assumptions & Justifications', 'Notation',
      'Model Development & Solution', 'Sensitivity Analysis', 'Model Evaluation', 'Conclusion', 'References', 'Appendices',
    ],
  },
}

// ── 五阶段流水线 ──────────────────────────────────────────────────────────────

export interface Stage {
  id: string
  name: string
  en: string
  gate: string
  detail: string
  outputs: string[]
  logs: string[]
}

export const STAGES: Stage[] = [
  {
    id: 'P0',
    name: '审题立项',
    en: 'Problem Analysis',
    gate: '产出《问题分析》',
    detail:
      '读取赛题全文，按信号清单逐问计分判定赛道（C 型数据驱动 / B 型机理优化），拆解子问题 Q1…Qn，做题型→模型路由，绘制技术路线图；推导稿先行，代码只许实现推导结论。',
    outputs: ['问题分析.md', '技术路线图', 'derivations.md 推导稿'],
    logs: [
      '读取赛题文本，抽取各问题干 …',
      '逐问统计 C 型 / B 型信号并计分',
      '赛道判定完成，路由至对应方法论',
      '拆解子问题并匹配候选模型',
      '生成技术路线图与推导稿骨架',
    ],
  },
  {
    id: 'P1',
    name: '数据获取',
    en: 'Data Acquisition',
    gate: '数据落盘 data/ 且来源可溯',
    detail:
      '金融/宏观/行业真实数据走 Wind、Gildata、World Bank、IMF 等数据源；取不到的数据改为可复现仿真并在假设中声明。铁律：不编造数据。',
    outputs: ['data/ 原始数据', 'SOURCES.md 溯源记录'],
    logs: [
      '按 data-sources 路由选择数据源',
      '下载数据并保存至 data/（带来源与日期）',
      '逐条记录 SOURCES.md：接口、参数、取数时间',
      'C 型赛题：运行 eda.py 一键数据探查',
    ],
  },
  {
    id: 'P2',
    name: '建模求解',
    en: 'Modeling & Solving',
    gate: '每问跑通 + 检验 + 六检查 + 红队',
    detail:
      '每问独立脚本从 data/ 读数；模型建立后先过量纲/退化/不变量/界/良态性/反例六检查，跑通后做 ≥3 个对抗场景红队测试；每问必含模型检验与灵敏度分析。',
    outputs: ['code/q*.py', 'figures/', 'results/', '灵敏度报告'],
    logs: [
      '按推导稿实现 Q1 求解脚本 …',
      '六检查通过：量纲 ✓ 退化 ✓ 界 ✓ …',
      '红队对抗：极端比例 / 噪声注入 / 边界样本',
      '灵敏度扫描 ±5%~20%，输出 tornado 图',
      '模型检验：残差 / 拟合优度 / 对比基线',
    ],
  },
  {
    id: 'P3',
    name: '论文写作',
    en: 'Paper Writing',
    gate: '结构完整 + 摘要定稿 + 深度自检',
    detail:
      '按论文模板分节写作，先模型节后摘要；每个核心模型对照深度阶梯自报档位（至少一个 L2/L3）；公式 LaTeX、符号表统一、图表有编号有引用。',
    outputs: ['paper/paper.md', '摘要定稿'],
    logs: [
      '撰写模型建立与求解各节 …',
      '写入检验与灵敏度分析小节',
      '深度档位自检：核心模型 ≥ L2',
      '打磨摘要：问题→方法→数字→结论',
    ],
  },
  {
    id: 'P4',
    name: '校验交付',
    en: 'Check & Deliver',
    gate: 'precheck 通过 + 成稿 docx',
    detail:
      '一键出片：precheck 全量检查（章节完整性、图表引用、占位符、查重自检）→ 生成规范 docx → 导出 PDF；人工复核清单收尾。',
    outputs: ['paper.docx', 'paper.pdf', '支撑材料包'],
    logs: [
      'precheck：章节 / 图表 / 占位符扫描 …',
      'ERROR 0 项，WARN 逐条确认',
      '生成 docx（OMML 公式 + 三线表）',
      '导出 PDF，清理临时文件，交付 ✓',
    ],
  },
]

// ── 赛道判定（对应 SKILL.md P0 信号清单的前端复刻） ────────────────────────────

const C_SIGNALS = ['数据', '附件', 'excel', 'csv', 'xlsx', '分析', '预测', '评价', '识别', '因素', '统计', '样本', '回归', '分类', '聚类']
const B_SIGNALS = ['机理', '几何', '物理', '微分方程', '优化', '调度', '规划', '轨迹', '动力学', '传热', '受力', '结构', '运动', '仿真']
const ATTACHMENT_HINTS = ['附件', '数据文件', 'xlsx', 'csv', 'excel', '数据集']

export interface JudgeResult {
  cHits: string[]
  bHits: string[]
  verdict: 'C' | 'B'
  reason: string
}

export function judgeTrack(text: string): JudgeResult {
  const lower = text.toLowerCase()
  const cHits = C_SIGNALS.filter((s) => lower.includes(s.toLowerCase()))
  const bHits = B_SIGNALS.filter((s) => lower.includes(s.toLowerCase()))
  let verdict: 'C' | 'B'
  let reason: string
  if (cHits.length > bHits.length) {
    verdict = 'C'
    reason = `C 型信号 ${cHits.length} 个 > B 型信号 ${bHits.length} 个，判定为数据驱动赛道，走「清洗 → EDA → 统计 → 建模 → 决策」流程。`
  } else if (bHits.length > cHits.length) {
    verdict = 'B'
    reason = `B 型信号 ${bHits.length} 个 > C 型信号 ${cHits.length} 个，判定为机理/优化赛道，走机理建模 + 无噪声验证 + 多解性检验流程。`
  } else {
    // 信号打平 → 按"数据附件有无"一票裁决
    const hasAttachment = ATTACHMENT_HINTS.some((s) => lower.includes(s))
    verdict = hasAttachment ? 'C' : 'B'
    reason = hasAttachment
      ? '信号打平，检测到数据附件线索，按规则一票裁决为 C 型（数据驱动）。'
      : '信号打平，未检测到数据附件，按规则一票裁决为 B 型（机理/优化）。'
  }
  return { cHits, bHits, verdict, reason }
}

// ── 示例赛题 ──────────────────────────────────────────────────────────────────

export interface SampleProblem {
  contest: ContestId
  title: string
  text: string
}

export const SAMPLE_PROBLEMS: SampleProblem[] = [
  {
    contest: 'cumcm',
    title: '示例 · 城市空气质量评价与预测（C 型）',
    text: `某市生态环境局提供了近三年六个监测站的空气质量监测数据（见附件 air_quality.xlsx，包含 PM2.5、PM10、SO2、NO2、CO、O3 逐小时浓度及气象字段，样本量约 5 万条）。请完成：
问题一：对数据进行清洗与统计分析，识别主要污染因子，建立空气质量综合评价模型，给出各监测站的评价结果与排名。
问题二：分析各污染物浓度与气象因素的相关性，建立 PM2.5 浓度的预测模型，预测未来 72 小时浓度并给出预测区间。
问题三：基于评价与预测结果，为环保部门提出差异化的管控建议。`,
  },
  {
    contest: 'cumcm',
    title: '示例 · 无人机遂行编队飞行（B 型）',
    text: `无人机集群在遂行编队飞行时，为减少外界干扰，拟保持电磁静默，仅通过方向信息进行定位调整。已知编队由 1 架发射机与若干接收机构成，发射机位于圆周中心，其余沿圆周均匀分布。请建立几何定位模型：
问题一：基于纯方位无源定位机理，推导接收机的定位方程，分析定位误差的几何传播规律。
问题二：在初始位置存在微小偏差时，设计编队调整为正多边形的最优调度方案，使调整总路径最短。
问题三：考虑实际中的噪声干扰，讨论模型的鲁棒性与误差地板。`,
  },
  {
    contest: 'mcm',
    title: 'Sample · Sustainable Tourism (ICM-style)',
    text: `A coastal city relies heavily on tourism. The tourism bureau provides five years of visitor statistics, hotel occupancy data, and environmental sensor readings (see attached tourism_data.csv, ~40,000 records). Build a mathematical model to:
Task 1: Analyze the data to identify the key factors driving tourism revenue and evaluate the sustainability of the current development pattern.
Task 2: Predict visitor volume for the next 24 months under different policy scenarios, and quantify the trade-off between revenue and environmental carrying capacity.
Task 3: Write a one-page memo to the mayor with data-driven recommendations.`,
  },
]

// ── 论文大纲生成 ──────────────────────────────────────────────────────────────

export function buildOutline(contest: Contest, judge: JudgeResult, problemText: string): string {
  const firstLine = problemText.split('\n').find((l) => l.trim().length > 4)?.trim() ?? '（未命名赛题）'
  const title = firstLine.length > 40 ? firstLine.slice(0, 40) + '…' : firstLine
  const trackName = judge.verdict === 'C' ? '数据驱动（C 型）' : '机理/优化（B 型）'
  const lines: string[] = []
  if (contest.id === 'cumcm') {
    lines.push(
      `# ${title}`,
      '',
      `> 赛道判定：${trackName} —— ${judge.reason}`,
      '',
      '## 摘要',
      '',
      '本文针对上述问题，首先……（方法）……，得到……（具体数值结果）……，最后通过灵敏度分析验证了模型的稳健性。',
      '',
      '**关键词：** ' + (judge.verdict === 'C' ? '综合评价；预测模型；灵敏度分析' : '机理建模；优化调度；误差分析'),
      '',
      '## 一、问题重述',
      '', '（按 Q1…Qn 拆解，标注题型与模型候选）', '',
      '## 二、模型假设', '', '1. 假设一（附合理性说明）', '2. 假设二……', '',
      '## 三、符号说明', '', '| 符号 | 含义 | 单位 |', '| --- | --- | --- |', '| x | 示例 | — |', '',
      '## 四、模型的建立与求解', '',
      judge.verdict === 'C'
        ? '### 4.1 数据预处理与 EDA\n（清洗 → 分布/相关/时序探查 → 自动发现列表）\n\n### 4.2 评价/预测模型建立\n（公式链推导 → 可解形式 → 求解）'
        : '### 4.1 机理分析与方程推导\n（定义与符号 → 引理 → 推导 → 可解形式）\n\n### 4.2 优化模型与求解算法\n（目标函数 → 约束 → 算法流程）',
      '',
      '## 五、模型检验', '', '（残差/拟合优度/收敛性/对比基线 + 红队对抗结论）', '',
      '## 六、灵敏度分析', '', '（关键参数 ±5%~20% 扰动曲线 + tornado 图）', '',
      '## 七、模型评价与推广', '', '### 7.1 优点', '### 7.2 缺点', '### 7.3 推广', '',
      '## 参考文献', '', '[1] （GB/T 7714 格式）', '',
      '## 附录', '', '（支撑代码清单与运行说明）',
    )
  } else {
    lines.push(
      `# ${title}`,
      '',
      `> Track Decision: ${judge.verdict === 'C' ? 'Data-driven (Track C)' : 'Mechanism/Optimization (Track B)'} — ${judge.reason}`,
      '',
      '## Summary',
      '',
      'We address the problem by ... (method) ..., obtain ... (quantitative results) ..., and verify robustness via sensitivity analysis.',
      '',
      '## 1 Introduction', '', '### 1.1 Problem Restatement', '### 1.2 Our Work', '',
      '## 2 Assumptions & Justifications', '',
      '## 3 Notation', '', '| Symbol | Description | Unit |', '| --- | --- | --- |', '| x | example | — |', '',
      '## 4 Model Development & Solution', '',
      '## 5 Sensitivity Analysis', '',
      '## 6 Model Evaluation', '', '### 6.1 Strengths', '### 6.2 Weaknesses', '',
      '## 7 Conclusion', '',
      '## References', '',
      '## Appendices', '',
      '## Report on Use of AI', '',
    )
  }
  return lines.join('\n')
}
