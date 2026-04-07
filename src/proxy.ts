import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export default async function proxy(request: NextRequest) {
  try {
    return await updateSession(request)
  } catch {
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/dashboard/:path*',
    '/transactions/:path*',
    '/categories/:path*',
    '/budgets/:path*',
    '/analytics/:path*',
    '/settings/:path*',
  ],
}
