import { getDb } from "./neon/client"
import type { Message, ThreadComment, UserAccount, AdminAccount } from "@/app/types"

// ================== Guest Counter ==================

export async function getNextGuestNumber(): Promise<number> {
  const sql = getDb()

  try {
    const result = await sql`
      SELECT current_number FROM guest_counter WHERE id = 1
    `

    if (!result || result.length === 0) {
      return 1
    }

    const currentNumber = result[0].current_number
    const nextNumber = currentNumber >= 100 ? 1 : currentNumber + 1

    await sql`
      UPDATE guest_counter 
      SET current_number = ${nextNumber}, updated_at = NOW() 
      WHERE id = 1
    `

    return nextNumber
  } catch (error) {
    console.error("[Neon] Error fetching guest number:", error)
    return 1
  }
}

// ================== Accounts ==================

export async function createAccount(
  account: Omit<UserAccount, "verified"> & { password?: string },
): Promise<UserAccount | null> {
  const sql = getDb()

  try {
    const phoneNumber = "phoneNumber" in account ? account.phoneNumber : null
    const email = "email" in account ? account.email : null
    const companyName = account.type === "company" && "companyName" in account ? account.companyName : null
    const vehicleType = account.type === "driver" && "vehicleType" in account ? (account as any).vehicleType : null
    const isAdmin = account.type === "admin"

    await sql`
      INSERT INTO accounts (nickname, phone, email, account_type, company_name, vehicle_type, is_admin, verified)
      VALUES (${account.nickname}, ${phoneNumber}, ${email}, ${account.type}, ${companyName}, ${vehicleType}, ${isAdmin}, true)
    `

    return { ...account, verified: true }
  } catch (error) {
    console.error("[Neon] Error creating account:", error)
    return null
  }
}

export async function checkAdminLogin(
  email: string,
  password: string,
): Promise<(AdminAccount & { id: string }) | null> {
  const sql = getDb()

  if (email === "konnitihadesukon@corpvia.net" && password === "Remon240") {
    try {
      const result = await sql`
        SELECT id FROM accounts WHERE email = ${email} AND is_admin = true
      `

      if (!result || result.length === 0) {
        const newAdminResult = await sql`
          INSERT INTO accounts (nickname, email, account_type, is_admin, verified)
          VALUES ('管理者', ${email}, 'admin', true, true)
          RETURNING id
        `

        if (newAdminResult && newAdminResult.length > 0) {
          return {
            id: newAdminResult[0].id,
            type: "admin",
            email: email,
            password: password,
            nickname: "管理者",
            verified: true,
          }
        }
      } else {
        return {
          id: result[0].id,
          type: "admin",
          email: email,
          password: password,
          nickname: "管理者",
          verified: true,
        }
      }
    } catch (error) {
      console.error("[Neon] Error checking admin login:", error)
    }
  }
  return null
}

// ================== Messages ==================

export async function getMessages(tab: "projects" | "chat"): Promise<Message[]> {
  const sql = getDb()

  try {
    const result = await sql`
      SELECT * FROM messages 
      WHERE tab = ${tab} 
      ORDER BY created_at ASC
    `

    return result.map((msg: any) => ({
      id: msg.id,
      type: tab === "projects" ? "project" : "chat",
      nickname: msg.nickname,
      content: msg.content,
      timestamp: new Date(msg.created_at).getTime(),
      isVerified: msg.is_verified,
      isAdmin: msg.is_admin,
      imageUrl: msg.image_url,
      projectName: msg.project_name,
      phoneNumber: msg.phone,
      price: msg.price,
    }))
  } catch (error) {
    console.error("[Neon] Error fetching messages:", error)
    return []
  }
}

export async function addMessage(
  message: Omit<Message, "id" | "timestamp">,
  accountId?: string,
): Promise<Message | null> {
  const sql = getDb()

  try {
    const tab = message.type === "project" ? "projects" : "chat"

    const result = await sql`
      INSERT INTO messages (
        account_id, nickname, content, tab, is_verified, is_admin, 
        image_url, project_name, phone, price
      )
      VALUES (
        ${accountId || null}, 
        ${message.nickname}, 
        ${message.content}, 
        ${tab},
        ${message.isVerified || false}, 
        ${message.isAdmin || false},
        ${message.imageUrl || null}, 
        ${message.projectName || null}, 
        ${message.phoneNumber || null}, 
        ${message.price || null}
      )
      RETURNING *
    `

    if (!result || result.length === 0) {
      return null
    }

    const data = result[0]
    return {
      id: data.id,
      type: message.type,
      nickname: data.nickname,
      content: data.content,
      timestamp: new Date(data.created_at).getTime(),
      isVerified: data.is_verified,
      isAdmin: data.is_admin,
      imageUrl: data.image_url,
      projectName: data.project_name,
      phoneNumber: data.phone,
      price: data.price,
    }
  } catch (error) {
    console.error("[Neon] Error adding message:", error)
    return null
  }
}

