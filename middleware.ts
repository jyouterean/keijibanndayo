import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple middleware for security headers reinforcement
// JWT verification is handled at the API route level

export function middleware(request: NextRequest) {
    const response = NextResponse.next()

    // Add security headers to all responses
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')

    return response
}

export const config = {
    matcher: [
        // Match all paths except static files and internal Next.js paths
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
