import { NextRequest, NextResponse } from "next/server"
import { createAccount, banUser, isUserBanned } from "@/lib/database"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { account } = body

        const newAccount = await createAccount(account)

        if (!newAccount) {
            return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
        }

        return NextResponse.json({ account: newAccount })
    } catch (error) {
        console.error("Error creating account:", error)
        return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
    }
}