export async function deleteMessage(messageId: string): Promise<boolean> {
  const sql = getDb()

  try {
    await sql`DELETE FROM messages WHERE id = ${messageId}`
    return true
  } catch (error) {
    console.error("[Neon] Error deleting message:", error)
    return false
  }
}

// ================== Threads ==================

export async function getThreadComments(messageId: string): Promise<ThreadComment[]> {
  const sql = getDb()

  try {
    const result = await sql`
      SELECT * FROM threads 
      WHERE message_id = ${messageId} 
      ORDER BY created_at ASC
    `

    return result.map((thread: any) => ({
      id: thread.id,
      messageId: thread.message_id,
      nickname: thread.nickname,
      content: thread.comment,
      timestamp: new Date(thread.created_at).getTime(),
      isAdmin: thread.is_admin,
      isVerified: thread.is_verified,
    }))
  } catch (error) {
    console.error("[Neon] Error fetching threads:", error)
    return []
  }
}

export async function addThreadComment(
  messageId: string,
  nickname: string,
  content: string,
  accountId?: string,
  isVerified?: boolean,
  isAdmin?: boolean,
): Promise<ThreadComment | null> {
  const sql = getDb()

  try {
    const result = await sql`
      INSERT INTO threads (message_id, account_id, nickname, comment, is_verified, is_admin)
      VALUES (${messageId}, ${accountId || null}, ${nickname}, ${content}, ${isVerified || false}, ${isAdmin || false})
      RETURNING *
    `

    if (!result || result.length === 0) {
      return null
    }

    const data = result[0]
    return {
      id: data.id,
      messageId: data.message_id,
      nickname: data.nickname,
      content: data.comment,
      timestamp: new Date(data.created_at).getTime(),
      isAdmin: data.is_admin,
      isVerified: data.is_verified,
    }
  } catch (error) {
    console.error("[Neon] Error adding thread comment:", error)
    return null
  }
}

export async function fetchAllThreads(): Promise<ThreadComment[]> {
  const sql = getDb()

  try {
    const result = await sql`
      SELECT * FROM threads ORDER BY created_at ASC
    `

    return result.map((thread: any) => ({
      id: thread.id,
      messageId: thread.message_id,
      nickname: thread.nickname,
      content: thread.comment,
      timestamp: new Date(thread.created_at).getTime(),
      isAdmin: thread.is_admin,
      isVerified: thread.is_verified,
    }))
  } catch (error) {
    console.error("[Neon] Error fetching all threads:", error)
    return []
  }
}

// ================== Banned Users ==================

export async function banUser(
  accountId: string,
  nickname: string,
  bannedBy: string,
  reason?: string,
): Promise<boolean> {
  const sql = getDb()

  try {
    await sql`
      INSERT INTO banned_users (account_id, nickname, banned_by, reason)
      VALUES (${accountId}, ${nickname}, ${bannedBy}, ${reason || null})
    `
    return true
  } catch (error) {
    console.error("[Neon] Error banning user:", error)
    return false
  }
}

export async function isUserBanned(accountId: string): Promise<boolean> {
  const sql = getDb()

  try {
    const result = await sql`
      SELECT id FROM banned_users WHERE account_id = ${accountId}
    `
    return result && result.length > 0
  } catch (error) {
    console.error("[Neon] Error checking banned status:", error)
    return false
  }
}

// ================== Subscriptions (Polling-based) ==================

// Note: Neon does not support realtime subscriptions like Supabase.
// These functions now return polling-style callbacks.

export function subscribeToMessages(tab: "projects" | "chat", callback: (messages: Message[]) => void) {
  let isActive = true

  const poll = async () => {
    if (!isActive) return

    const messages = await getMessages(tab)
    callback(messages)

    if (isActive) {
      setTimeout(poll, 5000) // Poll every 5 seconds
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

    const threads = await getThreadComments(messageId)
    callback(threads)

    if (isActive) {
      setTimeout(poll, 5000) // Poll every 5 seconds
    }
  }

  poll()

  return () => {
    isActive = false
  }
}

// ================== Aliases for compatibility ==================

export async function fetchMessages(tab: "projects" | "chat"): Promise<Message[]> {
  return getMessages(tab)
}

export async function fetchThreads(messageId: string): Promise<ThreadComment[]> {
  return getThreadComments(messageId)
}

export async function addThread(
  messageId: string,
  nickname: string,
  content: string,
  accountId?: string,
  isVerified?: boolean,
  isAdmin?: boolean,
): Promise<ThreadComment | null> {
  return addThreadComment(messageId, nickname, content, accountId, isVerified, isAdmin)
}

export async function addBannedUser(
  accountId: string,
  nickname: string,
  bannedBy: string,
  reason?: string,
): Promise<boolean> {
  return banUser(accountId, nickname, bannedBy, reason)
}
