import { NextRequest, NextResponse } from "next/server"
import { banUser, isUserBanned } from "@/lib/database"

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const accountId = searchParams.get("accountId")

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
    try {
        const body = await request.json()
        const { accountId, nickname, bannedBy, reason } = body

        const success = await banUser(accountId, nickname, bannedBy, reason)

        if (!success) {
            return NextResponse.json({ error: "Failed to ban user" }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error banning user:", error)
        return NextResponse.json({ error: "Failed to ban user" }, { status: 500 })
    }
}
