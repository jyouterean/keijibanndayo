import { neon } from "@neondatabase/serverless"

let sqlInstance: ReturnType<typeof neon> | null = null

export function getDb() {
    if (sqlInstance) {
        return sqlInstance
    }

    const databaseUrl = process.env.DATABASE_URL

    if (!databaseUrl) {
        throw new Error("Missing DATABASE_URL environment variable")
    }

    sqlInstance = neon(databaseUrl)
    return sqlInstance
}
