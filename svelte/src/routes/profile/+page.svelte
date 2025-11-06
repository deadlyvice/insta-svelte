<script lang="ts">
	import {api} from '$lib/api/profile';
	import { onMount } from 'svelte';
	import {profile} from '$lib/store/userState.svelte';

	let user: IUser | null = null;
	let error = '';

	onMount(async () => {
		try {
			user = await api.getProfile();
		} catch {
			error = 'You must be logged in.';
		}
	});
	console.log($profile);

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
