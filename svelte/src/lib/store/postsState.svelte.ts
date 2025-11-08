// src/stores/auth.ts
import { api, type ICommentPayload } from '$lib/api/posts'
import { writable } from 'svelte/store'

const reactions: Map<number, boolean | null> = new Map()

function postsState() {
	const { subscribe, set, update } = writable<IPost[] | undefined>()

	return {
		subscribe,

		async getPosts() {
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
	}
}

export const posts = postsState()
