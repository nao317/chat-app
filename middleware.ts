import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // ジオブロッキング: 日本国外からのアクセスをブロック
  const geoBlockingEnabled = process.env.NEXT_PUBLIC_GEO_BLOCKING_ENABLED === 'true'
  
  if (geoBlockingEnabled) {
    // Vercelやその他のエッジプラットフォームが提供する国コードヘッダーを取得
    const country = request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry')
    
    // 日本(JP)以外からのアクセスをブロック
    if (country && country !== 'JP') {
      return new NextResponse(
        JSON.stringify({
          error: 'Access denied',
          message: 'このサービスは日本国内からのみアクセス可能です。',
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    }
  )

  // セッションをリフレッシュ（エラーハンドリング付き）
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    // リフレッシュトークンエラーの場合は、古いCookieをクリア
    if (error && (error.message.includes('refresh_token_not_found') || error.message.includes('Invalid Refresh Token'))) {
      // すべてのSupabase関連Cookieをクリア
      request.cookies.getAll().forEach(cookie => {
        if (cookie.name.includes('sb-') || cookie.name.includes('supabase')) {
          supabaseResponse.cookies.delete(cookie.name)
        }
      })
    }
  } catch (error) {
    // 予期しないエラーはログに記録して続行
    console.log('Middleware auth error:', error)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * 以下を除くすべてのリクエストパスにマッチ：
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化ファイル)
     * - favicon.ico (faviconファイル)
     * - public フォルダ内のファイル
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
