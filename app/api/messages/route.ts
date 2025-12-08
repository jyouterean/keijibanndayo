import { NextRequest, NextResponse } from "next/server"
import { getMessages, addMessage, deleteMessage } from "@/lib/database"

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const tab = searchParams.get("tab") as "projects" | "chat"

    if (!tab || (tab !== "projects" && tab !== "chat")) {
        return NextResponse.json({ error: "Invalid tab parameter" }, { status: 400 })
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
    try {
        const body = await request.json()
        const { message, accountId } = body

        const newMessage = await addMessage(message, accountId)

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
    try {
        const body = await request.json()
        const { messageId } = body

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
