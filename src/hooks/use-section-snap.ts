import { useEffect } from 'react'

const NAV_OFFSET = 72 // 固定导航栏高度补偿
const EDGE_TOLERANCE = 120 // 距区块边缘多少 px 内允许翻页
const DELTA_THRESHOLD = 40 // 滚轮增量累积阈值（兼容触控板小碎步）
const COOLDOWN = 900 // 翻页冷却，防止一次滚动连翻多页
const IDLE_RESET = 180 // 超过该间隔无滚动则清空累积量

/**
 * 滚轮辅助翻页：滚一下切到相邻区块开头。
 * 与 CSS proximity 吸附叠加，但解决了 proximity 只在边界附近才生效、体感太弱的问题。
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

      const sections = Array.from(document.querySelectorAll<HTMLElement>('section[id]'))
      if (sections.length === 0) return
      const y = window.scrollY
      const vh = window.innerHeight

      if (direction > 0) {
        // 当前可视区底部所在的区块若还有较多未读内容 → 放行自然滚动
        const current = [...sections].reverse().find((s) => s.offsetTop - NAV_OFFSET <= y + 10)
        if (current) {
          const remaining = current.offsetTop + current.offsetHeight - (y + vh)
          if (remaining > EDGE_TOLERANCE) return
        }
        const next = sections.find((s) => s.offsetTop - NAV_OFFSET > y + 10)
        if (!next) return
        e.preventDefault()
        jump(next.offsetTop - NAV_OFFSET)
      } else {
        // 不在任何区块开头附近 → 放行（先滚回当前区块开头）
        const current = [...sections].reverse().find((s) => s.offsetTop - NAV_OFFSET <= y + 10)
        if (current && y - (current.offsetTop - NAV_OFFSET) > EDGE_TOLERANCE) return
        const prev = [...sections].reverse().find((s) => s.offsetTop - NAV_OFFSET < y - 10)
        if (!prev) return
        e.preventDefault()
        jump(prev.offsetTop - NAV_OFFSET)
      }
    }

    const jump = (top: number) => {
      cooling = true
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
      setTimeout(() => (cooling = false), COOLDOWN)
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      window.removeEventListener('wheel', onWheel)
      clearTimeout(idleTimer)
    }
  }, [])
}
