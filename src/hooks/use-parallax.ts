import { useEffect, useRef } from 'react'

/**
 * 滚动视差 hook：元素随页面滚动按 speed 比例垂直位移。
 * speed > 0 向下漂移（背景层常用），speed < 0 逆向漂移（前景层常用）。
 * 仅写 transform，rAF 节流，不触发 React 重渲染。
 */
export function useParallax<T extends HTMLElement>(speed: number) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0
    const update = () => {
      raf = 0
      el.style.transform = `translate3d(0, ${(window.scrollY * speed).toFixed(1)}px, 0)`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [speed])

  return ref
}
