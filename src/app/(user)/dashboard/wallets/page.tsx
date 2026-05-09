'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, CreditCard, Loader2, Trash2, Wifi } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { Wallet } from '@/lib/types'

const GRADIENTS = [
  { label: 'Indigo',  cls: 'wallet-grad-1', hex: '#6366f1' },
  { label: 'Sky',     cls: 'wallet-grad-2', hex: '#0ea5e9' },
  { label: 'Emerald', cls: 'wallet-grad-3', hex: '#10b981' },
  { label: 'Amber',   cls: 'wallet-grad-4', hex: '#f59e0b' },
  { label: 'Pink',    cls: 'wallet-grad-5', hex: '#ec4899' },
]

const schema = z.object({
  wallet_name:    z.string().min(1, 'Wallet name is required').max(40),
  initial_balance: z.number().min(0, 'Balance must be 0 or more'),
  color:          z.string(),
})
type FormData = z.infer<typeof schema>

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

function WalletCard({ wallet, gradCls, onDelete }: { wallet: Wallet; gradCls: string; onDelete: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.25 }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      className={cn('relative rounded-2xl p-6 text-white shadow-xl overflow-hidden cursor-default select-none', gradCls)}
      style={{ minHeight: 176 }}
    >
      {/* Card decorations */}
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
      <div className="absolute -bottom-12 -left-8 w-48 h-48 rounded-full bg-white/5" />

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/70 text-xs font-medium uppercase tracking-widest">Wallet</p>
            <p className="font-bold text-lg mt-0.5 truncate max-w-[180px]">{wallet.wallet_name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-white/60 rotate-90" />
            {hover && (
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={onDelete}
                className="w-7 h-7 rounded-lg bg-white/20 hover:bg-red-500/60 flex items-center justify-center transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </div>
        </div>

        <div>
          <p className="text-white/70 text-xs mb-1">Balance</p>
          <p className="text-2xl font-extrabold">{fmt(wallet.balance)}</p>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-1">
            {[...Array(4)].map((_, i) => <span key={i} className="w-6 h-1 rounded-full bg-white/40" />)}
          </div>
          <CreditCard className="w-6 h-6 text-white/40" />
        </div>
      </div>
    </motion.div>
  )
}

export default function WalletsPage() {
  const [wallets, setWallets]   = useState<Wallet[]>([])
  const [open, setOpen]         = useState(false)
  const [loading, setLoading]   = useState(false)
  const [selColor, setSelColor] = useState(GRADIENTS[0].hex)
  const supabase = createClient()

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { color: GRADIENTS[0].hex, initial_balance: 0 },
  })

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('wallets').select('*').eq('user_id', user.id).order('created_at')
    setWallets(data ?? [])
  }, [supabase])

  useEffect(() => { load() }, [load])

  async function onSubmit(data: FormData) {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('wallets').insert({
      user_id: user.id,
      wallet_name: data.wallet_name,
      balance: data.initial_balance,
      color: data.color,
    })
    setLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success('Wallet created!')
    reset({ color: GRADIENTS[0].hex, initial_balance: 0 })
    setSelColor(GRADIENTS[0].hex)
    setOpen(false)
    load()
  }

  async function deleteWallet(id: string) {
    const { error } = await supabase.from('wallets').delete().eq('id', id)
    if (error) { toast.error(error.message); return }
    toast.success('Wallet removed')
    load()
  }

  const getGradCls = (color: string) => GRADIENTS.find(g => g.hex === color)?.cls ?? 'wallet-grad-1'

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Wallets</h2>
          <p className="text-muted-foreground text-sm">{wallets.length} wallet{wallets.length !== 1 ? 's' : ''}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-white border-0 shadow-lg rounded-xl gap-2">
              <Plus className="w-4 h-4" /> New Wallet
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl max-w-sm">
            <DialogHeader><DialogTitle>Create Wallet</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
              <div className="space-y-1.5">
                <Label>Wallet Name</Label>
                <Input placeholder="e.g. BCA Savings" className="h-11 rounded-xl" {...register('wallet_name')} />
                {errors.wallet_name && <p className="text-xs text-destructive">{errors.wallet_name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Initial Balance (IDR)</Label>
                <Input type="number" placeholder="0" className="h-11 rounded-xl" {...register('initial_balance', { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label>Card Color</Label>
                <div className="flex gap-2">
                  {GRADIENTS.map(g => (
                    <button key={g.hex} type="button"
                      onClick={() => { setSelColor(g.hex); setValue('color', g.hex) }}
                      className={cn('w-8 h-8 rounded-full transition-all', g.cls, selColor === g.hex && 'ring-2 ring-offset-2 ring-foreground scale-110')}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className={cn('rounded-xl p-4 text-white text-sm font-semibold flex justify-between items-center', getGradCls(selColor))}>
                <span>Preview</span><CreditCard className="w-5 h-5 opacity-50" />
              </div>

              <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl gradient-primary text-white border-0">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Wallet'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {wallets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground text-sm">
          <CreditCard className="w-12 h-12 mb-4 opacity-20" />
          <p className="font-medium">No wallets yet</p>
          <p className="text-xs mt-1">Create your first wallet to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wallets.map(w => (
            <WalletCard
              key={w.id}
              wallet={w}
              gradCls={getGradCls(w.color)}
              onDelete={() => deleteWallet(w.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
