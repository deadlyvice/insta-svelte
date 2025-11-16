import { FastifyInstance } from 'fastify'
import { AppError } from '../../plugins/errors'
import path from 'path'
import fs from 'fs'
import { promises as fsPromises } from 'fs'
import { ensureFileExists, safeFilename, uploadsDir } from '../../utils'
import { pipeline } from 'stream'
import { promisify } from 'util'
import { randomUUID } from 'crypto'
import mime from 'mime-types'

export const pump = promisify(pipeline)

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
export async function saveFile(part: any) {
	const id = `${randomUUID()}` + `.${part.filename.split('.')[1]}`

	const pathname = './static/' + id
	await pump(part.file, fs.createWriteStream(pathname))

	return id
}

export async function privateFiles(app: FastifyInstance) {
	// await protect(app)

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
}
