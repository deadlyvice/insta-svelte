// src/stores/auth.ts
import {
	api,
	type ICommentPayload,
	type IPostPublicationPayload,
} from '$lib/api/posts'
import { writable } from 'svelte/store'

function postsState() {
	const { subscribe, set, update } = writable<IPost[] | undefined>()

	return {
		subscribe,

		async getPosts() {
			return api.getPosts()
		},

		async getPostsById(id:number) {
			return api.getPostById(id)
		},

		async setReaction(id: number, payload: boolean | null) {
			return api.postReactionById(id, payload)
		},

		async getCommentsByPostId(id: number) {
			return api.getCommentsByPostId(id)
		},
		async postComment(postId: number, data: ICommentPayload) {
			return api.postComment(data)
		},

		async postPublication(payload: IPostPublicationPayload) {
			const data = await api.postPublication(payload)
			return data
		},
	}
}

export const posts = postsState()
