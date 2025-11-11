<script lang="ts">
	import { profile } from '$lib/store/userState.svelte'

	let name = ''
	let email = ''
	let nickname = ''
	let password = ''
	let error: undefined | string

	async function handleRegister() {
		error = ''
		const user = await profile.register({ email, name, nickname, password })
		error = user?.error
	}
</script>

<form on:submit|preventDefault={handleRegister} class=" flex w-full flex-col gap-3">
	<h1 class="text-center">Welcome to <b>register</b> page</h1>
	<div>
		<label for="name">Name</label>
		<input id="name" type="text" bind:value={name} required />
	</div>

	<div>
		<label for="nickname">Nickname</label>
		<input id="nickname" type="text" bind:value={nickname} required />
	</div>

	<div>
		<label for="email">Email</label>
		<input id="email" type="email" bind:value={email} required />
	</div>

	<div>
		<label for="password">Password</label>
		<input id="password" type="password" bind:value={password} required />
	</div>

	{#if error}
		<p class="text-sm text-red-500">{error}</p>
	{/if}

	<button
		type="submit"
		class="button w-full rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600"
	>
		Register
	</button>

	<span>
		Already have an account ? <a class="text-pink-400" href="/auth/login">click here</a>
	</span>
</form>
