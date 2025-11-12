import { get, writable } from 'svelte/store'

export function gridState() {
	const state = writable<IPost[]>([])
	const { subscribe, set, update } = state

	return {
		subscribe,

		async initPosts(call: () => ApiResponse<IPost[]>) {
			const res = await call()
			if (res.ok) set(res.data)
			return res
		},

		async setPosts(posts: IPost[]) {
			set(posts)
		},

		async removePostById(postId: number) {
			const posts = get(state)
			const modified = posts.filter(({ id }) => id !== postId)
			set(modified)
		},

		async pushPost(post: IPost) {
			return set([post, ...get(state)])
		},

		async initComments(postId: number, call: () => ApiResponse<IComment[]>) {
			const comments = await call()

			update((posts) => {
				const i = posts.findIndex(({ id }) => id === postId)
				posts[i].comments = comments.ok ? comments.data : []
				return posts
			})
			return comments
		},

		async setCommentCounter(postId: number, delta: number) {
			const posts = get(state)
			console.log({ posts })

			// const i = posts.findIndex(({ id }) => id === postId)
			// posts[i].comments_count += delta
		}
	}
}

export type IGridState = ReturnType<typeof gridState>
