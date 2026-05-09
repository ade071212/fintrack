'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Target, Loader2, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { Budget, Category, Transaction } from '@/lib/types'

const schema = z.object({
  category_id:  z.string().min(1, 'Category is required'),
  amount_limit: z.number().min(1, 'Limit must be at least 1'),
  month_year:   z.string().min(1, 'Month/Year is required'),
})
type FormData = z.infer<typeof schema>

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export default function BudgetsPage() {
  const [budgets, setBudgets]           = useState<Budget[]>([])
  const [categories, setCategories]     = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [open, setOpen]                 = useState(false)
  const [loading, setLoading]           = useState(false)
  const supabase = createClient()

  const currentMonthYear = new Date().toISOString().slice(0, 7) // YYYY-MM

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { month_year: currentMonthYear },
  })

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [bRes, cRes, tRes] = await Promise.all([
      supabase.from('budgets').select('*, category:categories(*)').eq('user_id', user.id).order('month_year', { ascending: false }),
      supabase.from('categories').select('*').or(`user_id.eq.${user.id},is_default.eq.true`).eq('type', 'EXPENSE').order('name'),
      supabase.from('transactions').select('*').eq('user_id', user.id).eq('type', 'EXPENSE'),
    ])

    setBudgets(bRes.data ?? [])
    setCategories(cRes.data ?? [])
    setTransactions(tRes.data ?? [])
  }, [supabase])

  useEffect(() => { load() }, [load])

  async function onSubmit(data: FormData) {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('budgets').insert({
      user_id: user.id,
      category_id: data.category_id,
      amount_limit: data.amount_limit,
      month_year: data.month_year,
    })

    setLoading(false)
    if (error) {
      if (error.code === '23505') {
        toast.error('Budget for this category and month already exists')
      } else {
        toast.error(error.message)
      }
      return
    }

    toast.success('Budget created!')
    reset({ month_year: currentMonthYear })
    setOpen(false)
    load()
  }

  async function deleteBudget(id: string) {
    const { error } = await supabase.from('budgets').delete().eq('id', id)
    if (error) { toast.error(error.message); return }
    toast.success('Budget removed')
    load()
  }

  // Calculate spent for each budget
  const budgetStats = budgets.map(b => {
    const spent = transactions
      .filter(t => t.category_id === b.category_id && t.transaction_date.startsWith(b.month_year))
      .reduce((sum, t) => sum + Number(t.amount), 0)
    
    const percent = Math.min(Math.round((spent / Number(b.amount_limit)) * 100), 100)
    const isOver = spent > Number(b.amount_limit)
    
    return { ...b, spent, percent, isOver }
  })

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Budgets</h2>
          <p className="text-muted-foreground text-sm">Track your spending limits per category</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-white border-0 shadow-lg rounded-xl gap-2">
              <Plus className="w-4 h-4" /> New Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl max-w-sm">
            <DialogHeader><DialogTitle>Create Budget</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select onValueChange={v => setValue('category_id', v)}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category_id && <p className="text-xs text-destructive">{errors.category_id.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Monthly Limit (IDR)</Label>
                <Input type="number" placeholder="0" className="h-11 rounded-xl" {...register('amount_limit', { valueAsNumber: true })} />
                {errors.amount_limit && <p className="text-xs text-destructive">{errors.amount_limit.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Month</Label>
                <Input type="month" className="h-11 rounded-xl" {...register('month_year')} />
              </div>

              <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl gradient-primary text-white border-0 font-semibold mt-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Budget'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {budgetStats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground text-sm">
          <Target className="w-12 h-12 mb-4 opacity-20" />
          <p className="font-medium">No budgets set</p>
          <p className="text-xs mt-1">Plan your spending by creating a budget</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgetStats.map(b => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm relative group overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: b.category?.color || '#6366f1' }}>
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">{b.category?.name}</h3>
                    <p className="text-xs text-muted-foreground">{new Date(b.month_year + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
                <Button
                  size="icon" variant="ghost"
                  onClick={() => deleteBudget(b.id)}
                  className="w-8 h-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Spent</span>
                  <span className={cn('font-bold', b.isOver ? 'text-rose-500' : 'text-foreground')}>
                    {fmt(b.spent)} / {fmt(Number(b.amount_limit))}
                  </span>
                </div>
                
                <div className="relative pt-1">
                  <Progress value={b.percent} className={cn('h-2', b.isOver ? 'bg-rose-100 dark:bg-rose-950/30' : '')} />
                  {/* Indicator for over budget */}
                  {b.isOver && (
                    <div className="flex items-center gap-1.5 mt-2 text-rose-500 text-[10px] font-bold uppercase tracking-wider">
                      <AlertCircle className="w-3 h-3" /> Over Budget
                    </div>
                  )}
                  {b.percent === 100 && !b.isOver && (
                    <div className="flex items-center gap-1.5 mt-2 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3" /> Limit Reached
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                    {b.percent}% utilized
                  </p>
                  <p className="text-xs font-medium">
                    {b.isOver 
                      ? `Over by ${fmt(b.spent - Number(b.amount_limit))}`
                      : `Remaining: ${fmt(Number(b.amount_limit) - b.spent)}`
                    }
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
