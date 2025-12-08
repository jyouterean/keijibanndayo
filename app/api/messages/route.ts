import { NextRequest, NextResponse } from "next/server"
import { getMessages, addMessage, deleteMessage } from "@/lib/database"
import { checkRateLimit, getClientIp, sanitizeInput } from "@/lib/security"

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const tab = searchParams.get("tab") as "projects" | "chat"

    if (!tab || (tab !== "projects" && tab !== "chat")) {
        return NextResponse.json({ error: "Invalid tab parameter" }, { status: 400 })
    }

    // Rate limiting for GET requests
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(`get-messages-${ip}`, 200, 60000)
    if (!rateLimit.allowed) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    try {
        const messages = await getMessages(tab)
        return NextResponse.json({ messages })
    } catch (error) {
        console.error("Error fetching messages:", error)
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    // Rate limiting for POST requests (stricter)
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(`post-message-${ip}`, 10, 60000)
    if (!rateLimit.allowed) {
        return NextResponse.json({ error: "Too many requests. Please wait before posting again." }, { status: 429 })
    }

    try {
        const body = await request.json()
        const { message, accountId } = body

        // Sanitize inputs
        const sanitizedMessage = {
            ...message,
            nickname: sanitizeInput(message.nickname || ""),
            content: sanitizeInput(message.content || ""),
            projectName: message.projectName ? sanitizeInput(message.projectName) : undefined,
            phoneNumber: message.phoneNumber ? sanitizeInput(message.phoneNumber) : undefined,
            price: message.price ? sanitizeInput(message.price) : undefined,
            description: message.description ? sanitizeInput(message.description) : undefined,
        }

        const newMessage = await addMessage(sanitizedMessage, accountId)

        if (!newMessage) {
            return NextResponse.json({ error: "Failed to add message" }, { status: 500 })
        }

        return NextResponse.json({ message: newMessage })
    } catch (error) {
        console.error("Error adding message:", error)
        return NextResponse.json({ error: "Failed to add message" }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    // Rate limiting for DELETE requests
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(`delete-message-${ip}`, 20, 60000)
    if (!rateLimit.allowed) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    try {
        const body = await request.json()
        const { messageId } = body

        if (!messageId || typeof messageId !== "string") {
            return NextResponse.json({ error: "Invalid message ID" }, { status: 400 })
        }

        const success = await deleteMessage(messageId)

        if (!success) {
            return NextResponse.json({ error: "Failed to delete message" }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting message:", error)
        return NextResponse.json({ error: "Failed to delete message" }, { status: 500 })
    }
}
