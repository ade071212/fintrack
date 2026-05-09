'use client'

import { motion } from 'framer-motion'
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Transaction } from '@/lib/types'

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm">
        <ArrowUpCircle className="w-10 h-10 mb-3 opacity-20" />
        <p>No transactions yet</p>
        <p className="text-xs mt-1">Add your first transaction above</p>
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {transactions.map((tx, i) => (
        <motion.li
          key={tx.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors duration-150"
        >
          {/* Icon */}
          <div className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
            tx.type === 'INCOME' ? 'bg-emerald-500/15' : 'bg-rose-500/15'
          )}>
            {tx.type === 'INCOME'
              ? <ArrowUpCircle className="w-5 h-5 text-emerald-500" />
              : <ArrowDownCircle className="w-5 h-5 text-rose-500" />}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {tx.description ?? tx.category?.name ?? (tx.type === 'INCOME' ? 'Income' : 'Expense')}
            </p>
            <p className="text-xs text-muted-foreground">
              {tx.category?.name} · {new Date(tx.transaction_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>

          {/* Amount */}
          <p className={cn(
            'text-sm font-bold shrink-0',
            tx.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'
          )}>
            {tx.type === 'INCOME' ? '+' : '-'}{fmt(tx.amount)}
          </p>
        </motion.li>
      ))}
    </ul>
  )
}
