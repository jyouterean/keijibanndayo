import { NextRequest, NextResponse } from "next/server"
import { checkAdminLogin } from "@/lib/database"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password } = body

        const admin = await checkAdminLogin(email, password)

        if (!admin) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
        }

        return NextResponse.json({ admin })
    } catch (error) {
        console.error("Error checking admin login:", error)
        return NextResponse.json({ error: "Failed to check admin login" }, { status: 500 })
    }
}
