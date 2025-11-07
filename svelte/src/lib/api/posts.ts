import { client } from './client'

const posts = client.extend({})

function getPosts(): ApiResponse<IPost[]> {
	return posts
		.get<IPost[]>('posts')
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
}
