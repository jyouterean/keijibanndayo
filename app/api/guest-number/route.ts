import { NextResponse } from "next/server"
import { getNextGuestNumber } from "@/lib/database"

export async function GET() {
    try {
        const guestNumber = await getNextGuestNumber()
        return NextResponse.json({ guestNumber })
    } catch (error) {
        console.error("Error getting guest number:", error)
        return NextResponse.json({ guestNumber: 1 }, { status: 500 })
    }
}
