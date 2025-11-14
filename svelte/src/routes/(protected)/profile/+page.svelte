<script lang="ts">
	import CreatePostModal from '$lib/components/CreatePostModal.svelte'
	import { profile as profileService } from '$lib/store/userState.svelte'
	import TestGrid from '$lib/components/PostGrid/TestGrid.svelte'
	import { onMount } from 'svelte'
	import { gridState } from '$lib/components/PostGrid/PostGrid.state'
	import { api, type IPostPublicationPayload } from '$lib/api/posts'
	import { toast } from '$lib/store/toastState.svelte'

	// reactive access
	const profile: IUser = $profileService!
	let isOpenCreatePost = $state(false)

	const grid = gridState()
	
	onMount(async () => {
		if (profile.id) grid.initPosts(() => api.getPostsByUserId(profile.id))
	})
	grid.subscribe((grid) => {
		console.log(grid)
	})

	function onOpenModal() {
		isOpenCreatePost = true
	}

	function onCloseModal() {
		isOpenCreatePost = false
	}

	async function onCreatePost({ detail: payload }: CustomEvent<IPostPublicationPayload>) {
		const form = new FormData()
		form.append('title', payload.title)
		form.append('content', payload.content)

		// If server expects single field named "file":
		// if (selectedFiles[0]) form.append('file', selectedFiles[0])

		// If server expects multiple files under the same field name (recommended):
		for (const file of payload.file as File[]) {
			form.append('files', file) // server will receive multiple "files" fields
		}
		
		const res = await api.postPublication(form)
		console.log(res);
		
		// res.data
		if (res.ok) grid.pushPost(res.data)
		else toast.error('failed to post publication')
	}

	async function onDeletePost(postId: number) {
		const res = await api.deletePublication(postId)
		if (res.ok) grid.removePostById(postId)
		else toast.error('error: on delete post')
	}
</script>

<h1 class="mb-4 text-center text-2xl font-semibold">Welcome to <b>Profile</b> page</h1>
<div class="flex h-full w-full flex-col items-center p-4">
	<div
		class="flex h-full w-full max-w-5xl flex-wrap items-center justify-between gap-4 max-md:justify-center"
	>
		<div class="avatar h-[300px]! w-[300px]!">
			{#if profile.img_url}
				<img src={profile.img_url} alt="" />
			{/if}
		</div>
		<div class="mb-6 flex w-full max-w-2xl flex-col gap-3">
			<div>
				<label for="name">Name</label>
				<input id="name" disabled type="text" bind:value={profile.name} class="w-full" />
			</div>

			<div>
				<label for="nickname">Nickname</label>
				<input
					id="nickname"
					disabled
					type="text"
					bind:value={profile.nickname}
					class="w-full"
				/>
			</div>

			<div>
				<label for="email">Email</label>
				<input id="email" disabled type="email" bind:value={profile.email} class="w-full" />
			</div>

			<div class="mt-2 flex gap-2">
				<button class="btn-primary" onclick={onOpenModal}>Add new</button>
				<button class="btn-ghost" onclick={profileService.logout}>Log out</button>
			</div>
		</div>
	</div>

	<section class="w-full">
		<h2 class="text-3xl! mb-2 font-semibold text-center py-10!">Your posts</h2>

		<TestGrid {grid} {onDeletePost} />
	</section>
</div>

<CreatePostModal open={isOpenCreatePost} on:created={onCreatePost} on:close={onCloseModal} />

<style>
	input[disabled] {
		opacity: 0.9;
		background: #f7fafc;
		padding: 8px;
		border-radius: 6px;
	}

	.btn-primary {
		background: #06b6d4;
		color: white;
		padding: 8px 12px;
		border-radius: 8px;
		border: none;
	}
	.btn-ghost {
		background: transparent;
		color: #374151;
		border: 1px solid #e6e6e6;
		padding: 8px 12px;
		border-radius: 8px;
	}
</style>
