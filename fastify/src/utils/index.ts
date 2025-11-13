import path from 'path'
import { promises as fs } from 'fs'

export const uploadsDir = path.join(process.cwd(), 'static')

export const ensureUploadDir = async () => {
	await fs.mkdir(uploadsDir, { recursive: true })
}

export class FileValidator {
	allowedExtensions: string[]
	allowedMimeTypes: string[]

	constructor() {
		this.allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.txt']
		this.allowedMimeTypes = [
			'image/jpeg',
			'image/png',
			'image/webp',
			'application/pdf',
			'text/plain',
		]
	}

	/**
	 * Validate by filename extension and (optionally) mimetype.
	 */
	validateFile(filename: string | undefined, mimetype?: string | undefined) {
		const result: { valid: boolean; errors: string[] } = { valid: true, errors: [] }

		// Check filename exists
		if (!filename || filename.trim() === '') {
			result.valid = false
			result.errors.push('No filename provided')
			return result
		}

		// Use path.extname to get extension (handles missing dot properly)
		const ext = path.extname(filename).toLowerCase()
		if (!ext) {
			result.valid = false
			result.errors.push('File has no extension')
		} else if (!this.allowedExtensions.includes(ext)) {
			result.valid = false
			result.errors.push(
				`File extension '${ext}' not allowed. Allowed: ${this.allowedExtensions.join(', ')}`
			)
		}

		// If mimetype provided, validate it too (helps prevent spoofing)
		if (mimetype && !this.allowedMimeTypes.includes(mimetype)) {
			result.valid = false
			result.errors.push(`MIME type '${mimetype}' not allowed.`)
		}

		return result
	}
}
