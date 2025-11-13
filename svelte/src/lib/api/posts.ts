import { client } from './client'

const posts = client.extend({})


function getPosts(): ApiResponse<IPost[]> {
	return posts
		.get<IPost[]>('posts')
		.json()
		.catch((err) => err)
}

function getPostsByUserId(id: number): ApiResponse<IPost[]> {
	return posts
		.get<IPost[]>('users/' + id + '/posts')
		.json()
		.catch((err) => err)
}

function getPostByNickname(nickname: string): ApiResponse<IPost[]> {
	return posts
		.get<IPost[]>('posts?nickname=' + nickname)
		.json()
		.catch((err) => err)
}

interface IReaction {
	reaction: boolean
}

function postReactionById(id: number, reaction: boolean | null): ApiResponse<IPost> {
	return posts
		.post<IPost[]>('posts/' + id + '/reaction', {
			json: { reaction }
		})
		.json<IReaction>()
		.catch((err) => err)
}

function getCommentsByPostId(id: number): ApiResponse<ICommentWithUser[]> {
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
export interface IPostPublicationPayload {
	title: string
	content: string
	img_urls: string[]
	author_id: number
}
function postPublication(payload: IPostPublicationPayload): ApiResponse<IPost> {
	return posts
		.post<IPost>(`posts`, { json: payload })
		.json()
		.catch((err) => err)
}
function deletePublication(id: number): ApiResponse<IPost> {
	return posts
		.delete<IPost>(`posts/${id}`, { json: {} })
		.json()
		.catch((err) => err)
}

function deleteComment(id: number): ApiResponse<IPost> {
	return posts
		.delete<IPost>(`comments/${id}`, { json: {} })
		.json()
		.catch((err) => err)
}

export const api = {
	getPosts,
	getCommentsByPostId,
	getPostByNickname,
	getPostsByUserId,

	postReactionById,

	postComment,
	postPublication,

	deletePublication,
	deleteComment
}

// function getPostById(id: number): ApiResponse<IPost> {
// 	return posts
// 		.get<IPost>(`posts/${id}`)
// 		.json()
// 		.catch((err) => err)
// }
