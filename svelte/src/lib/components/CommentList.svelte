<script lang="ts">
	import { api } from '$lib/api/posts'
	import { toast } from '$lib/store/toastState.svelte'
	import { profile } from '$lib/store/userState.svelte'

	export let post: IPost
	export let loading: boolean = false
	export let postId!: number
	
	let comments = post.comments as ICommentWithUser[]
	
	let text = ''
	let submitting = false
	
	
	// format date helper
	function fmt(date: string | Date) {
		const d = typeof date === 'string' ? new Date(date) : date
		return d.toLocaleString()
	}

	async function send() {
		const payload = { post_id: postId, data: text.trim() }
		if (!payload.data) return
		if (!$profile) return // user must be logged in

		submitting = true
		try {
			const res = await api.postComment(payload)
			if (res.ok) {
				// server returns created IComment
				const created = res.data as ICommentWithUser
				created.img_url = $profile?.img_url!
				comments = [...comments, created] // append returned comment
				text = ''
				post.comments_count += 1
			} else {
				// handle error (optional): you can show toast
				console.warn('Failed to post comment', res)
			}
		} catch (err) {
			console.error('postComment error', err)
		} finally {
			submitting = false
		}
	}

	export async function onDeleteComment(commentId: number) {
		const res = await api.deleteComment(commentId)
		if (!res.ok) return toast.error('failed to delete comment')
		comments = comments.filter(({ id }) => id !== commentId)
		post.comments_count -= 1
	}
</script>

{#if loading}
	<div class="comments-empty">Loading comments…</div>
{:else if comments.length === 0}
	<div class="comments-empty">No comments yet.</div>
{:else}
	<div>
		{#each comments as c (c.id)}
			<div class="comment">
				<div class="avatar" aria-hidden="true">
					{#if c?.img_url}
						<img src={c.img_url} alt="" />
					{/if}
				</div>

				<div style="flex:1">
					<div class="meta">
						<strong> {c?.nickname ?? 'User'} #{c.user_id}</strong>
						<span style="margin-left:8px">• {fmt(c.created_at)}</span>
						{#if $profile?.id === c.user_id}
							<button
								class="ml-[100%] p-1! hover:bg-red-500!"
								onclick={() => onDeleteComment(c.id)}>delete</button
							>
						{/if}
					</div>
					<div class="content">{c.data}</div>
				</div>
			</div>
		{/each}
	</div>
{/if}

{#if !$profile}
	<div class="text-red-400">register to write a comment</div>
{/if}
<div class="comment-input">
	<textarea bind:value={text} placeholder="Write a comment…"> </textarea>
	<button onclick={send} disabled={!$profile || submitting || text.trim().length === 0}>
		{#if submitting}Sending…{:else}Send{/if}
	</button>
</div>

<style>
	.comment {
		display: flex;
		gap: 12px;
		padding: 8px 0;
		border-bottom: 1px solid #f1f5f9;
		align-items: center;
	}

	.meta {
		font-size: 12px;
		color: #6b7280;
	}
	.content {
		margin-top: 4px;
		white-space: pre-wrap;
	}

	@keyframes pulse {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}

	.comments-empty {
		padding: 12px;
		color: #6b7280;
		text-align: center;
	}

	.comment-input {
		display: flex;
		gap: 8px;
		margin-top: 12px;
		align-items: center;
	}
	.comment-input textarea {
		flex: 1;
		min-height: 44px;
		padding: 8px;
		border-radius: 6px;
		border: 1px solid #e6e6e6;
		resize: vertical;
	}
	.comment-input button {
		padding: 8px 12px;
		border-radius: 6px;
		background: #ef476f;
		color: white;
		border: none;
		cursor: pointer;
	}
	.comment-input button[disabled] {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
