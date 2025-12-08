import { NextRequest, NextResponse } from "next/server"
import { getNextGuestNumber } from "@/lib/database"
import { checkRateLimit, getClientIp } from "@/lib/security"

export async function GET(request: NextRequest) {
    // Rate limiting
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(`guest-number-${ip}`, 30, 60000)
    if (!rateLimit.allowed) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    try {
        const guestNumber = await getNextGuestNumber()
        return NextResponse.json({ guestNumber })
    } catch (error) {
        console.error("Error getting guest number:", error)
        return NextResponse.json({ guestNumber: 1 }, { status: 500 })
    }
}
