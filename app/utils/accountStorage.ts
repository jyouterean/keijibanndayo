import type { UserAccount, AdminAccount, BannedUser } from "../types"

// ストレージキー
const NICKNAME_KEY = "keijiban_nickname"
const ACCOUNT_KEY = "keijiban_account"
const BANNED_USERS_KEY = "keijiban_banned_users"
const GUEST_COUNTER_KEY = "keijiban_guest_counter"

const ADMIN_CREDENTIALS = {
  email: "konnitihadesukon@corpvia.net",
  password: "Remon240",
  nickname: "管理者",
}

export function checkAdminLogin(email: string, password: string): AdminAccount | null {
  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    return {
      type: "admin",
      email: ADMIN_CREDENTIALS.email,
      password: ADMIN_CREDENTIALS.password,
      nickname: ADMIN_CREDENTIALS.nickname,
      verified: true,
    }
  }
  return null
}

export function isAdmin(account: UserAccount | null): boolean {
  return account?.type === "admin"
}

// ニックネームを取得
export function getNickname(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(NICKNAME_KEY)
}

// ニックネームを保存
export function setNickname(nickname: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(NICKNAME_KEY, nickname)
}

// ニックネームをクリア（ログアウト）
export function clearNickname(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(NICKNAME_KEY)
}

export function getAccount(): UserAccount | null {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem(ACCOUNT_KEY)
  if (!stored) return null
  try {
    return JSON.parse(stored) as UserAccount
  } catch {
    return null
  }
}

export function setAccount(account: UserAccount): void {
  if (typeof window === "undefined") return
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account))
  localStorage.setItem(NICKNAME_KEY, account.nickname)
}

export function clearAccount(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(ACCOUNT_KEY)
  localStorage.removeItem(NICKNAME_KEY)
}

export function getBannedUsers(): BannedUser[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(BANNED_USERS_KEY)
  if (!stored) return []
  try {
    return JSON.parse(stored) as BannedUser[]
  } catch {
    return []
  }
}

export function banUser(identifier: string, reason?: string): void {
  if (typeof window === "undefined") return
  const banned = getBannedUsers()
  if (!banned.find((b) => b.identifier === identifier)) {
    banned.push({ identifier: identifier, reason, bannedAt: Date.now() })
    localStorage.setItem(BANNED_USERS_KEY, JSON.stringify(banned))
  }
}

export function unbanUser(identifier: string): void {
  if (typeof window === "undefined") return
  const banned = getBannedUsers().filter((b) => b.identifier !== identifier)
  localStorage.setItem(BANNED_USERS_KEY, JSON.stringify(banned))
}

export function isUserBanned(identifier: string): boolean {
  return getBannedUsers().some((b) => b.identifier === identifier)
}

export async function generateGuestNickname(): Promise<string> {
  const { fetchGuestNumber } = await import("@/lib/api")
  const guestNumber = await fetchGuestNumber()
  return `ゲスト${guestNumber}`
}
