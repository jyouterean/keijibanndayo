import { NextRequest, NextResponse } from "next/server"
import { checkAdminLogin } from "@/lib/database"
import { checkRateLimit, getClientIp } from "@/lib/security"

export async function POST(request: NextRequest) {
    // Rate limiting for admin login (very strict to prevent brute force)
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(`admin-login-${ip}`, 5, 900000) // 5 attempts per 15 minutes
    if (!rateLimit.allowed) {
        return NextResponse.json(
            { error: "Too many login attempts. Please try again in 15 minutes." },
            { status: 429 }
        )
    }

    try {
        const body = await request.json()
        const { email, password } = body

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
        }

        const admin = await checkAdminLogin(email, password)

        if (!admin) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
        }

        return NextResponse.json({ admin })
    } catch (error) {
        console.error("Error checking admin login:", error)
        return NextResponse.json({ error: "Failed to check admin login" }, { status: 500 })
    }
}
