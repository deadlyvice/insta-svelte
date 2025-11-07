// src/stores/auth.ts
import { api } from '$lib/api/posts'
import { writable } from 'svelte/store'

function postsState() {
	const { subscribe, set, update } = writable<IPost[] | undefined>()

	return {
		subscribe,

		async getPosts() {
			return api.getPosts()
		},

		async likePost(id: number) {
			return api.likePostById(id)
		},

		async deslikePost(id: number) {
			return api.dislikePostById(id)
		},

		async getCommentsByPostId(id: number) {
			return api.getCommentsByPostId(id)
		},
	}
}

export const posts = postsState()
