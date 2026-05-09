import Link from 'next/link'
import { ArrowRight, BarChart3, Shield, Wallet, Zap, TrendingUp, PieChart } from 'lucide-react'
import { Button } from '@/components/ui/button'

const features = [
  { icon: Wallet,    title: 'Smart Wallets',    desc: 'Manage multiple accounts — cash, bank, e-wallet — in one place.' },
  { icon: PieChart,  title: 'Visual Insights',  desc: 'Beautiful animated donut charts break down your spending by category.' },
  { icon: TrendingUp,title: 'Budget Tracking',  desc: 'Set monthly budgets per category and get notified before overspending.' },
  { icon: Shield,    title: 'Bank-level Security', desc: 'Row-level security ensures only you can ever see your private data.' },
  { icon: BarChart3, title: 'Income vs Expense', desc: 'Spot trends at a glance with clear monthly summaries and comparisons.' },
  { icon: Zap,       title: 'Instant Records',  desc: 'Add a transaction in under 3 seconds with an intuitive guided form.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 glass border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base">FinTrack</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="gradient-primary text-white border-0 shadow-lg">
              Get Started <ArrowRight className="ml-1 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-6 pt-20 pb-16 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute top-2/3 left-1/4 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] bg-violet-500/10 rounded-full blur-3xl" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Premium Personal Finance Tracker
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-3xl mb-6 leading-[1.1]">
          Take Full Control of{' '}
          <span className="bg-gradient-to-r from-primary via-violet-500 to-emerald-500 bg-clip-text text-transparent">
            Your Finances
          </span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed">
          Track income and expenses, manage multiple wallets, set budgets, and visualize your financial health — all in a beautiful, secure dashboard.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/register">
            <Button size="lg" className="gradient-primary text-white border-0 shadow-xl px-8 text-base">
              Start for Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="px-8 text-base">
              Sign In
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-16 max-w-lg">
          {[
            { value: '100%', label: 'Private & Secure' },
            { value: '3s',   label: 'To Add a Transaction' },
            { value: '∞',    label: 'Wallets & Categories' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-extrabold bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-3">Everything You Need</h2>
        <p className="text-muted-foreground text-center mb-12">Built for people who care about their financial future.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(f => {
            const Icon = f.icon
            return (
              <div key={f.title} className="p-6 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto p-10 rounded-3xl border border-border bg-card relative overflow-hidden">
          <div className="absolute inset-0 gradient-primary opacity-5 -z-0" />
          <h2 className="text-3xl font-bold mb-4 relative z-10">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8 relative z-10">Join thousands managing their finances smarter with FinTrack.</p>
          <Link href="/register" className="relative z-10">
            <Button size="lg" className="gradient-primary text-white border-0 shadow-xl px-10">
              Create Free Account <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="text-center py-8 text-xs text-muted-foreground border-t border-border">
        © {new Date().getFullYear()} FinTrack. Built with Next.js & Supabase.
      </footer>
    </div>
  )
}
