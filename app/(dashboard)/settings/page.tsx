'use client'

import { motion } from 'framer-motion'
import {
  LogOut,
  HelpCircle,
  ExternalLink,
  Shield,
  Bell,
  FileText,
} from 'lucide-react'
import { Card, Button, Avatar, Badge } from '@/components/ui'
import { useAuth } from '@/lib/providers'

export default function SettingsPage() {
  const { user, logout } = useAuth()

  const settingsItems = [
    {
      icon: Bell,
      label: 'Notifications',
      description: 'Manage push and email notifications',
      comingSoon: true,
    },
    {
      icon: Shield,
      label: 'Privacy & Security',
      description: 'Account security and data privacy',
      comingSoon: true,
    },
    {
      icon: FileText,
      label: 'Terms & Privacy Policy',
      description: 'Read our terms of service',
      href: '/terms',
      external: true,
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      description: 'Get help with using ZTS Music',
      href: 'mailto:support@ztsmusic.com',
      external: true,
    },
  ]

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">Settings</h1>
        <p className="text-foreground-muted">App preferences and support</p>
      </div>

      {/* User Card - Display only, no edit (profile page handles that) */}
      <Card variant="elevated" className="p-4 mb-6">
        <div className="flex items-center gap-4">
          <Avatar src={user?.profilePicture} name={user?.name} size="lg" />
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-foreground truncate">{user?.name}</h2>
            <p className="text-sm text-foreground-muted truncate">
              {user?.email || user?.phone || user?.phoneNumber}
            </p>
            <Badge variant="secondary" size="sm" className="mt-1 capitalize">
              {user?.role?.toLowerCase()}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Settings Items */}
      <Card variant="elevated" className="divide-y divide-white/5 mb-6">
        {settingsItems.map((item) => {
          const Icon = item.icon
          const isComingSoon = 'comingSoon' in item && item.comingSoon
          const isExternal = 'external' in item && item.external

          const content = (
            <div className="w-full flex items-center gap-4 p-4 text-left">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">{item.label}</p>
                  {isComingSoon && (
                    <Badge variant="secondary" size="sm">Soon</Badge>
                  )}
                </div>
                <p className="text-sm text-foreground-muted truncate">
                  {item.description}
                </p>
              </div>
              {!isComingSoon && isExternal && (
                <ExternalLink className="w-5 h-5 text-foreground-muted" />
              )}
            </div>
          )

          if (isComingSoon) {
            return (
              <div key={item.label} className="opacity-60 cursor-not-allowed">
                {content}
              </div>
            )
          }

          if ('href' in item && item.href) {
            return (
              <a
                key={item.label}
                href={item.href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="block hover:bg-white/5 transition-colors"
              >
                {content}
              </a>
            )
          }

          return (
            <div key={item.label} className="hover:bg-white/5 transition-colors cursor-pointer">
              {content}
            </div>
          )
        })}
      </Card>

      {/* Logout Button */}
      <Button
        variant="ghost"
        fullWidth
        className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
        leftIcon={<LogOut className="w-4 h-4" />}
        onClick={logout}
      >
        Log Out
      </Button>

      {/* Version */}
      <p className="text-center text-xs text-foreground-subtle mt-6">
        ZTS Music v1.0.0
      </p>
    </div>
  )
}
