'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string
  change?: string
  changeType?: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
  gradient: string
  index: number
}

export function StatsCard({ title, value, change, changeType, icon, gradient, index }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="relative rounded-2xl border border-border bg-card p-6 overflow-hidden group hover:shadow-lg hover:shadow-primary/5 transition-shadow duration-300"
    >
      {/* Background accent */}
      <div className={cn('absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-20', gradient)} />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1 tracking-tight">{value}</p>
          {change && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-xs font-medium',
              changeType === 'up'   && 'text-emerald-500',
              changeType === 'down' && 'text-rose-500',
              changeType === 'neutral' && 'text-muted-foreground',
            )}>
              {changeType === 'up'   && <ArrowUpRight className="w-3.5 h-3.5" />}
              {changeType === 'down' && <ArrowDownRight className="w-3.5 h-3.5" />}
              {change}
            </div>
          )}
        </div>

        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shadow-lg', gradient)}>
          {icon}
        </div>
      </div>
    </motion.div>
  )
}
