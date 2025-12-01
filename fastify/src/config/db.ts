import 'dotenv/config'
import { Client } from 'pg'

const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432
const useSsl = String(process.env.DB_SSL || '').toLowerCase() === 'true'

export const db = new Client({
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	host: process.env.DB_HOST,
	port: DB_PORT,
	database: process.env.DB_NAME,
	ssl: useSsl ? { rejectUnauthorized: true } : undefined,
})

export async function connectDB(): Promise<void> {
	try {
		await db.connect()
		if (process.env.DB_VERBOSE === 'true') console.log('✅ Connect to db success ✅')
	} catch (e) {
		console.error('❌ ERROR on connect db: ❌', e)
	}
}
