import { FastifyInstance } from 'fastify'
import { PostRepository } from './post.repository'
import { db } from '../../config/db'
import { AppError } from '../../plugins/errors'
import {
	// createPostSchema,
	// createPostSchema,
	getByQueryNickname,
	getPostByIdSchema,
	postReactionSchema,
	updatePostSchema,
} from './post.schema'
import { ReactionsRepository } from './reactions.repository'
import { getJwtSafe, protect } from '../auth/auth.utils'
import { CommentsRepository } from './comments.repository'
import { saveFile, uploadMultipleFiles } from '../files/files.route'

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

	app.post<{ Body: IPost }>('/', async (req, reply) => {
		const parts = await req.parts()
		const form: Record<string, any> = {}
		console.log('hello world')
		const files: string[] = []

		for await (const part of parts) {
			if (part.type === 'field') form[part.fieldname] = part.value
			else {
				const saved = await saveFile(part)
				files.push(saved)
			}
		}

		const { title, content } = form
		if (!title || !content) throw new AppError(400, 'required title and content')
		const payload = {
			title,
			content,
			author_id: req.user.id,
			img_urls: [] as string[],
		} as any

		const post = await posts.create(payload) // PASS payload, not req.body
		const [newPost] = await posts.readById(post.id, req.user.id)

		return { post: newPost, files }
	})

	app.patch<{ Params: { id: number }; Body: Partial<IPost> }>(
		'/:id',
		{ schema: updatePostSchema },
		async (req) => {
			const [post] = await posts.readById(req.params.id)
			if (!post) throw new AppError(404, 'post not found')
			if (post?.author_id !== req?.user?.id) throw new AppError(403, 'access denied')
			const updated = await posts.update(req.params.id, req.body)
			return updated
		}
	)

	app.delete<{ Params: { id: number } }>('/:id', { schema: getPostByIdSchema }, async (req) => {
		//getPostsIdsByUserId(req.user.id)
		const [post] = await posts.readById(req.params.id)
		if (post?.author_id !== req?.user?.id) throw new AppError(403, 'access denied')
		const deleted = await posts.delete(req.params.id)
		if (!deleted.length) throw new AppError(404, 'ERROR: post not found')
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
