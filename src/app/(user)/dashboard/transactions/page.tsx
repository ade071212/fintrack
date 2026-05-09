'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, ArrowUpCircle, ArrowDownCircle, Trash2, Search, Filter } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Transaction, Wallet, Category } from '@/lib/types'

const schema = z.object({
  type:             z.enum(['INCOME', 'EXPENSE']),
  amount:           z.number().min(1, 'Amount must be greater than 0'),
  category_id:      z.string().min(1, 'Select a category'),
  wallet_id:        z.string().min(1, 'Select a wallet'),
  description:      z.string().optional(),
  transaction_date: z.string().min(1, 'Select a date'),
})
type FormData = z.infer<typeof schema>

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [wallets, setWallets]           = useState<Wallet[]>([])
  const [categories, setCategories]     = useState<Category[]>([])
  const [open, setOpen]                 = useState(false)
  const [loading, setLoading]           = useState(false)
  const [search, setSearch]             = useState('')
  const [filterType, setFilterType]     = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL')
  const supabase = createClient()

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'EXPENSE', transaction_date: new Date().toISOString().split('T')[0] },
  })
  const txType = watch('type')

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [txRes, wRes, catRes] = await Promise.all([
      supabase.from('transactions')
        .select('*, category:categories(name,icon,color,type), wallet:wallets(wallet_name)')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false }),
      supabase.from('wallets').select('*').eq('user_id', user.id),
      supabase.from('categories').select('*').or(`user_id.eq.${user.id},is_default.eq.true`).order('name'),
    ])
    setTransactions((txRes.data as Transaction[]) ?? [])
    setWallets(wRes.data ?? [])
    setCategories(catRes.data ?? [])
  }, [supabase])

  useEffect(() => { load() }, [load])

  async function onSubmit(data: FormData) {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('transactions').insert({
      user_id: user.id,
      type: data.type,
      amount: data.amount,
      category_id: data.category_id,
      wallet_id: data.wallet_id,
      description: data.description || null,
      transaction_date: data.transaction_date,
    })
    setLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success('Transaction added!')
    reset({ type: 'EXPENSE', transaction_date: new Date().toISOString().split('T')[0] })
    setOpen(false)
    load()
  }

  async function deleteTransaction(id: string) {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) { toast.error(error.message); return }
    toast.success('Transaction deleted')
    load()
  }

  const filtered = transactions.filter(t => {
    const matchType   = filterType === 'ALL' || t.type === filterType
    const matchSearch = search === '' ||
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.category?.name?.toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  const filteredCats = categories.filter(c => c.type === txType)

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Transactions</h2>
          <p className="text-muted-foreground text-sm">{transactions.length} total records</p>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button className="gradient-primary text-white border-0 shadow-lg rounded-xl gap-2">
              <Plus className="w-4 h-4" /> Add Transaction
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Add Transaction</SheetTitle>
            </SheetHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-6">
              {/* Type toggle */}
              <div className="grid grid-cols-2 gap-2">
                {(['INCOME', 'EXPENSE'] as const).map(t => (
                  <button
                    key={t} type="button"
                    onClick={() => setValue('type', t)}
                    className={cn(
                      'flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all',
                      txType === t && t === 'INCOME' && 'bg-emerald-500/15 border-emerald-500/40 text-emerald-500',
                      txType === t && t === 'EXPENSE' && 'bg-rose-500/15 border-rose-500/40 text-rose-500',
                      txType !== t && 'border-border text-muted-foreground hover:bg-accent',
                    )}
                  >
                    {t === 'INCOME' ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}
                    {t}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5">
                <Label>Amount (IDR)</Label>
                <Input type="number" placeholder="0" className="h-11 rounded-xl" {...register('amount', { valueAsNumber: true })} />
                {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select onValueChange={v => setValue('category_id', v as string)}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {filteredCats.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category_id && <p className="text-xs text-destructive">{errors.category_id.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Wallet</Label>
                <Select onValueChange={v => setValue('wallet_id', v as string)}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select wallet" /></SelectTrigger>
                  <SelectContent>
                    {wallets.map(w => (
                      <SelectItem key={w.id} value={w.id}>{w.wallet_name} ({fmt(w.balance)})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.wallet_id && <p className="text-xs text-destructive">{errors.wallet_id.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" className="h-11 rounded-xl" {...register('transaction_date')} />
              </div>

              <div className="space-y-1.5">
                <Label>Description (optional)</Label>
                <Input placeholder="e.g. Lunch at restaurant" className="h-11 rounded-xl" {...register('description')} />
              </div>

              <Button
                type="submit" disabled={loading}
                className={cn('w-full h-11 rounded-xl text-white border-0 font-semibold', txType === 'INCOME' ? 'gradient-income' : 'gradient-expense')}
              >
                {loading ? 'Adding...' : `Add ${txType === 'INCOME' ? 'Income' : 'Expense'}`}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search transactions..." className="pl-9 h-10 rounded-xl" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(['ALL', 'INCOME', 'EXPENSE'] as const).map(f => (
            <Button key={f} size="sm" variant={filterType === f ? 'default' : 'outline'}
              onClick={() => setFilterType(f)}
              className={cn('rounded-xl text-xs', filterType === f && f === 'INCOME' && 'bg-emerald-500 hover:bg-emerald-600 border-0', filterType === f && f === 'EXPENSE' && 'bg-rose-500 hover:bg-rose-600 border-0')}
            >{f}</Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm">
            <Filter className="w-10 h-10 mb-3 opacity-20" />
            <p>No transactions found</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((tx, i) => (
              <motion.li
                key={tx.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 px-5 py-4 hover:bg-accent/50 transition-colors group"
              >
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', tx.type === 'INCOME' ? 'income-bg' : 'expense-bg')}>
                  {tx.type === 'INCOME'
                    ? <ArrowUpCircle className="w-5 h-5 income-text" />
                    : <ArrowDownCircle className="w-5 h-5 expense-text" />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{tx.description ?? tx.category?.name ?? tx.type}</p>
                  <p className="text-xs text-muted-foreground">{tx.category?.name} · {new Date(tx.transaction_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>

                <Badge variant="outline" className="text-xs hidden sm:flex shrink-0">
                  {tx.wallet?.wallet_name ?? '—'}
                </Badge>

                <p className={cn('text-sm font-bold shrink-0', tx.type === 'INCOME' ? 'income-text' : 'expense-text')}>
                  {tx.type === 'INCOME' ? '+' : '-'}{fmt(tx.amount)}
                </p>

                <Button
                  size="icon" variant="ghost"
                  onClick={() => deleteTransaction(tx.id)}
                  className="w-8 h-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
