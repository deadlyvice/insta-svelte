<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { profile as profileStore } from '$lib/store/userState.svelte'
	import type { IPostPublicationPayload } from '$lib/api/posts'

	const dispatch = createEventDispatcher()

	let { open: isOpen = false } = $props()

	// local form state
	let title = $state('')
	let content = $state('')
	let images = $state('') // comma-separated input
	let submitting = $state(false)
	let error: string | null = $state(null)

	// read current profile for author_id
	const profile: IUser = $profileStore!

	function parseImgUrls(input: string): string[] {
		return input
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean)
	}

	async function submit() {
		if (!title.trim()) {
			error = 'Title is required'
			return
		}

		const payload: IPostPublicationPayload = {
			title: title.trim(),
			content: content.trim(),
			img_urls: parseImgUrls(images),
			author_id: profile.id
		}

		error = null

		dispatch('created', payload)
		dispatch('close')

		title = ''
		content = ''
		images = ''
	}
</script>

{#if isOpen}
	<!-- svelte-ignore a11y_positive_tabindex -->
	<!-- svelte-ignore event_directive_deprecated -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="overlay"
		role="dialog"
		tabindex="1"
		aria-modal="true"
		on:click={() => dispatch('close')}
	>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal" on:click|stopPropagation>
			<header class="modal-header">
				<h3>Create new post</h3>
			</header>

			<form on:submit|preventDefault={submit} class="modal-body">
				<label>
					Title
					<input type="text" bind:value={title} placeholder="Post title" required />
				</label>

				<label>
					Content
					<textarea bind:value={content} placeholder="Write your post..." rows="6"
					></textarea>
				</label>

				<label>
					Images (comma-separated URLs)
					<input
						type="text"
						bind:value={images}
						placeholder="https://... , https://..."
					/>
				</label>

				{#if error}
					<div class="error">{error}</div>
				{/if}

				<div class="actions">
					<button
						type="button"
						class="btn-secondary"
						on:click={() => dispatch('close')}
						disabled={submitting}
					>
						Cancel
					</button>
					<button type="submit" class="btn-primary" disabled={submitting}>
						{#if submitting}Publishing…{:else}Publish{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	/* overlay */
	.overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.45);
		display: grid;
		place-items: center;
		z-index: 60;
	}

	/* modal */
	.modal {
		width: 100%;
		max-width: 720px;
		background: white;
		border-radius: 12px;
		padding: 18px;
		box-shadow: 0 10px 30px rgba(2, 6, 23, 0.4);
	}
	@media (prefers-color-scheme: dark) {
		.modal {
			background: #071021;
			color: #e6eef8;
		}
	}

	.modal-header h3 {
		margin: 0 0 8px 0;
		font-size: 1.125rem;
	}
	.modal-body {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 6px;
		font-size: 0.9rem;
	}
	input[type='text'],
	textarea {
		padding: 8px 10px;
		border-radius: 8px;
		border: 1px solid #e6e6e6;
		background: transparent;
	}
	.actions {
		display: flex;
		gap: 8px;
		justify-content: flex-end;
		margin-top: 6px;
	}

	.btn-primary {
		background: #06b6d4;
		color: white;
		border: none;
		padding: 8px 12px;
		border-radius: 8px;
	}
	.btn-secondary {
		background: transparent;
		color: #374151;
		border: 1px solid #e6e6e6;
		padding: 8px 12px;
		border-radius: 8px;
	}

	.error {
		color: #b91c1c;
		font-size: 0.9rem;
		padding-top: 4px;
	}
</style>
