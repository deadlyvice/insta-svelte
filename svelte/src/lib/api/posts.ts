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

function likePostById(id: number): ApiResponse<IPost> {
	return posts
		.post<IPost[]>('posts/' + id + '/reaction', {
			json: { reaction: true },
		})
		.json<IReaction>()
		.catch((err) => err)
}
function dislikePostById(id: number): ApiResponse<IPost> {
	return posts
		.post<IPost[]>('posts/' + id + '/reaction', {
			json: { reaction: false },
		})
		.json()
		.catch((err) => err)
}

function getCommentsByPostId(id: number): ApiResponse<IPost> {
	return posts
		.get<IPost[]>('posts/' + id + '/comments')
		.json()
		.catch((err) => err)
}
export interface ICommentPayload {
	post_id: number
	data: string
}
function postComment(data: ICommentPayload): ApiResponse<IComment> {
	return posts
		.post<IPost[]>('comments', { json: data })
		.json()
		.catch((err) => err)
}

// function getPostById(id: number): ApiResponse<IPost> {
// 	return posts
// 		.get<IPost>(`posts/${id}`)
// 		.json()
// 		.catch((err) => err)
// }

export const api = {
	getPosts,
	likePostById,
	dislikePostById,
	getCommentsByPostId,
	postComment,
	// getPostById,
}
