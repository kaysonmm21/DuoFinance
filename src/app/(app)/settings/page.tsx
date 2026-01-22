'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, User, DollarSign, Shield, Mail, Lock, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { getProfile, updateProfile } from '@/actions/profile'
import { profileSchema, type ProfileInput } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
]

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState<{ full_name: string | null; currency: string; email: string } | null>(null)

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      currency: 'USD',
    },
  })

  useEffect(() => {
    async function loadProfile() {
      const data = await getProfile()
      if (data) {
        setProfile(data)
        form.reset({
          full_name: data.full_name || '',
          currency: data.currency,
        })
      }
    }
    loadProfile()
  }, [form])

  async function onSubmit(data: ProfileInput) {
    setIsLoading(true)

    const result = await updateProfile(data)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Settings saved')
      if (result.data) {
        setProfile(result.data)
      }
    }

    setIsLoading(false)
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground text-sm mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Card */}
      <Card className="border shadow-sm rounded-2xl ig-card-hover">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" strokeWidth={2} />
            </div>
            <div>
              <CardTitle className="text-base">Profile</CardTitle>
              <CardDescription className="text-xs">Your personal information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email
                </label>
                <Input
                  value={profile?.email || ''}
                  disabled
                  className="h-11 rounded-xl bg-muted/30 border-0"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your name"
                        className="h-11 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/20"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="rounded-full h-10 px-6 font-semibold ig-gradient border-0 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Preferences Card */}
      <Card className="border shadow-sm rounded-2xl ig-card-hover">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
            </div>
            <div>
              <CardTitle className="text-base">Preferences</CardTitle>
              <CardDescription className="text-xs">Customize your experience</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Currency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-0">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        {currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code} className="rounded-lg">
                            <span className="flex items-center gap-2">
                              <span className="font-mono text-primary">{currency.symbol}</span>
                              <span>{currency.name} ({currency.code})</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs">
                      Choose your preferred currency for displaying amounts
                    </FormDescription>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="rounded-full h-10 px-6 font-semibold ig-gradient border-0 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Security Card */}
      <Card className="border shadow-sm rounded-2xl ig-card-hover">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-violet-600 dark:text-violet-400" strokeWidth={2} />
            </div>
            <div>
              <CardTitle className="text-base">Security</CardTitle>
              <CardDescription className="text-xs">Manage your account security</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">Password</p>
                <p className="text-xs text-muted-foreground">
                  Change your password
                </p>
              </div>
            </div>
            <Button variant="outline" asChild className="rounded-full h-9 px-4 text-sm">
              <a href="/forgot-password">Change</a>
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between p-3 rounded-xl hover:bg-destructive/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="font-medium text-sm text-destructive">Delete Account</p>
                <p className="text-xs text-muted-foreground">
                  Permanently delete your account and all data
                </p>
              </div>
            </div>
            <Button variant="destructive" disabled className="rounded-full h-9 px-4 text-sm">
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
