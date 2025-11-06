<script lang="ts">

	let email: string = '';
	let password: string = '';
	let error: string = '';

	async function handleLogin() {
		error = '';
		try {
			const response = await fetch('/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});

			if (response.ok) {
				window.location.href = '/profile'; // Redirect after successful login
			} else {
				error = await response.text() || 'Login failed. Please check your credentials.';
			}
		} catch {
			error = 'An error occurred. Please try again.';
		}
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
			class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
		/>
		<!-- Icon example: <i class="fas fa-envelope absolute ..."></i> (assume Font Awesome classes) -->
	</div>
	<div>
		<label for="password" class="block text-sm font-medium text-gray-700">Password</label>
		<input
			type="password"
			id="password"
			bind:value={password}
			required
			class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
		/>
		<!-- Icon example: <i class="fas fa-lock absolute ..."></i> -->
	</div>
	{#if error}
		<p class="text-red-500 text-sm">{error}</p>
	{/if}
	<button
		type="submit"
		class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
	>
		Login
	</button>
</form>