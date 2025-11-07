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
	}
}

export const posts = postsState()
