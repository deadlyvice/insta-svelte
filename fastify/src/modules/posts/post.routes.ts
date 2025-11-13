import { FastifyInstance } from 'fastify'
import { PostRepository } from './post.repository'
import { db } from '../../config/db'
import { AppError } from '../../plugins/errors'
import {
	createPostSchema,
	getByQueryNickname,
	getPostByIdSchema,
	postReactionSchema,
	updatePostSchema,
} from './post.schema'
import { ReactionsRepository } from './reactions.repository'
import { getJwtSafe, protect } from '../auth/auth.utils'
import { CommentsRepository } from './comments.repository'
import {
	cleanupRemovedImages,
	processAndSaveImages,
	deleteLocalPathIfOwned,
} from '../../utils/images'

const posts = new PostRepository(db)
const reactions = new ReactionsRepository(db)
const comments = new CommentsRepository(db)

export async function publicPosts(app: FastifyInstance) {
	app.get<{ Querystring: { nickname?: string } }>(
		'/',
		{ schema: getByQueryNickname },
		async (req) => {
			const user = getJwtSafe(app, req)
			const nickname = req.query.nickname

			if (nickname?.length) return posts.readByAuthorNickname(nickname, user?.id)
			else return posts.readAll(user?.id)
		}
	)

	app.get<{ Params: { id: number } }>('/:id', { schema: getPostByIdSchema }, async (req) => {
		const user = getJwtSafe(app, req)
		const post = await posts.readById(req.params.id, user?.id)

		if (!post.length) throw new AppError(404, 'ERROR: post not found')
		return post[0]
	})

	app.get<{ Params: { id: number } }>(
		'/:id/comments',
		{ schema: getPostByIdSchema },
		async (req) => {
			return comments.readByPostId(req.params.id)
		}
	)
}

export async function privatePosts(app: FastifyInstance) {
	await protect(app)

	app.post<{ Body: IPost }>('/', { schema: createPostSchema }, async (req, reply) => {
		// ensure author id from token
		req.body.author_id = req.user.id

		// process images (base64 -> saved files). If no images provided, this returns []
		if (req.body.img_urls && Array.isArray(req.body.img_urls)) {
			req.body.img_urls = await processAndSaveImages(req.body.img_urls, req.user.id)
		}

		const post = await posts.create(req.body)
		return (await posts.readById(post.id, req.user.id))[0]
	})

	app.patch<{ Params: { id: number }; Body: Partial<IPost> }>(
		'/:id',
		{ schema: updatePostSchema },
		async (req) => {
			const [post] = await posts.readById(req.params.id)
			if (!post) throw new AppError(404, 'post not found')
			if (post?.author_id !== req?.user?.id) throw new AppError(403, 'access denied')

			// If client sent img_urls, process them: save new base64 images and keep existing URLs
			let newImgUrls: string[] | undefined = undefined
			if (req.body.img_urls && Array.isArray(req.body.img_urls)) {
				// process any base64/data url entries
				newImgUrls = await processAndSaveImages(req.body.img_urls as string[], req.user.id)
				// Merge with any non-base64 items originally in req.body.img_urls (processAndSaveImages already leaves them as-is)
				req.body.img_urls = newImgUrls
			}

			const updated = await posts.update(req.params.id, req.body)

			// optional: cleanup files removed by update (if DB replaced old array)
			// post.img_urls may be JSON in DB; ensure we parse if necessary
			try {
				let oldImgs: string[] = []
				if (Array.isArray(post.img_urls)) oldImgs = post.img_urls
				else if (typeof post.img_urls === 'string')
					oldImgs = JSON.parse(post.img_urls || '[]')
				await cleanupRemovedImages(oldImgs, newImgUrls, req.user.id)
			} catch (e) {
				// ignore cleanup errors
				console.error('cleanup error', e)
			}

			return updated
		}
	)

	app.delete<{ Params: { id: number } }>('/:id', { schema: getPostByIdSchema }, async (req) => {
		//getPostsIdsByUserId(req.user.id)
		const [post] = await posts.readById(req.params.id)
		if (post?.author_id !== req?.user?.id) throw new AppError(403, 'access denied')

		const deleted = await posts.delete(req.params.id)
		if (!deleted.length) throw new AppError(404, 'ERROR: post not found')

		const localDelete = post.img_urls.map(async (imgBase) => {
			return deleteLocalPathIfOwned(imgBase, req.user.id)
		})

		await Promise.all(localDelete)

		return deleted[0]
	})

	app.post<{ Params: { id: number }; Body: IReaction }>(
		'/:id/reaction',
		{ schema: postReactionSchema },
		async (req) => {
			console.log(req.body, req.params.id, req.user.id, req.user.nickname)
			await reactions.setReaction(req.params.id, req.user.id, req.body)
			return (await posts.readById(req.params.id, req.user.id))[0]
		}
	)

	app.post('/seed', async (req) => {
		const promises: any[] = []

		for (let i = 0; i < 1000; i++) {
			promises.push(
				posts.create({
					content: 'CONTENT SEED ' + i,
					title: 'TITLE SEED' + i,
					img_urls: [],
					author_id: req.user.id,
				})
			)
		}
		const res = await Promise.all(promises)
		return res
	})
}
