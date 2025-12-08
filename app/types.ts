// メッセージの型定義
export interface Message {
  id: string
  type: "project" | "chat"
  nickname: string
  content: string
  timestamp: number
  isVerified?: boolean
  isAdmin?: boolean
  userId?: string
  imageUrl?: string
  // 案件専用フィールド
  projectName?: string
  phoneNumber?: string
  price?: string
  description?: string
}

// スレッドコメントの型定義
export interface ThreadComment {
  id: string
  messageId: string
  nickname: string
  content: string
  timestamp: number
  isAdmin?: boolean
  isVerified?: boolean
}

// 連投制限の型定義
export interface RateLimitInfo {
  timestamps: number[]
  blockedUntil: number | null
}

// タブの型定義
export type TabType = "project" | "chat"

export type AccountType = "company" | "driver" | "admin"

// 基本アカウント情報
interface BaseAccount {
  type: AccountType
  nickname: string
  phoneNumber: string
  email?: string
  verified: boolean
}

// 法人アカウント
export interface CompanyAccount extends BaseAccount {
  type: "company"
  companyName: string
  representativeName: string
  driverCount?: string
}

// 個人ドライバーアカウント
export interface DriverAccount extends BaseAccount {
  type: "driver"
  name: string
  age: string
}

export interface AdminAccount {
  type: "admin"
  email: string
  password: string
  nickname: string
  verified: boolean
}

export interface BannedUser {
  identifier: string
  reason?: string
  bannedAt: number
}

// ユーザーアカウントの共用型
export type UserAccount = CompanyAccount | DriverAccount | AdminAccount
