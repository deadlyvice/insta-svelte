<script lang="ts">
	import { profile } from '$lib/store/userState.svelte'

	let email = ''
	let password = ''
	let error = ''

	async function handleLogin() {
		error = ''
		const user = await profile.login({ email, password })
		if (!user.ok) error = user.error
	}
</script>

<form on:submit|preventDefault={handleLogin} class="flex w-full flex-col gap-4 space-y-4">
	<h1 class="text-center">Welcome to <b>login</b> page</h1>
	<div>
		<label for="email">Email</label>
		<input type="email" id="email" bind:value={email} required />
	</div>
	<div>
		<label for="password">Password</label>
		<input type="password" id="password" bind:value={password} required />
	</div>
	{#if error}
		<p class="text-sm text-red-500">{error}</p>
	{/if}
	<button
		type="submit"
		class="button w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
	>
		Login
	</button>
	<span>
		To create account <a class="text-pink-400" href="/auth/register">click here</a>
	</span>
</form>
