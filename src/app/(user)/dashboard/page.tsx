import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Wallet, TrendingUp, TrendingDown, Target } from 'lucide-react'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { ExpenseDonut } from '@/components/dashboard/ExpenseDonut'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import type { Transaction, Budget, Wallet as WalletType } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch in parallel
  const [walletsRes, txRes, budgetsRes] = await Promise.all([
    supabase.from('wallets').select('*').eq('user_id', user.id),
    supabase
      .from('transactions')
      .select('*, category:categories(name,icon,color,type), wallet:wallets(wallet_name)')
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false })
      .limit(50),
    supabase
      .from('budgets')
      .select('*, category:categories(name,icon,color)')
      .eq('user_id', user.id),
  ])

  const wallets: WalletType[] = walletsRes.data ?? []
  const transactions: Transaction[] = txRes.data ?? []
  const budgets: Budget[] = budgetsRes.data ?? []

  const totalBalance = wallets.reduce((s, w) => s + Number(w.balance), 0)

  // This month
  const now = new Date()
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const thisMonth = transactions.filter(t =>
    t.transaction_date.startsWith(monthStr.slice(0, 7))
  )
  const monthIncome  = thisMonth.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0)
  const monthExpense = thisMonth.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0)

  // Expense breakdown by category for donut chart
  const expenseMap = new Map<string, { name: string; value: number; color: string; icon: string }>()
  thisMonth
    .filter(t => t.type === 'EXPENSE' && t.category)
    .forEach(t => {
      const key = t.category!.name
      const prev = expenseMap.get(key) ?? { name: key, value: 0, color: t.category!.color, icon: t.category!.icon }
      expenseMap.set(key, { ...prev, value: prev.value + Number(t.amount) })
    })
  const chartData = Array.from(expenseMap.values()).sort((a, b) => b.value - a.value).slice(0, 8)

  const recentTx = transactions.slice(0, 8)

  const statsCards = [
    {
      title: 'Total Balance',
      value: fmt(totalBalance),
      change: `${wallets.length} wallet${wallets.length !== 1 ? 's' : ''}`,
      changeType: 'neutral' as const,
      icon: <Wallet className="w-5 h-5 text-white" />,
      gradient: 'gradient-primary',
    },
    {
      title: 'Income This Month',
      value: fmt(monthIncome),
      change: `+${thisMonth.filter(t => t.type === 'INCOME').length} transactions`,
      changeType: 'up' as const,
      icon: <TrendingUp className="w-5 h-5 text-white" />,
      gradient: 'gradient-income',
    },
    {
      title: 'Expenses This Month',
      value: fmt(monthExpense),
      change: `${thisMonth.filter(t => t.type === 'EXPENSE').length} transactions`,
      changeType: 'down' as const,
      icon: <TrendingDown className="w-5 h-5 text-white" />,
      gradient: 'gradient-expense',
    },
    {
      title: 'Active Budgets',
      value: budgets.length.toString(),
      change: `For ${monthStr}`,
      changeType: 'neutral' as const,
      icon: <Target className="w-5 h-5 text-white" />,
      gradient: 'gradient-primary',
    },
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold">Good {getTimeOfDay()} 👋</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Here&apos;s your financial overview for {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsCards.map((card, i) => (
          <StatsCard key={card.title} {...card} index={i} />
        ))}
      </div>

      {/* Charts + Recent */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Donut */}
        <div className="xl:col-span-2 rounded-2xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-1">Expense Breakdown</h3>
          <p className="text-xs text-muted-foreground mb-4">By category this month</p>
          <ExpenseDonut data={chartData} />
        </div>

        {/* Recent Transactions */}
        <div className="xl:col-span-3 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Recent Transactions</h3>
              <p className="text-xs text-muted-foreground">Last 8 records</p>
            </div>
            <a href="/dashboard/transactions" className="text-xs text-primary hover:underline">View all →</a>
          </div>
          <RecentTransactions transactions={recentTx} />
        </div>
      </div>
    </div>
  )
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
