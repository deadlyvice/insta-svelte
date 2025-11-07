<script lang="ts">
	import { profile } from '$lib/store/userState.svelte';

	let email = '';
	let password = '';
	let error = '';
	
	async function handleLogin() {
		error = '';
		const user = await profile.login({email, password})
		if (!user.ok) error = user.error
	}
</script>

<form on:submit|preventDefault={handleLogin} class="space-y-4 w-full flex flex-col gap-4">
	<h1 class="text-center">Welcome to <b>login</b> page</h1>
	<div>
		<label for="email">Email</label>
		<input
			type="email"
			id="email"
			bind:value={email}
			required
		/>
	</div>
	<div>
		<label for="password">Password</label>
		<input
			type="password"
			id="password"
			bind:value={password}
			required
		/>
	</div>
	{#if error}
		<p class="text-red-500 text-sm">{error}</p>
	{/if}
	<button
		type="submit"
		class="button w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
	>
		Login
	</button>
	<span>
		To create account <a class="text-pink-400" href="/auth/register">click here</a>
	</span>
</form>
