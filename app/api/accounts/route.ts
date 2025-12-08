import { NextRequest, NextResponse } from "next/server"
import { createAccount } from "@/lib/database"
import { checkRateLimit, getClientIp, sanitizeInput, isValidEmail, isValidPhone } from "@/lib/security"

export async function POST(request: NextRequest) {
    // Rate limiting for account creation (strict)
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(`create-account-${ip}`, 5, 300000) // 5 per 5 minutes
    if (!rateLimit.allowed) {
        return NextResponse.json({ error: "Too many account creation attempts. Please try again later." }, { status: 429 })
    }

    try {
        const body = await request.json()
        const { account } = body

        // Validate required fields
        if (!account || !account.nickname || !account.type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Validate email if provided
        if (account.email && !isValidEmail(account.email)) {
            return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
        }

        // Validate phone if provided
        if (account.phoneNumber && !isValidPhone(account.phoneNumber)) {
            return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 })
        }

        // Sanitize inputs
        const sanitizedAccount = {
            ...account,
            nickname: sanitizeInput(account.nickname),
            companyName: account.companyName ? sanitizeInput(account.companyName) : undefined,
            representativeName: account.representativeName ? sanitizeInput(account.representativeName) : undefined,
            name: account.name ? sanitizeInput(account.name) : undefined,
            phoneNumber: account.phoneNumber ? sanitizeInput(account.phoneNumber) : undefined,
            email: account.email ? sanitizeInput(account.email) : undefined,
        }

        const newAccount = await createAccount(sanitizedAccount)

        if (!newAccount) {
            return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
        }

        return NextResponse.json({ account: newAccount })
    } catch (error) {
        console.error("Error creating account:", error)
        return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
    }
}
