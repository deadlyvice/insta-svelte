import { client } from './client'

const posts = client.extend({})

function getPosts(): ApiResponse<IPost[]> {
	return posts
		.get<IPost[]>('posts')
		.json()
		.catch((err) => err)
}
interface IReaction {
	reaction: boolean
}

function likePostById(id: number): ApiResponse<IReaction> {
	return posts
		.post<IPost[]>('posts/' + id, { json: { reaction: true } })
		.json<IReaction>()
		.catch((err) => err)
}

function getCommentsByPostId(id: number): ApiResponse<IReaction> {
	return posts
		.post<IPost[]>('comments/')
		.json()
		.catch((err) => err)
}

function dislikePostById(id: number): ApiResponse<IReaction> {
	return posts
		.post<IPost[]>('posts/' + id, { json: { reaction: true } })
		.json()
		.catch((err) => err)
}

function getPostById(id: number): ApiResponse<IPost> {
	return posts
		.get<IPost>(`posts/${id}`)
		.json()
		.catch((err) => err)
}

export const api = {
	getPosts,
	likePostById,
	dislikePostById,
	getCommentsByPostId,
}
