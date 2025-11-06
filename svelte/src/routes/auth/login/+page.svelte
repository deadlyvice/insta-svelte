<script lang="ts">
	import { goto } from '$app/navigation'
	import { login } from '$lib/api/auth';

	let email = '';
	let password = '';
	let error = '';

	async function handleLogin() {
		error = '';
		const user = await login({ email, password }).catch((err:Error)=>err)
		if (user instanceof Error) {
			console.log(user);
			return 
		}

		console.log('Logged in as', user);
		goto('/profile',)
		// window.location.href = '/profile';
	}
</script>

<form on:submit|preventDefault={handleLogin} class="space-y-4">
	<div>
		<label for="email" class="block text-sm font-medium text-gray-700">Email</label>
		<input
			type="email"
			id="email"
			bind:value={email}
			required
			class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
		/>
	</div>
	<div>
		<label for="password" class="block text-sm font-medium text-gray-700">Password</label>
		<input
			type="password"
			id="password"
			bind:value={password}
			required
			class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
		/>
	</div>
	{#if error}
		<p class="text-red-500 text-sm">{error}</p>
	{/if}
	<button
		type="submit"
		class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
	>
		Login
	</button>
</form>
