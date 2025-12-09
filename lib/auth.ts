import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

// JWT secret - In production, use environment variable
const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "keijiban-super-secret-key-change-in-production-2024"
)
const ADMIN_EMAIL = "konnitihadesukon@corpvia.net"
const ADMIN_PASSWORD_HASH = "Remon240" // In production, use bcrypt hash

const SESSION_COOKIE_NAME = "admin_session"
const SESSION_DURATION = 60 * 60 * 24 // 24 hours

export interface AdminSession {
    email: string
    isAdmin: boolean
    exp: number
}

/**
 * Create a signed JWT token for admin session
 */
export async function createAdminSession(email: string): Promise<string> {
    const token = await new SignJWT({ email, isAdmin: true })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(`${SESSION_DURATION}s`)
        .sign(JWT_SECRET)

    return token
}

/**
 * Verify admin session from JWT token
 */
export async function verifyAdminSession(token: string): Promise<AdminSession | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET)
        return payload as unknown as AdminSession
    } catch {
        return null
    }
}

/**
 * Check admin credentials
 */
export function checkAdminCredentials(email: string, password: string): boolean {
    return email === ADMIN_EMAIL && password === ADMIN_PASSWORD_HASH
}

/**
 * Verify admin authentication from request cookies
 */
export async function verifyAdminFromRequest(request: NextRequest): Promise<{
    isAuthenticated: boolean
    session: AdminSession | null
    error?: string
}> {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!sessionToken) {
        return { isAuthenticated: false, session: null, error: "No session found" }
    }

    const session = await verifyAdminSession(sessionToken)
    if (!session || !session.isAdmin) {
        return { isAuthenticated: false, session: null, error: "Invalid session" }
    }

    // Check if session is expired
    if (session.exp && Date.now() >= session.exp * 1000) {
        return { isAuthenticated: false, session: null, error: "Session expired" }
    }

    return { isAuthenticated: true, session }
}

/**
 * Create response with admin session cookie
 */
export function createSessionResponse(token: string, data: object): NextResponse {
    const response = NextResponse.json(data)
    response.cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: SESSION_DURATION,
        path: "/",
    })
    return response
}

/**
 * Create response that clears admin session
 */
export function createLogoutResponse(): NextResponse {
    const response = NextResponse.json({ success: true })
    response.cookies.set(SESSION_COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0,
        path: "/",
    })
    return response
}
