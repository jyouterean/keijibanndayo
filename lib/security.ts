import { NextRequest, NextResponse } from "next/server"

// Admin credentials (should match accountStorage.ts)
const ADMIN_EMAIL = "konnitihadesukon@corpvia.net"
const ADMIN_PASSWORD = "Remon240"

export interface AdminAuthResult {
    isAuthenticated: boolean
    error?: string
}

/**
 * Verify admin authentication from request headers
 * Expects: X-Admin-Email and X-Admin-Password headers
 */
export function verifyAdminAuth(request: NextRequest): AdminAuthResult {
    const email = request.headers.get("X-Admin-Email")
    const password = request.headers.get("X-Admin-Password")

    if (!email || !password) {
        return { isAuthenticated: false, error: "Missing authentication headers" }
    }

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        return { isAuthenticated: false, error: "Invalid credentials" }
    }

    return { isAuthenticated: true }
}

/**
 * Helper to create unauthorized response
 */
export function unauthorizedResponse(message: string = "Unauthorized") {
    return NextResponse.json({ error: message }, { status: 401 })
}

/**
 * Rate limiting helper
 * Note: In serverless environments, this is per-instance only.
 * For production, use Redis, Upstash, or Vercel KV.
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
    identifier: string,
    maxRequests: number = 100,
    windowMs: number = 60000
): { allowed: boolean; remaining: number } {
    const now = Date.now()
    const record = rateLimitMap.get(identifier)

    if (!record || now > record.resetTime) {
        rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
        return { allowed: true, remaining: maxRequests - 1 }
    }

    if (record.count >= maxRequests) {
        return { allowed: false, remaining: 0 }
    }

    record.count++
    return { allowed: true, remaining: maxRequests - record.count }
}

/**
 * Get client IP from request
 */
export function getClientIp(request: NextRequest): string {
    const forwarded = request.headers.get("x-forwarded-for")
    const realIp = request.headers.get("x-real-ip")
    const ip = forwarded ? forwarded.split(",")[0].trim() : realIp || "unknown"
    return ip
}

/**
 * Sanitize string input - removes dangerous characters but keeps content readable
 * Only removes actual script/HTML tags, not encoding all special characters
 */
export function sanitizeInput(input: string): string {
    if (typeof input !== "string") return ""
    return input
        .trim()
        // Remove script tags and their contents
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        // Remove other potentially dangerous tags
        .replace(/<(iframe|object|embed|link|style|meta)[^>]*>/gi, "")
        // Remove javascript: and data: URLs
        .replace(/javascript:/gi, "")
        .replace(/data:/gi, "")
        // Remove event handlers
        .replace(/on\w+\s*=/gi, "")
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * Validate phone number format (Japanese)
 */
export function isValidPhone(phone: string): boolean {
    const phoneRegex = /^[0-9-]+$/
    return phoneRegex.test(phone)
}
