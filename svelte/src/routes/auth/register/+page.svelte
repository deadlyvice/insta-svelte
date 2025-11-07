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

<form on:submit|preventDefault={handleRegister} class="space-y-4">
	<div>
		<label for="name" class="block text-sm font-medium text-gray-700">Name</label>
		<input id="name" type="text" bind:value={name} required class="mt-1 block w-full border rounded-md px-3 py-2" />
	</div>

	<div>
		<label for="nickname" class="block text-sm font-medium text-gray-700">Nickname</label>
		<input id="nickname" type="text" bind:value={nickname} required class="mt-1 block w-full border rounded-md px-3 py-2" />
	</div>

	<div>
		<label for="email" class="block text-sm font-medium text-gray-700">Email</label>
		<input id="email" type="email" bind:value={email} required class="mt-1 block w-full border rounded-md px-3 py-2" />
	</div>

	<div>
		<label for="password" class="block text-sm font-medium text-gray-700">Password</label>
		<input id="password" type="password" bind:value={password} required class="mt-1 block w-full border rounded-md px-3 py-2" />
	</div>

	{#if error}
		<p class="text-red-500 text-sm">{error}</p>
	{/if}

	<button type="submit" class="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600">
		Register
	</button>
</form>
