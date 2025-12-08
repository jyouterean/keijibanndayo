// Client-side API helper functions
// These call the server-side API routes

import type { Message, ThreadComment, UserAccount, AdminAccount } from "@/app/types"

const API_BASE = "/api"

// ================== Guest Number ==================

export async function fetchGuestNumber(): Promise<number> {
    try {
        const res = await fetch(`${API_BASE}/guest-number`)
        const data = await res.json()
        return data.guestNumber || 1
    } catch (error) {
        console.error("Error fetching guest number:", error)
        return 1
    }
}

// ================== Messages ==================

export async function fetchMessages(tab: "projects" | "chat"): Promise<Message[]> {
    try {
        const res = await fetch(`${API_BASE}/messages?tab=${tab}`)
        const data = await res.json()
        return data.messages || []
    } catch (error) {
        console.error("Error fetching messages:", error)
        return []
    }
}

export async function postMessage(
    message: Omit<Message, "id" | "timestamp">,
    accountId?: string,
): Promise<Message | null> {
    try {
        const res = await fetch(`${API_BASE}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, accountId }),
        })
        const data = await res.json()
        return data.message || null
    } catch (error) {
        console.error("Error posting message:", error)
        return null
    }
}

export async function removeMessage(messageId: string): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE}/messages`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messageId }),
        })
        const data = await res.json()
        return data.success || false
    } catch (error) {
        console.error("Error deleting message:", error)
        return false
    }
}

// ================== Threads ==================

export async function fetchThreads(messageId: string): Promise<ThreadComment[]> {
    try {
        const res = await fetch(`${API_BASE}/threads?messageId=${messageId}`)
        const data = await res.json()
        return data.threads || []
    } catch (error) {
        console.error("Error fetching threads:", error)
        return []
    }
}

export async function fetchAllThreads(): Promise<ThreadComment[]> {
    try {
        const res = await fetch(`${API_BASE}/threads?all=true`)
        const data = await res.json()
        return data.threads || []
    } catch (error) {
        console.error("Error fetching all threads:", error)
        return []
    }
}

export async function postThread(
    messageId: string,
    nickname: string,
    content: string,
    accountId?: string,
    isVerified?: boolean,
    isAdmin?: boolean,
): Promise<ThreadComment | null> {
    try {
        const res = await fetch(`${API_BASE}/threads`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messageId, nickname, content, accountId, isVerified, isAdmin }),
        })
        const data = await res.json()
        return data.thread || null
    } catch (error) {
        console.error("Error posting thread:", error)
        return null
    }
}

// ================== Accounts ==================

export async function createAccount(
    account: Omit<UserAccount, "verified"> & { password?: string },
): Promise<UserAccount | null> {
    try {
        const res = await fetch(`${API_BASE}/accounts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ account }),
        })
        const data = await res.json()
        return data.account || null
    } catch (error) {
        console.error("Error creating account:", error)
        return null
    }
}

// ================== Admin ==================

export async function checkAdminLogin(
    email: string,
    password: string,
): Promise<(AdminAccount & { id: string }) | null> {
    try {
        const res = await fetch(`${API_BASE}/admin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        })
        const data = await res.json()
        return data.admin || null
    } catch (error) {
        console.error("Error checking admin login:", error)
        return null
    }
}

// ================== Ban ==================

export async function banUser(
    accountId: string,
    nickname: string,
    bannedBy: string,
    reason?: string,
): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE}/ban`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accountId, nickname, bannedBy, reason }),
        })
        const data = await res.json()
        return data.success || false
    } catch (error) {
        console.error("Error banning user:", error)
        return false
    }
}

export async function isUserBanned(accountId: string): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE}/ban?accountId=${accountId}`)
        const data = await res.json()
        return data.banned || false
    } catch (error) {
        console.error("Error checking ban status:", error)
        return false
    }
}

// ================== Polling Subscriptions ==================

export function subscribeToMessages(tab: "projects" | "chat", callback: (messages: Message[]) => void) {
    let isActive = true

    const poll = async () => {
        if (!isActive) return

        const messages = await fetchMessages(tab)
        callback(messages)

        if (isActive) {
            setTimeout(poll, 5000)
        }
    }

    poll()

    return () => {
        isActive = false
    }
}

export function subscribeToThreads(messageId: string, callback: (threads: ThreadComment[]) => void) {
    let isActive = true

    const poll = async () => {
        if (!isActive) return

        const threads = await fetchThreads(messageId)
        callback(threads)

        if (isActive) {
            setTimeout(poll, 5000)
        }
    }

    poll()

    return () => {
        isActive = false
    }
}
