// src/stores/auth.ts
import {
	api,
	type ICommentPayload,
	type IPostPublicationPayload,
} from '$lib/api/posts'
import { get, writable } from 'svelte/store'

function postsState() {
	const { subscribe, set, update } = writable<IPost[] | undefined>()

	return {
		subscribe,

		async getPosts() {
			return api.getPosts()
		},

		async getPostsByUserId(userId: number) {
			return api.getPostById(userId)
		},

		async getPostsByNickname(searchBy: string) {
			if (!searchBy.length) {
				return api.getPostByNickname(searchBy)
			}
			return api.getPosts()
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

		// async deletePublication(postId: number) {
		// 	const res = await api.deletePublication(postId)
		// 	if (res.ok) {
		// 	return res
		// },

		// async deleteComment(postId: number) {},
	}
}

export const posts = postsState()
