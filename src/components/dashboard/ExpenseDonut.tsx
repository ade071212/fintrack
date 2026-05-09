'use client'

import { motion } from 'framer-motion'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

interface ChartData {
  name: string
  value: number
  color: string
  icon: string
}

interface ExpenseDonutProps {
  data: ChartData[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0]
    return (
      <div className="bg-popover border border-border rounded-xl px-4 py-3 shadow-xl text-sm">
        <p className="font-semibold">{item.name}</p>
        <p className="text-primary font-bold mt-0.5">
          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.value)}
        </p>
        <p className="text-muted-foreground text-xs">{item.payload.percent?.toFixed(1)}%</p>
      </div>
    )
  }
  return null
}

export function ExpenseDonut({ data }: ExpenseDonutProps) {
  const total = data.reduce((s, d) => s + d.value, 0)

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm">
        <PieChart className="w-10 h-10 mb-3 opacity-30" />
        <p>No expense data yet</p>
        <p className="text-xs mt-1">Add a transaction to see the chart</p>
      </div>
    )
  }

  const withPercent = data.map(d => ({ ...d, percent: (d.value / total) * 100 }))

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={withPercent}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={3}
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
          >
            {withPercent.map((entry, i) => (
              <Cell key={i} fill={entry.color} strokeWidth={0} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span className="text-xs text-muted-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
