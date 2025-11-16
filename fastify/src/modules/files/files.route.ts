// src/modules/files/files.route.ts
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { AppError } from '../../plugins/errors'
import path from 'path'
import fs from 'fs'
import { promises as fsPromises } from 'fs'
import { ensureFileExists, FileValidator, safeFilename, uploadsDir } from '../../utils' // make sure uploadsDir points to a writable folder
import { pipeline } from 'stream'
import { createWriteStream } from 'fs'
import { promisify } from 'util'
import { randomUUID } from 'crypto'
import mime from 'mime-types'
// import { protect } from '../auth/auth.utils'
// import { type Multipart } from '@fastify/multipart'

export const pump = promisify(pipeline)
const validator = new FileValidator()

export const uploadMultipleFiles = async (req: FastifyRequest, res: FastifyReply) => {
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
				// path: filepath,
			})
		} catch (error) {
			console.log(error)

			// app.log.error(error)
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
}

export async function privateFiles(app: FastifyInstance) {
	// await protect(app)

	// Multiple files upload
	app.post('/upload/multiple', uploadMultipleFiles)
	// app.post('/upload/single', (req, res) => uploadSingleFile(req, res))

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
						url: `${req.protocol}://${req.hostname}:${process.env.PORT}${
							app.prefix || ''
						}/raw/${encodeURIComponent(name)}`,
						downloadUrl: `${req.protocol}://${req.hostname}:${process.env.PORT}${
							app.prefix || ''
						}/download/${encodeURIComponent(name)}`,
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

	// // DELETE a file
	// app.delete<{ Params: { id: any } }>(
	// 	'/:filename',
	// 	(req) => req.params.id && deleteFile(req.params.id)
	// )

	app.get('/', async () => {
		return { message: 'Fastify File Upload Service is ready' }
	})
}

//get file id example: uuid.jpg
export async function deleteFile(name: string) {
	name = safeFilename(name)!

	if (!name) throw new AppError(400, 'Invalid filename')

	const filepath = path.join(uploadsDir, name)
	const stats = await ensureFileExists(filepath)
	if (!stats) throw new AppError(404, 'File not found')

	try {
		await fsPromises.unlink(filepath)
		return name
	} catch (err) {
		console.log(err)
		throw new AppError(500, 'Failed to delete file')
	}
}

// async function uploadSingleFile(file: any) {
// 	// for await (const part of parts) {
// 	const pathname = './static/' + `${randomUUID()}` + file.filename
// 	await pump(file, fs.createWriteStream(pathname))
// 	// res.send(pathname)
// 	// await ensureFileExists(join(uploadsDir, pathname))
// 	// }
// }

export async function saveFile(part: any) {
	const id = `${randomUUID()}` + `.${part.filename.split('.')[1]}`

	const pathname = './static/' + id
	await pump(part.file, fs.createWriteStream(pathname))

	return id
}
