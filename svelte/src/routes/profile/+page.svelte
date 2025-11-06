<script lang="ts">
	import { getProfile } from '$lib/api/auth';
	import { onMount } from 'svelte';

	let user: any = null;
	let error = '';

	onMount(async () => {
		try {
			user = await getProfile();
		} catch {
			error = 'You must be logged in.';
			// window.location.href = '/auth/login';
		}
	});
</script>

{#if user}
	<div class="p-6 bg-white shadow rounded-md">
		<h2 class="text-xl font-bold">Welcome, {user.name}</h2>
		<p>Email: {user.email}</p>
		<p>Nickname: {user.nickname}</p>
	</div>
{:else if error}
	<p class="text-red-500">{error}</p>
{/if}
