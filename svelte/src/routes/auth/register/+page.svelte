<script lang="ts">
	import { profile } from "$lib/store/userState.svelte"

	let name = '';
	let email = '';
	let nickname = '';
	let password = '';
	let error: undefined | string;

	async function handleRegister() {
		error = '';
		const user = await profile.register({email,name, nickname, password})
		error = user?.error
	}
</script>

<form on:submit|preventDefault={handleRegister} class=" w-full flex flex-col gap-3">
	<h1 class="text-center ">Welcome to <b>register</b> page</h1>
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
		<p class="text-red-500 text-sm">{error}</p>
	{/if}

	<button type="submit" class="button w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600">
		Register
	</button>

		<span>
		Already have an account ? <a class="text-pink-400" href="/auth/login">click here</a>
	</span>
</form>
