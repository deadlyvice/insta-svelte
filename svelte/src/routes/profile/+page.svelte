<script lang="ts">
	import { onMount } from 'svelte';
	import {profile} from '$lib/store/userState.svelte';

	let error = '';
	
	onMount(async () => {

	});
	// console.log($profile);

</script>

{#if $profile}
	<div class="p-6 bg-white shadow rounded-md">
		<h2 class="text-xl font-bold">Welcome, {$profile.name}</h2>
		<p>Email: {$profile.email}</p>
		<p>Nickname: {$profile.nickname}</p>
	</div>
{:else if error}
	<p class="text-red-500">{error}</p>
{/if}
