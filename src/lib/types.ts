export type UserRole = 'USER' | 'ADMIN'
export type TransactionType = 'INCOME' | 'EXPENSE'

export interface Profile {
  id: string
  name: string
  email: string
  role: UserRole
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Wallet {
  id: string
  user_id: string
  wallet_name: string
  balance: number
  color: string
  icon: string
  created_at: string
}

export interface Category {
  id: string
  user_id: string | null
  name: string
  type: TransactionType
  icon: string
  color: string
  is_default: boolean
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  wallet_id: string | null
  category_id: string | null
  type: TransactionType
  amount: number
  description: string | null
  transaction_date: string
  created_at: string
  category?: Category
  wallet?: Wallet
}

export interface Budget {
  id: string
  user_id: string
  category_id: string
  amount_limit: number
  month_year: string
  created_at: string
  category?: Category
}

export interface AdminUserStat {
  id: string
  name: string
  email: string
  role: UserRole
  avatar_url: string | null
  registered_at: string
  wallet_count: number
  transaction_count: number
  budget_count: number
}
