import path from 'path'
import { promises as fs } from 'fs'
import { FastifyRequest } from 'fastify'
import { MultipartFile } from '@fastify/multipart'
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

export async function extractBody(req: FastifyRequest, onFile: (props: any) => Promise<any>) {
	const parts = req.parts()
	const form: Record<string, any> = {}
	const files: MultipartFile[] = []

	for await (const part of parts) {
		if (part.type === 'field') form[part.fieldname] = part.value
		else {
			const result = await onFile(part)
			files.push(result)
			part.file.resume()
		}
	}
	return { form, files }
}
