import { useEffect } from 'react'

const NAV_OFFSET = 72 // 固定导航栏高度补偿
const EDGE_TOLERANCE = 120 // 距区块边缘多少 px 内允许翻页
const DELTA_THRESHOLD = 40 // 滚轮增量累积阈值（兼容触控板小碎步）
const IDLE_RESET = 180 // 超过该间隔无滚动则清空累积量
const MIN_DURATION = 550 // 翻页动画最短时长（ms）
const MAX_DURATION = 950 // 翻页动画最长时长（ms）

/**
 * 滚轮辅助翻页：滚一下切到相邻区块开头。
 * 与 CSS proximity 吸附叠加，但解决了 proximity 只在边界附近才生效、体感太弱的问题。
 *
 * 注意：区块位置的计算必须用 getBoundingClientRect（文档绝对位置），
 * 不能用 offsetTop —— 外层的 Reveal 动画容器带 transform/will-change，
 * 会成为 offsetParent，导致 offsetTop 是相对容器的局部值。
 *
 * 可达性保护：当前区块比视口高且下方还有未读内容时，不拦截滚轮（先读完再翻页）；
 * 向上滚动同理，先回到当前区块开头，再翻到上一区块。
 */
export function useSectionSnap() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(pointer: coarse)').matches) return // 触屏设备走原生滚动 + CSS 吸附

    let acc = 0
    let cooling = false
    let idleTimer: ReturnType<typeof setTimeout> | undefined

    const onWheel = (e: WheelEvent) => {
      if (cooling) {
        e.preventDefault()
        return
      }
      // 表单控件、文本域、内部滚动容器内不拦截
      const target = e.target as HTMLElement
      if (target.closest('textarea, input, [data-no-snap], .overflow-y-auto, .overflow-auto')) return

      acc += e.deltaY
      clearTimeout(idleTimer)
      idleTimer = setTimeout(() => (acc = 0), IDLE_RESET)
      if (Math.abs(acc) < DELTA_THRESHOLD) return

      const direction = acc > 0 ? 1 : -1
      acc = 0

      const y = window.scrollY
      const vh = window.innerHeight
      const sections = Array.from(document.querySelectorAll<HTMLElement>('section[id]')).map((el) => {
        const rect = el.getBoundingClientRect()
        return { top: rect.top + y, bottom: rect.bottom + y }
      })
      if (sections.length === 0) return

      const snapTop = (s: { top: number }) => s.top - NAV_OFFSET

      if (direction > 0) {
        // 当前可视区所在的区块若还有较多未读内容 → 放行自然滚动
        const current = [...sections].reverse().find((s) => snapTop(s) <= y + 10)
        if (current && current.bottom - (y + vh) > EDGE_TOLERANCE) return
        const next = sections.find((s) => snapTop(s) > y + 10)
        if (!next) return
        e.preventDefault()
        jump(snapTop(next))
      } else {
        // 不在当前区块开头附近 → 放行（先滚回当前区块开头）
        const current = [...sections].reverse().find((s) => snapTop(s) <= y + 10)
        if (current && y - snapTop(current) > EDGE_TOLERANCE) return
        const prev = [...sections].reverse().find((s) => snapTop(s) < y - 10)
        if (!prev) return
        e.preventDefault()
        jump(snapTop(prev))
      }
    }

    // easeInOutCubic：起步柔和、中段利落、收尾渐停
    const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

    const jump = (top: number) => {
      cooling = true
      const startY = window.scrollY
      const target = Math.max(0, top)
      const dist = target - startY
      // 时长随距离自适应：跨得越远稍久一点，但有上下限
      const duration = Math.min(MAX_DURATION, Math.max(MIN_DURATION, Math.abs(dist) * 0.55))
      const t0 = performance.now()

      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / duration)
        // 每帧用 instant 定位，避免 CSS scroll-behavior: smooth 与逐帧动画打架
        window.scrollTo({ top: startY + dist * easeInOutCubic(p), behavior: 'instant' })
        if (p < 1) {
          requestAnimationFrame(step)
        } else {
          // 动画结束后短暂冷却，防止一次滚动的余量触发连翻
          setTimeout(() => (cooling = false), 120)
        }
      }
      requestAnimationFrame(step)
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      window.removeEventListener('wheel', onWheel)
      clearTimeout(idleTimer)
    }
  }, [])
}
