<script lang="ts">
	import { api } from '$lib/api/posts'
	import { gridState } from '$lib/components/PostGrid/PostGrid.state'
	import TestGrid from '$lib/components/PostGrid/TestGrid.svelte'
	import { onMount } from 'svelte'

	const grid = gridState()

	onMount(() => {
		grid.initPosts(api.getPosts)
	})

	async function onDeletePost(postId: number) {
		console.log(postId)
		grid.removePostById(postId)
	}

	// async function onAddComment (postId: number) {
	//     console.log(postId);
	//     grid.removePostById(postId)
	// }
</script>

<!-- <button onclick={()=>{grid.removePostById()}}>add</button> -->
<TestGrid posts={$grid} {onDeletePost} />
