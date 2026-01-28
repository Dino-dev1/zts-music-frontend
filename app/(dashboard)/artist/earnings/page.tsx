'use client'

import { motion } from 'framer-motion'
import {
  Wallet,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  Building2,
  CreditCard,
} from 'lucide-react'
import { Card, Button } from '@/components/ui'
import { useAuth } from '@/lib/providers'
import { cn, formatCurrency } from '@/lib/utils'

// Placeholder data - will be replaced with API data
const earningsStats = {
  totalEarnings: 0,
  pendingPayouts: 0,
  completedGigs: 0,
  thisMonth: 0,
  lastMonth: 0,
}

const recentTransactions: Array<{
  id: string
  gigTitle: string
  amount: number
  status: 'completed' | 'pending' | 'processing'
  date: string
}> = []

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendLabel,
}: {
  icon: React.ElementType
  label: string
  value: string
  trend?: 'up' | 'down'
  trendLabel?: string
}) {
  return (
    <Card variant="elevated" className="p-5">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-violet-400" />
        </div>
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
              trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
            )}
          >
            {trend === 'up' ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {trendLabel}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-foreground-muted mt-1">{label}</p>
      </div>
    </Card>
  )
}

export default function ArtistEarningsPage() {
  const { user } = useAuth()

  const hasTransactions = recentTransactions.length > 0
  const hasBankAccount = false // Will be determined by API

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">Earnings</h1>
        <p className="text-foreground-muted">Track your income and manage payouts</p>
      </div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <StatCard
          icon={Wallet}
          label="Total Earnings"
          value={formatCurrency(earningsStats.totalEarnings)}
        />
        <StatCard
          icon={Clock}
          label="Pending Payouts"
          value={formatCurrency(earningsStats.pendingPayouts)}
        />
        <StatCard
          icon={CheckCircle}
          label="Completed Gigs"
          value={String(earningsStats.completedGigs)}
        />
        <StatCard
          icon={TrendingUp}
          label="This Month"
          value={formatCurrency(earningsStats.thisMonth)}
          trend={earningsStats.thisMonth >= earningsStats.lastMonth ? 'up' : 'down'}
          trendLabel={earningsStats.lastMonth > 0
            ? `${Math.round(((earningsStats.thisMonth - earningsStats.lastMonth) / earningsStats.lastMonth) * 100)}%`
            : '0%'
          }
        />
      </motion.div>

      {/* Payout Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-lg font-semibold text-foreground mb-4">Payout Settings</h2>
        <Card variant="elevated" className="p-6">
          {hasBankAccount ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Bank Account Connected</p>
                  <p className="text-sm text-foreground-muted">HDFC Bank ****1234</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Update
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-violet-400" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Add Payment Method</h3>
              <p className="text-foreground-muted text-sm max-w-sm mx-auto mb-4">
                Connect your bank account to receive payouts for completed gigs
              </p>
              <Button variant="primary">
                Add Bank Account
              </Button>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
          {hasTransactions && (
            <Button variant="ghost" size="sm">
              View All
            </Button>
          )}
        </div>

        {hasTransactions ? (
          <Card variant="elevated" className="divide-y divide-white/5">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center',
                      transaction.status === 'completed'
                        ? 'bg-emerald-500/10'
                        : transaction.status === 'pending'
                        ? 'bg-amber-500/10'
                        : 'bg-violet-500/10'
                    )}
                  >
                    {transaction.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : transaction.status === 'pending' ? (
                      <Clock className="w-5 h-5 text-amber-400" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-violet-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{transaction.gigTitle}</p>
                    <div className="flex items-center gap-2 text-sm text-foreground-muted">
                      <Calendar className="w-3 h-3" />
                      {transaction.date}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p
                    className={cn(
                      'text-xs capitalize',
                      transaction.status === 'completed'
                        ? 'text-emerald-400'
                        : transaction.status === 'pending'
                        ? 'text-amber-400'
                        : 'text-violet-400'
                    )}
                  >
                    {transaction.status}
                  </p>
                </div>
              </div>
            ))}
          </Card>
        ) : (
          <Card variant="elevated" className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-elevated flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-foreground-muted" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">No transactions yet</h3>
            <p className="text-foreground-muted text-sm max-w-sm mx-auto">
              Your earnings from completed gigs will appear here. Start bidding on gigs to earn!
            </p>
          </Card>
        )}
      </motion.div>
    </div>
  )
}
