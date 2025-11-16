import path from 'path'
import { promises as fs } from 'fs'

export const uploadsDir = path.join(process.cwd(), 'static')

export const ensureUploadDir = async () => {
	await fs.mkdir(uploadsDir, { recursive: true })
}

export function safeFilename(name: string) {
	// Disallow path separators and traversal
	if (!name) return null
	if (path.basename(name) !== name) return null
	return name
}

export async function ensureFileExists(filepath: string) {
	try {
		const stats = await fs.stat(filepath)
		if (!stats.isFile()) return null
		return stats
	} catch {
		return null
	}
}
