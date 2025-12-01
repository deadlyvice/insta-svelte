<script lang="ts">
	import CreatePostModal from '$lib/components/CreatePostModal.svelte'
	import { profile as profileService } from '$lib/store/userState.svelte'
	import TestGrid from '$lib/components/PostGrid/TestGrid.svelte'
	import { onMount } from 'svelte'
	import { gridState } from '$lib/components/PostGrid/PostGrid.state'
	import { api, type IPostPublicationPayload } from '$lib/api/posts'
	import { api as apiProfile } from '$lib/api/profile'

	import { toast } from '$lib/store/toastState.svelte'
	import ImageWithSkeleton from '$lib/components/ImageWithSkeleton.svelte'
	import PatchProfileAvatar from '$lib/components/PatchProfileAvatar.svelte'

	// reactive access
	const profile: IUser =$derived($profileService!)
	
	type FormState = Pick<IUser, 'email' | 'name' | 'nickname' >
	const fields: FormState  = $state({...profile})


	let isOpenCreatePost = $state(false)
	let isOpenPatchAvatar = $state(false)

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
		let i = 1
		for (const file of payload.file as File[]) {
			
			form.append('file'+i, file) // server will receive multiple "files" fields
			i++
		}
		
		const res = await api.postPublication(form)
		console.log(res);
		
		// res.data
		if (res.ok) grid.pushPost(res.data)
		else toast.error('failed to post publication')
	}


	async function onPatchAvatar({ detail }: CustomEvent<File>) {
		const form = new FormData()
		form.append('img', detail)
		console.log(form, detail);
		
		const res = await apiProfile.patchAvatar(form)
		profileService.getProfile()
		console.log(res);
		
	}

	async function onDeletePost(postId: number) {
		const res = await api.deletePublication(postId)
		if (res.ok) grid.removePostById(postId)
		else toast.error('error: on delete post')
	}


</script>

<h1 class="my-4! text-center text-2xl font-semibold">Welcome to <b>Profile</b> page</h1>

<div class="flex h-full w-full flex-col items-center p-4">
	<div class="flex w-full max-w-5xl  max-[400px]:flex-col items-center  gap-6 md:gap-8">
		<PatchProfileAvatar
			isOpen={isOpenPatchAvatar}
			src={$profileService?.img_url}
			on:close={() => (isOpenPatchAvatar = false)}
			on:created={onPatchAvatar}
		>
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="place-self-center avatar cursor-pointer w-40 h-40 md:w-72 md:h-72 lg:w-80 lg:h-80"
				onclick={() => (isOpenPatchAvatar = true)}
			>
				<ImageWithSkeleton src={profile.img_url} />
			</div>
		</PatchProfileAvatar>

		<div class="mb-6 flex w-full max-w-xl flex-col gap-3 md:flex-1">
			<div>
				<label for="name">Name</label>
				<input disabled id="name" type="text" bind:value={fields.name} class="w-full" />
			</div>

			<div>
				<label for="nickname">Nickname</label>
				<input
					disabled
					id="nickname"
					type="text"
					bind:value={fields.nickname}
					class="w-full"
				/>
			</div>

			<div>
				<label for="email">Email</label>
				<input disabled id="email" type="email" bind:value={fields.email} class="w-full" />
			</div>

			<div class="mt-2 flex flex-col sm:flex-row gap-2">
				<button class="btn-primary" onclick={onOpenModal}>Add new</button>
				<button class="btn-ghost" onclick={profileService.logout}>Log out</button>
			</div>
		</div>
	</div>

	<section class="w-full mt-6">
		<h2 class="text-2xl md:text-3xl mb-2 font-semibold text-center py-6 md:py-10">Your posts</h2>

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
