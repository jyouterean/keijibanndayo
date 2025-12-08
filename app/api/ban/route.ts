import { NextRequest, NextResponse } from "next/server"
import { banUser, isUserBanned } from "@/lib/database"
import { checkRateLimit, getClientIp, sanitizeInput } from "@/lib/security"

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const accountId = searchParams.get("accountId")

    // Rate limiting
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(`check-ban-${ip}`, 100, 60000)
    if (!rateLimit.allowed) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    if (!accountId) {
        return NextResponse.json({ error: "Missing accountId parameter" }, { status: 400 })
    }

    try {
        const banned = await isUserBanned(accountId)
        return NextResponse.json({ banned })
    } catch (error) {
        console.error("Error checking banned status:", error)
        return NextResponse.json({ error: "Failed to check banned status" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    // Rate limiting for ban actions
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(`ban-user-${ip}`, 10, 60000)
    if (!rateLimit.allowed) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    try {
        const body = await request.json()
        const { accountId, nickname, bannedBy, reason } = body

        if (!nickname || !bannedBy) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Sanitize inputs
        const sanitizedNickname = sanitizeInput(nickname)
        const sanitizedBannedBy = sanitizeInput(bannedBy)
        const sanitizedReason = reason ? sanitizeInput(reason) : undefined

        const success = await banUser(accountId || "", sanitizedNickname, sanitizedBannedBy, sanitizedReason)

        if (!success) {
            return NextResponse.json({ error: "Failed to ban user" }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error banning user:", error)
        return NextResponse.json({ error: "Failed to ban user" }, { status: 500 })
    }
}
