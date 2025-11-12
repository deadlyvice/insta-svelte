<script lang="ts">
	import PostCard, { type IPropsPostCard } from '../PostCard.svelte'

	type IPostGridProps = {
		posts: IPost[]
	} & Omit<IPropsPostCard, 'post'>

	const { posts = [],  ...props }: IPostGridProps = $props()
</script>

<div class="p-4 lg:px-8">
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each posts as post (post.id)}
			<PostCard {post} {...props} />
		{/each}
	</div>
</div>
