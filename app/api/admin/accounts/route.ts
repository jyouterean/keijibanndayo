import { NextResponse } from "next/server"
import { getDb } from "@/lib/neon/client"

export async function GET() {
    try {
        const sql = getDb()

        const accounts = await sql`
      SELECT id, nickname, phone, email, account_type, company_name, 
             representative_name, driver_count, name, age, is_admin, verified, created_at
      FROM accounts
      ORDER BY created_at DESC
    `

        return NextResponse.json({ accounts })
    } catch (error) {
        console.error("Error fetching accounts:", error)
        return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 })
    }
}
