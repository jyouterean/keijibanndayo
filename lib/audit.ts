import { getDb } from "./neon/client"

export interface AuditLog {
    action: string
    user: string
    ip: string
    details?: string
    timestamp: Date
}

/**
 * Log a security-sensitive action to the database
 */
export async function logAuditEvent(
    action: string,
    user: string,
    ip: string,
    details?: string
): Promise<void> {
    const sql = getDb()

    try {
        await sql`
      INSERT INTO audit_logs (action, user_identifier, ip_address, details, created_at)
      VALUES (${action}, ${user}, ${ip}, ${details || null}, NOW())
    `
    } catch (error) {
        // Don't fail the main operation if audit logging fails
        console.error("[Audit] Failed to log event:", error)
    }
}

/**
 * Log admin login attempt
 */
export async function logAdminLogin(email: string, ip: string, success: boolean): Promise<void> {
    await logAuditEvent(
        success ? "ADMIN_LOGIN_SUCCESS" : "ADMIN_LOGIN_FAILED",
        email,
        ip,
        success ? "Admin logged in successfully" : "Failed login attempt"
    )
}

/**
 * Log message deletion
 */
export async function logMessageDeletion(
    adminEmail: string,
    messageId: string,
    ip: string
): Promise<void> {
    await logAuditEvent("MESSAGE_DELETED", adminEmail, ip, `Deleted message ID: ${messageId}`)
}

/**
 * Log user ban
 */
export async function logUserBan(
    adminEmail: string,
    bannedUser: string,
    ip: string,
    reason?: string
): Promise<void> {
    await logAuditEvent(
        "USER_BANNED",
        adminEmail,
        ip,
        `Banned user: ${bannedUser}. Reason: ${reason || "No reason provided"}`
    )
}

/**
 * Log suspicious activity
 */
export async function logSuspiciousActivity(
    action: string,
    ip: string,
    details: string
): Promise<void> {
    await logAuditEvent("SUSPICIOUS_ACTIVITY", "SYSTEM", ip, `${action}: ${details}`)
}
