import { NextRequest, NextResponse } from "next/server"
import { getThreadComments, addThreadComment, fetchAllThreads } from "@/lib/database"
import { checkRateLimit, getClientIp, sanitizeInput } from "@/lib/security"

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const messageId = searchParams.get("messageId")
    const all = searchParams.get("all")

    // Rate limiting
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(`get-threads-${ip}`, 200, 60000)
    if (!rateLimit.allowed) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

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
    // Rate limiting for POST requests (stricter)
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(`post-thread-${ip}`, 15, 60000)
    if (!rateLimit.allowed) {
        return NextResponse.json({ error: "Too many requests. Please wait before posting again." }, { status: 429 })
    }

    try {
        const body = await request.json()
        const { messageId, nickname, content, accountId, isVerified, isAdmin } = body

        // Validate required fields
        if (!messageId || !nickname || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Sanitize inputs
        const sanitizedNickname = sanitizeInput(nickname)
        const sanitizedContent = sanitizeInput(content)

        const newThread = await addThreadComment(
            messageId,
            sanitizedNickname,
            sanitizedContent,
            accountId,
            isVerified,
            isAdmin
        )

        if (!newThread) {
            return NextResponse.json({ error: "Failed to add thread comment" }, { status: 500 })
        }

        return NextResponse.json({ thread: newThread })
    } catch (error) {
        console.error("Error adding thread comment:", error)
        return NextResponse.json({ error: "Failed to add thread comment" }, { status: 500 })
    }
}
