<script lang="ts">
	import { api } from '$lib/api/posts'
	import { gridState } from '$lib/components/PostGrid/PostGrid.state'
	import TestGrid from '$lib/components/PostGrid/TestGrid.svelte'
	import { toast } from '$lib/store/toastState.svelte'

	let input = $state('')

	// debounce timer reference
	let debounceTimer: ReturnType<typeof setTimeout> | null = null

	const grid = gridState()

	function onInput(e: Event) {
		const target = e.target as HTMLInputElement
		const value = target.value.trim()

		// clear previous timer
		if (debounceTimer) clearTimeout(debounceTimer)
		if (!value.length) return grid.setPosts([])

		// set new timer
		debounceTimer = setTimeout(async () => {
			console.log('Debounced value:', value)
			const posts = await api.getPostByNickname(value)

			if (posts.ok) grid.setPosts(posts.data)
			else toast.error('failed to fetch posts')
		}, 1000) // 1 second debounce
	}
</script>

<h1>Search users by <strong>Nickname</strong></h1>

<input
	type="text"
	bind:value={input}
	oninput={onInput}
	placeholder="Type nickname..."
	class="w-full rounded border p-2"
/>

<TestGrid posts={$grid} />
<span class="label">input to show posts</span>
