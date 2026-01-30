import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      redirect('/dashboard')
    } else {
      redirect('/login')
    }
  } catch (error) {
    // redirect() throws a special error internally — rethrow it
    if (error && typeof error === 'object' && 'digest' in error) {
      throw error
    }
    redirect('/login')
  }
}
