<script lang="ts">
	import { onMount } from 'svelte'
	import PostCard, { type IPropsPostCard } from '../PostCard.svelte'
	import type { IGridState } from './PostGrid.state'

	type IPostGridProps = {
		posts: IPost[]
		grid: IGridState
	} & Omit<IPropsPostCard, 'post'>

	const { grid, ...props }: IPostGridProps = $props()

	let withImgs: IPost[] = $state([])
	let withoutImgs: IPost[] = $state([])

	grid.subscribe((posts) => {
		console.log('---trigger subscribe ---\n',posts)
		for (let i = 0; i < posts.length; i++) {
			const current = posts[i]
			if (current.img_urls.length) withImgs.push(current)
			else withoutImgs.push(current)
		}
	})
</script>

<div class="p-4 lg:px-8">
	<div class="grid grid-cols-1 gap-4">
		{#each withImgs as post (post.id)}
			<PostCard {post} {...props} />
		{/each}
	</div>

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each withoutImgs as post (post.id)}
			<PostCard {post} {...props} />
		{/each}
	</div>
</div>
