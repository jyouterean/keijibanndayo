import { NextRequest, NextResponse } from "next/server"
import { getThreadComments, addThreadComment, fetchAllThreads } from "@/lib/database"

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const messageId = searchParams.get("messageId")
    const all = searchParams.get("all")

    try {
        if (all === "true") {
            const threads = await fetchAllThreads()
            return NextResponse.json({ threads })
        }

        if (!messageId) {
            return NextResponse.json({ error: "Missing messageId parameter" }, { status: 400 })
        }

        const threads = await getThreadComments(messageId)
        return NextResponse.json({ threads })
    } catch (error) {
        console.error("Error fetching threads:", error)
        return NextResponse.json({ error: "Failed to fetch threads" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { messageId, nickname, content, accountId, isVerified, isAdmin } = body

        const newThread = await addThreadComment(messageId, nickname, content, accountId, isVerified, isAdmin)

        if (!newThread) {
            return NextResponse.json({ error: "Failed to add thread comment" }, { status: 500 })
        }

        return NextResponse.json({ thread: newThread })
    } catch (error) {
        console.error("Error adding thread comment:", error)
        return NextResponse.json({ error: "Failed to add thread comment" }, { status: 500 })
    }
}
