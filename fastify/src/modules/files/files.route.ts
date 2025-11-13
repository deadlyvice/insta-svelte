// src/modules/files/files.route.ts
import { FastifyInstance } from 'fastify'
import { AppError } from '../../plugins/errors'
import path from 'path'
import fs from 'fs'
import { promises as fsPromises } from 'fs'
import { FileValidator, uploadsDir } from '../../utils' // make sure uploadsDir points to a writable folder
import { pipeline } from 'stream'
import { createWriteStream } from 'fs'
import { promisify } from 'util'
import { randomUUID } from 'crypto'
import mime from 'mime-types'

const pump = promisify(pipeline)
const validator = new FileValidator()

function safeFilename(name: string) {
	// Disallow path separators and traversal
	if (!name) return null
	if (path.basename(name) !== name) return null
	return name
}

async function ensureFileExists(filepath: string) {
	try {
		const stats = await fsPromises.stat(filepath)
		if (!stats.isFile()) return null
		return stats
	} catch {
		return null
	}
}

export async function privateFiles(app: FastifyInstance) {
	// Single file upload
	app.post('/upload/single', async (req, res) => {
		const data = await req.file()
		if (!data) throw new AppError(400, 'No file uploaded')

		// validate
		const validation = validator.validateFile(data.filename, data.mimetype)
		if (!validation.valid) {
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
				// drain stream so multipart parser can continue
				try {
					await pump(part.file, createWriteStream(path.join(uploadsDir, '.discard')))
				} catch {
					// ignore
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

	// List files in uploadsDir
	app.get('/list', async (req, res) => {
		try {
			const names = await fsPromises.readdir(uploadsDir)
			const list = await Promise.all(
				names.map(async (name) => {
					const filepath = path.join(uploadsDir, name)
					const stats = await fsPromises.stat(filepath)
					return {
						filename: name,
						size: stats.size,
						mtime: stats.mtime.toISOString(),
						url: `${req.protocol}://${req.hostname}${
							app.prefix || ''
						}/files/raw/${encodeURIComponent(name)}`,
						downloadUrl: `${req.protocol}://${req.hostname}${
							app.prefix || ''
						}/files/download/${encodeURIComponent(name)}`,
					}
				})
			)
			return { total: list.length, files: list }
		} catch (err) {
			app.log.error(err)
			throw new AppError(500, 'Failed to list files')
		}
	})

	// STREAM (preview) with Range support
	app.get('/raw/:filename', async (req, res) => {
		const name = safeFilename((req.params as any).filename)
		if (!name) return res.code(400).send({ error: 'Invalid filename' })

		const filepath = path.join(uploadsDir, name)
		const stats = await ensureFileExists(filepath)
		if (!stats) return res.code(404).send({ error: 'File not found' })

		const mimeType = mime.lookup(name) || 'application/octet-stream'
		const range = (req.headers.range as string) || undefined
		const total = stats.size

		if (range) {
			// "bytes=START-END" (START or END may be omitted)
			const matches = /bytes=(\d*)-(\d*)/.exec(range)
			if (!matches) {
				return res.code(416).header('Content-Range', `bytes */${total}`).send()
			}
			const start = matches[1] ? parseInt(matches[1], 10) : 0
			const end = matches[2] ? parseInt(matches[2], 10) : total - 1

			if (isNaN(start) || isNaN(end) || start > end || end >= total) {
				return res.code(416).header('Content-Range', `bytes */${total}`).send()
			}

			res.code(206)
			res.header('Content-Range', `bytes ${start}-${end}/${total}`)
			res.header('Accept-Ranges', 'bytes')
			res.header('Content-Length', String(end - start + 1))
			res.header('Content-Type', mimeType)

			const stream = fs.createReadStream(filepath, { start, end })
			return res.send(stream) // <<-- use reply.send(stream)
		}

		// Full file
		res.header('Content-Type', mimeType)
		res.header('Content-Length', String(total))
		res.header('Accept-Ranges', 'bytes')

		const stream = fs.createReadStream(filepath)
		return res.send(stream) // <<-- use reply.send(stream)
	})

	// DOWNLOAD (attachment)
	app.get('/download/:filename', async (req, res) => {
		const name = safeFilename((req.params as any).filename)
		if (!name) return res.code(400).send({ error: 'Invalid filename' })

		const filepath = path.join(uploadsDir, name)
		const stats = await ensureFileExists(filepath)
		if (!stats) return res.code(404).send({ error: 'File not found' })

		const mimeType = mime.lookup(name) || 'application/octet-stream'
		res.header('Content-Type', mimeType)
		res.header('Content-Length', String(stats.size))

		// Make the browser download the file
		res.header('Content-Disposition', `attachment; filename="${name}"`)

		const stream = fs.createReadStream(filepath)
		return res.send(stream)
	})

	app.get('/', async () => {
		return { message: 'Fastify File Upload Service is ready' }
	})
}
