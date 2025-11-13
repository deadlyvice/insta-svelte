import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

const STATIC_DIR = path.join(process.cwd(), 'static')
const UPLOADS_PREFIX = '/static'

function randomHex(len = 8) {
	return crypto.randomBytes(len).toString('hex')
}

function isDataUrl(s: string) {
	return typeof s === 'string' && s.startsWith('data:')
}

// Sometimes client may send "raw" base64 without data: prefix. We'll treat those as base64 too:
function looksLikeBase64(s: string) {
	if (typeof s !== 'string') return false
	// rough check: long string with only base64 chars
	return /^[A-Za-z0-9+/=\s]+$/.test(s) && s.length > 200
}

function getExtFromMime(mime: string) {
	const m = mime.split('/')[1]
	if (!m) return 'png'
	if (m.includes('+')) return m.split('+')[0]
	return m.replace(/[^a-z0-9]/gi, '') || 'png'
}

async function ensureUserDir(authorId: number) {
	const dir = path.join(STATIC_DIR, `user${authorId}`)
	await fs.mkdir(dir, { recursive: true })
	return dir
}

/**
 * Save single base64 or data-url image to disk.
 * Accepts:
 *  - data:image/png;base64,....  (data url)
 *  - raw base64 string (we will use .png extension)
 *
 * Returns public path: '/static/user{authorId}/filename.ext'
 */
export async function saveBase64Image(imgBase64: string, authorId: number) {
	// if already a public path/URL, throw - caller should have guarded; but we'll just return it.
	if (!imgBase64) throw new Error('empty image')

	// data URL?
	if (isDataUrl(imgBase64)) {
		const match = imgBase64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/)
		if (!match) throw new Error('Invalid data URL image')
		const mime = match[1]
		const b64 = match[2]
		const ext = getExtFromMime(mime)
		const filename = `${Date.now()}-${randomHex(6)}.${ext}`
		const dir = await ensureUserDir(authorId)
		const filepath = path.join(dir, filename)
		await fs.writeFile(filepath, Buffer.from(b64, 'base64'))
		return `${UPLOADS_PREFIX}/user${authorId}/${filename}`
	}

	// raw base64 (no data URL) -> assume png
	if (looksLikeBase64(imgBase64)) {
		const filename = `${Date.now()}-${randomHex(6)}.png`
		const dir = await ensureUserDir(authorId)
		const filepath = path.join(dir, filename)
		await fs.writeFile(filepath, Buffer.from(imgBase64, 'base64'))
		return `${UPLOADS_PREFIX}/user${authorId}/${filename}`
	}

	// not base64/data URL -> return as-is (probably already a path or remote URL)
	return imgBase64
}

/**
 * Process array of image items (mixed base64 / data URLs / URLs/paths).
 * Returns array of public paths (strings).
 * Only base64/dataURL entries are saved to disk and replaced with local path.
 * Non-base64 entries are returned as-is.
 */
export async function processAndSaveImages(
	imgs: (string | undefined | null)[] | undefined,
	authorId: number
) {
	if (!imgs || !Array.isArray(imgs)) return []
	const out: string[] = []
	for (const item of imgs) {
		if (!item) continue
		try {
			if (isDataUrl(item) || looksLikeBase64(item)) {
				const saved = await saveBase64Image(item, authorId)
				out.push(saved)
			} else {
				// already an URL / existing local path -> keep as is
				out.push(item)
			}
		} catch (e) {
			// if saving fails, skip that image but continue others
			console.error('failed to save image item', e)
		}
	}
	return out
}

/**
 * Delete local file if it lives under static/user{authorId}/... and the path starts with UPLOADS_PREFIX.
 */
export async function deleteLocalPathIfOwned(publicPath: string, authorId: number) {
	if (!publicPath || !publicPath.startsWith(UPLOADS_PREFIX)) return
	// expected pattern: /static/user{authorId}/filename
	const parts = publicPath.split('/')
	// parts[1] === 'static', parts[2] === `user${authorId}`
	if (!parts[2] || parts[2] !== `user${authorId}`) return
	const rel = parts.slice(2).join('/') // user{authorId}/filename
	const filepath = path.join(STATIC_DIR, rel)
	try {
		await fs.unlink(filepath)
	} catch (e) {
		// ignore not found
	}
}

/**
 * Cleanup: remove local files that were present in oldList but are not present in newList.
 * Only removes files that are local and owned by authorId.
 */
export async function cleanupRemovedImages(
	oldList: string[] | undefined,
	newList: string[] | undefined,
	authorId: number
) {
	if (!oldList || oldList.length === 0) return
	const newSet = new Set((newList || []).filter(Boolean))
	for (const old of oldList) {
		if (!old) continue
		// if old is local and not present in newList -> delete
		if (!newSet.has(old) && old.startsWith(UPLOADS_PREFIX)) {
			await deleteLocalPathIfOwned(old, authorId)
		}
	}
}
