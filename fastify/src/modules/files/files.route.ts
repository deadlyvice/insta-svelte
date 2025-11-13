import { FastifyInstance } from 'fastify'
import { AppError } from '../../plugins/errors'
import path from 'path'
import { FileValidator, uploadsDir } from '../../utils' // make sure uploadsDir points to a writable folder
import { pipeline } from 'stream'
import { createWriteStream } from 'fs'
import { promisify } from 'util'
import { randomUUID } from 'crypto'

const pump = promisify(pipeline)
const validator = new FileValidator()

export async function privateFiles(app: FastifyInstance) {
	// Single file upload
	app.post('/upload/single', async (req, res) => {
		const data = await req.file()
		if (!data) throw new AppError(400, 'No file uploaded')

		// validate
		const validation = validator.validateFile(data.filename, data.mimetype)
		if (!validation.valid) {
			// return a 400 with details
			return res.code(400).send({ success: false, errors: validation.errors })
		}

		// generate unique filename (keep original extension)
		const ext = path.extname(data.filename) || ''
		const storedFilename = `${randomUUID()}${ext}`
		const filepath = path.join(uploadsDir, storedFilename)

		try {
			await pump(data.file, createWriteStream(filepath))

			return {
				success: true,
				originalFilename: data.filename,
				storedFilename,
				mimetype: data.mimetype,
				encoding: data.encoding,
				path: filepath,
			}
		} catch (error) {
			app.log.error(error)
			throw new AppError(500, 'Failed to save file')
		}
	})

	// Multiple files upload
	app.post('/upload/multiple', async (req, res) => {
		const parts = req.files()
		const results: any[] = []
		const maxFiles = 10
		let fileCount = 0

		for await (const part of parts) {
			// only handle file parts (skip form fields)
			if (!part.file) continue

			fileCount++

			// Check file limit
			if (fileCount > maxFiles) {
				// stop processing and return error
				return res.code(400).send({
					success: false,
					error: `Too many files. Maximum ${maxFiles} files allowed.`,
				})
			}

			// Validate each file (by filename + mimetype)
			const validation = validator.validateFile(part.filename, part.mimetype)

			if (!validation.valid) {
				results.push({
					originalFilename: part.filename,
					success: false,
					errors: validation.errors,
				})
				// consume the stream to avoid hanging (fastify multipart streams should be drained)
				try {
					// if part.file is a readable stream, piping to /dev/null via a writable stream:
					await pump(part.file, createWriteStream(path.join(uploadsDir, '.discard'))) // quick drain
				} catch {
					// ignore drain errors
				}
				continue
			}

			// Save valid files
			const ext = path.extname(part.filename) || ''
			const uniqueFilename = `${randomUUID()}${ext}`
			const filepath = path.join(uploadsDir, uniqueFilename)

			try {
				await pump(part.file, createWriteStream(filepath))

				results.push({
					originalFilename: part.filename,
					storedFilename: uniqueFilename,
					success: true,
					path: filepath,
				})
			} catch (error) {
				app.log.error(error)
				results.push({
					originalFilename: part.filename,
					success: false,
					errors: ['Failed to save file'],
				})
			}
		}

		const successful = results.filter((r) => r.success)
		const failed = results.filter((r) => !r.success)

		return {
			totalFiles: results.length,
			successful: successful.length,
			failed: failed.length,
			uploadTime: new Date().toISOString(),
			results,
		}
	})

	app.get('/', async () => {
		return { message: 'Fastify File Upload Service is ready' }
	})
}
