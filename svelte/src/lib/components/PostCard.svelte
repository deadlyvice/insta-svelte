<script lang="ts">
	import ImageWithSkeleton from '$lib/components/ImageWithSkeleton.svelte'
	import CommentList from '$lib/components/CommentList.svelte'
	import { api } from '$lib/api/posts'
	import { profile } from '$lib/store/userState.svelte'
	import { toast } from '$lib/store/toastState.svelte'

	export interface IPropsPostCard {
		onDeletePost?: (postId: number) => void
		OnDeleteComment?: (comments: any) => void
		post: IPost
	}

	let { post, onDeletePost }: IPropsPostCard = $props()

	let reactionLoading = $state(false)
	let showComments = $state(false)
	let commentsLoading = $state(false)
	let commentsLoaded = $state(false)
	let comments: IComment[] = $state([])
	let error = $state('')

	function excerpt(text: string, n = 160) {
		if (!text) return ''
		return text.length > n ? text.slice(0, n).trim() + '…' : text
	}

	async function setReaction(reaction: boolean | null) {
		if (reactionLoading) return

		if (post.reaction === reaction) {
			reaction = null
		}
		try {
			reactionLoading = true
			console.log(post.id, { reaction })

			const res = await api.postReactionById(post.id, reaction)
			if (res.ok) {
				console.log(res.data)
				// server returns updated post
				post = res.data
			} else {
				toast.error(res.status === 401 ? 'authorize to react to posts' : 'unexpected err')
				console.log(res)
			}
		} catch (err) {
			console.error('reaction failed', err)
		} finally {
			reactionLoading = false
		}
	}

	async function toggleComments() {
		showComments = !showComments
		if (showComments && !commentsLoaded) {
			commentsLoading = true
			try {
				const res = await api.getCommentsByPostId(post.id)
				if (res && (res as any).ok && (res as any).data) {
					comments = (res as any).data
				} else {
					comments = []
				}
			} catch (err) {
				comments = []
			} finally {
				commentsLoaded = true
				commentsLoading = false
			}
		}
	}

	const isReactionDisabled =
		// !$profile?.id ||
		reactionLoading
</script>

<article class="card relative">
	<div class="flex items-center justify-between pb-2!">
		<div class="flex flex-wrap items-center gap-4">
			<div class="avatar" aria-hidden="true">
				{#if post.img_url}
					<img src={post.img_url} alt="" />
				{/if}
			</div>

			{#if post.nickname}
				<a href={'profile/' + post.author_id}>
					{post.nickname} #{post.author_id}
				</a>
			{/if}
		</div>

		{#if post.author_id === $profile?.id && onDeletePost}
			<button class="mb-1 hover:bg-red-400!" onclick={() => onDeletePost(post.id)}
				>delete</button
			>
		{/if}
	</div>
	<h3 class="text-lg font-semibold">{post.title}</h3>

	{#if post.img_urls?.length}
		{#if post.img_urls.length === 1}
			<ImageWithSkeleton src={post.img_urls[0]} alt={post.title} aspect="16-9" />
		{:else}
			<div class="mb-3 grid grid-cols-2 gap-2">
				{#each post.img_urls.slice(0, 4) as url}
					<ImageWithSkeleton src={url} alt={post.title} aspect="1-1" />
				{/each}
			</div>
		{/if}
	{:else}
		<ImageWithSkeleton src={null} alt="placeholder" aspect="16-9" />
	{/if}
	<header class="mb-2">
		<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{excerpt(post.content, 120)}</p>
	</header>

	<footer class="relative mt-3">
		<div
			class="flex flex-wrap items-center justify-between text-sm text-gray-600 dark:text-gray-300"
		>
			<div class="relative flex w-full items-center gap-3 max-md:flex-wrap">
				<div class=" absolute right-1 bottom-0 text-xs text-gray-400">#{post.id}</div>
				<button
					data-like={post.reaction}
					aria-label="Like"
					class="flex items-center gap-1"
					onclick={() => setReaction(true)}
					disabled={isReactionDisabled}
				>
					<!-- icon -->
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
						><path
							d="M12 21s-6-4.35-9-7.5C-0.5 11.5 1 6.5 5 5.5c2.5-.6 4.5 1 7 3.5 2.5-2.5 4.5-4.1 7-3.5 4 1 5.5 6 2 8-3 3.15-9 7.5-9 7.5z"
							fill="currentColor"
						/></svg
					>
					<span>{post.like_count}</span>
				</button>

				<button
					data-dislike={post.reaction === false}
					aria-label="Dislike"
					class="flex items-center gap-1"
					onclick={() => setReaction(false)}
					disabled={isReactionDisabled}
				>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
						><path
							d="M12 3s6 4.35 9 7.5c3.5 3.65 2 8.65-2 9.5-2.5.6-4.5-1-7-3.5-2.5 2.5-4.5 4.1-7 3.5-4-1-5.5-6-2-8C6 7.85 12 3 12 3z"
							fill="currentColor"
						/></svg
					>
					<span>{post.dislike_count}</span>
				</button>

				<button
					aria-label="Comments"
					class="flex grow items-center gap-1"
					onclick={toggleComments}
				>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
						><path
							d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
							fill="currentColor"
						/></svg
					>
					<span>Comments</span>
				</button>
			</div>
		</div>

		<div class="comments-panel {showComments ? 'open' : ''}">
			{#if showComments}
				{#if commentsLoading}
					<div style="padding:12px">Loading comments…</div>
				{:else}
					<CommentList {comments} loading={commentsLoading} postId={post.id} />
				{/if}
			{/if}
		</div>
	</footer>
</article>

<style>
</style>
