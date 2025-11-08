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

function postReactionById(
	id: number,
	reaction: boolean | null
): ApiResponse<IPost> {
	return posts
		.post<IPost[]>('posts/' + id + '/reaction', {
			json: { reaction },
		})
		.json<IReaction>()
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
	postReactionById,
	getCommentsByPostId,
	postComment,
	// getPostById,
}
