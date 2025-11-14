<script lang="ts">
	import { fade } from 'svelte/transition'
	import PostCard, { type IPropsPostCard } from '../PostCard.svelte'
	import type { IGridState } from './PostGrid.state'

	type IPostGridProps = {grid: IGridState} & Omit<IPropsPostCard, 'post'>

	const { grid, ...props }: IPostGridProps = $props()

	let withImgs: IPost[] = $state([])
	let withoutImgs: IPost[] = $state([])

	grid.subscribe((posts) => {
		withImgs = []
		withoutImgs = []
		for (let i = 0; i < posts.length; i++) {
			const current = posts[i]
			if (current?.img_urls?.length) withImgs.push(current)
			else withoutImgs.push(current)
	}
		console.log('---trigger subscribe ---\n',posts)
	})

</script>

<div class="p-4 lg:px-8">
	<div class="grid grid-cols-1 gap-4">
		{#each withImgs as post, i (post.id)}
			<div class=" " in:fade={{ delay: i * 150, duration: 300 }}>
				<PostCard {post} {...props} />
			</div>
		{/each}
	</div>

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each withoutImgs as post, i (post.id)}
		<div in:fade={{ delay: i * 150, duration: 300 }}>
			<PostCard {post} {...props} />
		</div>
		{/each}
	</div>
</div>
