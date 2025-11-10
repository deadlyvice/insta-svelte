<script lang="ts">
	import PostGrid from "$lib/components/PostGrid.svelte"
	import { posts } from "$lib/store/postsState.svelte"
	import { getContext } from "svelte"

	let input = $state('chr')
	const data = getContext('data')
	console.log({data});
	
</script>

<input type="text" bind:value={input} />

<PostGrid loadPostsOnMount={ ()=>{
	return posts.getPostsByNickname(input) as any
}}/>