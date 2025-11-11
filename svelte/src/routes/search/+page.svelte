<script lang="ts">
	import { api } from '$lib/api/posts'
	import Loader from '$lib/components/Loader.svelte'
	import { gridState } from '$lib/components/PostGrid/PostGrid.state'
	import TestGrid from '$lib/components/PostGrid/TestGrid.svelte'
	import { toast } from '$lib/store/toastState.svelte'

	let input = $state('')
	let isLoading = $state(false)

	// debounce timer reference
	let debounceTimer: ReturnType<typeof setTimeout> | null = null

	const grid = gridState()

	function onInput(e: Event) {
		isLoading = false

		const target = e.target as HTMLInputElement
		const value = target.value.trim()

		// clear previous timer
		if (debounceTimer) clearTimeout(debounceTimer)
		if (!value.length) return grid.setPosts([])

		// set new timer
		isLoading = true
		debounceTimer = setTimeout(async () => {
			console.log('Debounced value:', value)
			const posts = await api.getPostByNickname(value)
			isLoading = false

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
	class="my-4 w-full rounded border p-2"
/>

{#if isLoading}
	<Loader />
{/if}

{#if !input.length}
	<div class="container">
		<h1 class="info">input to show posts</h1>
	</div>
{:else if !$grid.length && !isLoading}
	<div class="container">
		<h1 class="info">Posts by <strong>{input}</strong> not found</h1>
	</div>
	<!-- content here -->
{:else}
	<TestGrid posts={$grid} />
{/if}

<style>
	.container {
		@apply flex h-full w-full place-items-center;
	}
	.info {
		@apply w-full text-center;
	}
</style>
