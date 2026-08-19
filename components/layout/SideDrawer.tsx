'use client'

import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'
import { ChevronLeft, Search, Clock, Layers, Plus, Tags } from 'lucide-react'
import { Tooltip } from '@/components/common/Tooltip'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function SideDrawer() {
  const { isDrawerOpen, toggleDrawer } = useUIStore()
  const pathname = usePathname()

  const navItems = [
    {
      label: '时间线',
      href: '/',
      icon: <Clock className="w-4 h-4" />,
    },
    {
      label: '标签视图',
      href: '/topics',
      icon: <Layers className="w-4 h-4" />,
    },
    {
      label: '搜索',
      href: '/search',
      icon: <Search className="w-4 h-4" />,
    },
    {
      label: '标签管理',
      href: '/tags',
      icon: <Tags className="w-4 h-4" />,
    },
  ]

  return (
    <aside
      className={cn(
        'h-full bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out',
        isDrawerOpen ? 'w-64' : 'w-14'
      )}
    >
      {/* Toggle button */}
      <div className="flex items-center justify-end p-2">
        <button
          onClick={toggleDrawer}
          className="p-1.5 rounded-md hover:bg-accent text-muted-foreground transition-colors"
        >
          <ChevronLeft
            className={cn(
              'w-4 h-4 transition-transform duration-300',
              !isDrawerOpen && 'rotate-180'
            )}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="px-2 space-y-1">
        {navItems.map((item) => (
          <Tooltip key={item.href} content={item.label}>
            <Link
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                pathname === item.href
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              {item.icon}
              {isDrawerOpen && <span>{item.label}</span>}
            </Link>
          </Tooltip>
        ))}
      </nav>

      <div className="flex-1" />

      {/* New card button */}
      <div className="p-3 border-t border-border">
        <Tooltip content="创建卡片">
          <button
            onClick={() => useUIStore.getState().openCardEditor()}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium',
              !isDrawerOpen && 'p-2'
            )}
          >
            <Plus className="w-4 h-4" />
            {isDrawerOpen && <span className="text-sm">新建卡片</span>}
          </button>
        </Tooltip>
      </div>
    </aside>
  )
}
