import { NextRequest, NextResponse } from "next/server"

/**
 * Rate limiting helper
 * Note: In serverless environments, this is per-instance only.
 * For production, use Redis, Upstash, or Vercel KV.
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number; blocked: boolean }>()

export function checkRateLimit(
    identifier: string,
    maxRequests: number = 100,
    windowMs: number = 60000,
    blockDuration: number = 300000 // 5 minutes block
): { allowed: boolean; remaining: number; blocked: boolean } {
    const now = Date.now()
    const record = rateLimitMap.get(identifier)

    // Check if currently blocked
    if (record?.blocked && now < record.resetTime) {
        return { allowed: false, remaining: 0, blocked: true }
    }

    if (!record || now > record.resetTime) {
        rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs, blocked: false })
        return { allowed: true, remaining: maxRequests - 1, blocked: false }
    }

    if (record.count >= maxRequests) {
        // Block the user for extended duration
        rateLimitMap.set(identifier, { count: record.count, resetTime: now + blockDuration, blocked: true })
        return { allowed: false, remaining: 0, blocked: true }
    }

    record.count++
    return { allowed: true, remaining: maxRequests - record.count, blocked: false }
}

/**
 * Get client IP from request with fallbacks
 */
export function getClientIp(request: NextRequest): string {
    // Try various headers in order of preference
    const cfConnectingIp = request.headers.get("cf-connecting-ip")
    if (cfConnectingIp) return cfConnectingIp

    const xRealIp = request.headers.get("x-real-ip")
    if (xRealIp) return xRealIp

    const forwarded = request.headers.get("x-forwarded-for")
    if (forwarded) return forwarded.split(",")[0].trim()

    return "unknown"
}

/**
 * Sanitize string input - removes dangerous content
 */
export function sanitizeInput(input: string): string {
    if (typeof input !== "string") return ""
    return input
        .trim()
        // Remove script tags and their contents
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        // Remove other potentially dangerous tags
        .replace(/<(iframe|object|embed|link|style|meta|form)[^>]*>/gi, "")
        // Remove closing tags for dangerous elements
        .replace(/<\/(iframe|object|embed|link|style|meta|form)>/gi, "")
        // Remove javascript: and data: URLs
        .replace(/javascript:/gi, "")
        .replace(/data:/gi, "")
        // Remove event handlers
        .replace(/\s*on\w+\s*=/gi, "")
        // Remove expression() and url() with javascript
        .replace(/expression\s*\([^)]*\)/gi, "")
        // Limit length to prevent DoS
        .substring(0, 10000)
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    if (typeof email !== "string" || email.length > 255) return false
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * Validate phone number format (Japanese)
 */
export function isValidPhone(phone: string): boolean {
    if (typeof phone !== "string" || phone.length > 20) return false
    const phoneRegex = /^[0-9-]+$/
    return phoneRegex.test(phone)
}

/**
 * Check if input contains potential SQL injection
 */
export function hasSqlInjection(input: string): boolean {
    if (typeof input !== "string") return false
    const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE)\b)/gi,
        /(\b(UNION|JOIN|WHERE|FROM|INTO)\b)/gi,
        /(--|;|'|"|\*|\/\*|\*\/)/g,
        /(\bOR\b\s*\d+\s*=\s*\d+)/gi,
        /(\bAND\b\s*\d+\s*=\s*\d+)/gi,
    ]
    return sqlPatterns.some((pattern) => pattern.test(input))
}

/**
 * Create standardized error response
 */
export function errorResponse(message: string, status: number = 400): NextResponse {
    return NextResponse.json({ error: message }, { status })
}

/**
 * Create rate limit exceeded response
 */
export function rateLimitResponse(): NextResponse {
    return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": "300" } }
    )
}
