'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import type { Profile } from '@/lib/types'

export function Header({ profile, title }: { profile: Profile; title: string }) {
  const { theme, setTheme } = useTheme()

  const initials = profile.name
    .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 bg-card/80 backdrop-blur-md border-b border-border min-h-[68px]">
      <div>
        <h1 className="text-lg font-bold">{title}</h1>
        <p className="text-xs text-muted-foreground hidden sm:block">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-xl w-9 h-9"
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </motion.div>

        {/* Notifications */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="ghost" size="icon" className="rounded-xl w-9 h-9 relative" aria-label="Notifications">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
          </Button>
        </motion.div>

        {/* Role badge + avatar */}
        <div className="flex items-center gap-2 ml-1">
          <Badge
            variant="outline"
            className={profile.role === 'ADMIN'
              ? 'text-xs border-violet-500/40 text-violet-500 bg-violet-500/10 hidden sm:flex'
              : 'text-xs border-emerald-500/40 text-emerald-500 bg-emerald-500/10 hidden sm:flex'}
          >
            {profile.role}
          </Badge>
          <Avatar className="w-8 h-8 ring-2 ring-primary/30">
            <AvatarImage src={profile.avatar_url ?? undefined} />
            <AvatarFallback className="text-xs font-semibold bg-primary/20 text-primary">{initials}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
