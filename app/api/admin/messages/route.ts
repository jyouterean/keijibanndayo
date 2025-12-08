import { NextResponse } from "next/server"
import { getDb } from "@/lib/neon/client"

export async function GET() {
    try {
        const sql = getDb()

        const messages = await sql`
      SELECT id, nickname, content, tab, project_name, phone, price, 
             is_verified, is_admin, created_at
      FROM messages
      ORDER BY created_at DESC
    `

        return NextResponse.json({ messages })
    } catch (error) {
        console.error("Error fetching all messages:", error)
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
    }
}
