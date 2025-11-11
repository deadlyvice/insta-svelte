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

		async initComments(
			postId: number,
			call: () => ApiResponse<IComment[]>
		) {
			const comments = await call()

			update((posts) => {
				const i = posts.findIndex(({ id }) => id === postId)
				posts[i].comments = comments.ok ? comments.data : []
				return posts
			})
			return comments
		},

		// async getPosts() {
		// 	// return api.getPosts()
		// },

		// async getPostsByNickname(searchBy: string) {
		// 	// if (!searchBy.length) {
		// 	//     return api.getPostByNickname(searchBy)
		// 	// }
		// 	// return api.getPosts()
		// },

		// async setReaction(id: number, payload: boolean | null) {
		// 	// return api.postReactionById(id, payload)
		// },

		// async getCommentsByPostId(id: number) {
		// 	// return api.getCommentsByPostId(id)
		// },
		// async postComment(postId: number, data: ICommentPayload) {
		// 	// return api.postComment(data)
		// },

		// async postPublication(payload: IPostPublicationPayload) {
		// 	// const data = await api.postPublication(payload)
		// 	// return data
		// },

		// async deletePublication(postId: number) {
		// 	const res = await api.deletePublication(postId)
		// 	if (res.ok) {
		// 	return res
		// },

		// async deleteComment(postId: number) {},
	}
}

// export const gridState = postsState()
