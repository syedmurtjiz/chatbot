import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(new URL(`/error?message=${encodeURIComponent(error.message)}`, request.url))
    }
    
    // After successful confirmation, redirect to the chat page
    return NextResponse.redirect(new URL('/chat', request.url))
  }
  
  // If no code is provided, redirect to login with an error
  return NextResponse.redirect(new URL('/login?error=Invalid confirmation code', request.url))
}
