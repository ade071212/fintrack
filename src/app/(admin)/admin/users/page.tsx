import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ShieldAlert, Users } from 'lucide-react'
import type { AdminUserStat } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'User Management' }

export default async function AdminUsersPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Query the admin_user_stats view — contains only meta/aggregate data, no financial info
  const { data: users } = await supabase
    .from('admin_user_stats')
    .select('*')
    .order('registered_at', { ascending: false })

  const stats: AdminUserStat[] = users ?? []

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground text-sm">{stats.length} registered accounts</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>No financial data visible</span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-border bg-muted/30">
          <p className="col-span-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</p>
          <p className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</p>
          <p className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Wallets</p>
          <p className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Transactions</p>
          <p className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joined</p>
        </div>

        {stats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm">
            <Users className="w-10 h-10 mb-3 opacity-20" />
            <p>No users found</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {stats.map(u => {
              const initials = u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              return (
                <li key={u.id} className="grid grid-cols-12 gap-4 items-center px-5 py-4 hover:bg-accent/40 transition-colors">
                  {/* User */}
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback className="text-xs font-semibold bg-primary/20 text-primary">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{u.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="col-span-2">
                    <Badge
                      variant="outline"
                      className={u.role === 'ADMIN'
                        ? 'text-violet-500 border-violet-500/40 bg-violet-500/10 text-xs'
                        : 'text-emerald-500 border-emerald-500/40 bg-emerald-500/10 text-xs'}
                    >
                      {u.role}
                    </Badge>
                  </div>

                  {/* Wallets count */}
                  <p className="col-span-2 text-sm font-semibold text-center">{u.wallet_count}</p>

                  {/* Transactions count */}
                  <p className="col-span-2 text-sm font-semibold text-center">{u.transaction_count}</p>

                  {/* Joined */}
                  <p className="col-span-2 text-xs text-muted-foreground">
                    {new Date(u.registered_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Footer note */}
      <p className="text-xs text-muted-foreground text-center">
        Admins can view account metadata and activity counts only. Wallet balances and transaction details are protected by database-level RLS policies.
      </p>
    </div>
  )
}
