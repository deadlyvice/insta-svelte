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
			console.log({ user, nickname })

			if (nickname?.length) return posts.readPostByAuthorNickname(nickname, user?.id)
			else posts.readAll(user?.id)
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

	app.post<{ Body: IPost }>('/', { schema: createPostSchema }, async (req) => {
		const post = await posts.create(req.body)
		await reactions.createUserPost(post.author_id, post.id)
		return (await posts.readById(post.id, req.user.id))[0]
	})

	app.patch<{ Params: { id: number }; Body: Partial<IPost> }>(
		'/:id',
		{ schema: updatePostSchema },
		async (req) => {
			return await posts.update(req.params.id, req.body)
		}
	)

	app.delete<{ Params: { id: number } }>('/:id', { schema: getPostByIdSchema }, async (req) => {
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
}
