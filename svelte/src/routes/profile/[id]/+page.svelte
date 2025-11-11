<script lang="ts">
	import Loader from '$lib/components/Loader.svelte'

	import { page } from '$app/state'

	import { api as apiProfile } from '$lib/api/profile'
	import { api as apiPosts } from '$lib/api/posts'

	import { onMount } from 'svelte'
	import TestGrid from '$lib/components/PostGrid/TestGrid.svelte'
	import { gridState } from '$lib/components/PostGrid/PostGrid.state'

	const userId = Number(page.params.id)
	let profile: IUser | undefined = $state()
	let loading = $state(true)
	let error: string | null = $state(null)

	const grid = gridState()

	onMount(async () => {
		if (userId) {
			const [profileRes] = await Promise.all([
				apiProfile.getProfileById(userId),
				grid.initPosts(() => apiPosts.getPostsByUserId(userId))
			])
			if (profileRes.ok) profile = profileRes.data
			else error = profileRes.error
		}
		loading = false
	})
</script>

{#if loading}
	<Loader />
{:else if error || !profile?.id}
	{error}
{:else}
	<h1 class="mb-4 text-center text-2xl font-semibold">
		Welcome to <b>{profile.nickname}</b> page
	</h1>

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
					<input
						id="name"
						disabled
						type="text"
						bind:value={profile.name}
						class="w-full"
					/>
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
					<input
						id="email"
						disabled
						type="email"
						bind:value={profile.email}
						class="w-full"
					/>
				</div>
			</div>
		</div>

		<section class="w-full py-4!">
			<h2 class="text-lg font-semibold">{profile.nickname} posts</h2>
			<TestGrid posts={$grid} />
		</section>
	</div>
{/if}

<style>
	input[disabled] {
		opacity: 0.9;
		background: #f7fafc;
		padding: 8px;
		border-radius: 6px;
		border: none;
	}
</style>
