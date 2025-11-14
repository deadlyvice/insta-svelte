import { FastifyInstance } from 'fastify'
import { db } from '../../config/db'
import { AppError } from '../../plugins/errors'
import { createCommentShema, getPostByIdSchema, updateCommentShema } from './post.schema'
import { protect } from '../auth/auth.utils'
import { CommentsRepository } from './comments.repository'
import { PostRepository } from './post.repository'

const comments = new CommentsRepository(db)
const posts = new PostRepository(db)

export async function publicComments(app: FastifyInstance) {
	app.get('/', async () => {
		return comments.readAll()
	})

	app.get<{ Params: { id: number } }>('/:id', { schema: getPostByIdSchema }, async (req) => {
		const post = await comments.readById(req.params.id)
		if (!post.length) throw new AppError(404, 'ERROR: post not found')
		return post[0]
	})
}

export async function privateComments(app: FastifyInstance) {
	await protect(app)

	app.post<{ Body: IComment }>('/', { schema: createCommentShema }, async (req) => {
		req.body.user_id = req.user.id
		return comments.create(req.body)
	})

	app.patch<{ Params: { id: number }; Body: Pick<IComment, 'data'> }>(
		'/:id',
		{ schema: updateCommentShema },
		async (req) => {
			return await comments.update(req.params.id, req.body)
		}
	)

	app.delete<{ Params: { id: number } }>('/:id', { schema: getPostByIdSchema }, async (req) => {
		const [post] = await comments.readById(req.params.id)
		if (post?.user_id !== req?.user?.id) throw new AppError(403, 'access denied')
		return comments.delete(req.params.id)
	})
}
