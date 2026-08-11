import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X, Sigma } from 'lucide-react'
import GithubMark from '@/components/GithubMark'

const LINKS = [
  { href: '#contests', label: '赛事分类' },
  { href: '#workspace', label: '在线体验' },
  { href: '#pipeline', label: '工作流' },
  { href: '#about', label: '作者' },
  { href: '#messages', label: '留言' },
  { href: '#sponsor', label: '支持我们' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all ${
        scrolled ? 'border-b border-slate-200 bg-white/85 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center">
          <a href="#top" className="flex items-center gap-2 font-semibold text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Sigma className="h-4 w-4" />
            </span>
            Mathgic Studio
          </a>
          <span className="ml-3 hidden items-center gap-1.5 border-l border-slate-200 pl-3 text-sm text-slate-500 sm:flex">
            作者：若瑜
            <a
              href="https://github.com/ruoyu-tianyi"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 transition-colors hover:text-slate-900"
              aria-label="作者 GitHub 主页"
            >
              <GithubMark className="h-4 w-4" />
            </a>
          </span>
        </div>
        <nav className="hidden items-center gap-6 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-slate-600 transition-colors hover:text-indigo-600">
              {l.label}
            </a>
          ))}
          <Button size="sm" variant="outline" asChild>
            <a href="https://github.com/Ruoyu-Tianyi/MathgicStudio/tree/main/skill" target="_blank" rel="noreferrer">
              <GithubMark className="mr-1 h-4 w-4" /> Skill 源码
            </a>
          </Button>
        </nav>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="菜单">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm text-slate-700"
            >
              {l.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}
