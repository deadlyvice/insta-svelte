<script lang="ts">
	let name: string = '';
	let email: string = '';
	let nickname: string = '';
	let password: string = '';
	let error: string = '';

	async function handleRegister() {
		error = '';
		try {
			const response = await fetch('/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, nickname, password })
			});

			if (response.ok) {
				window.location.href = '/profile'; // Redirect after successful registration
			} else {
				error = await response.text() || 'Registration failed. Please try again.';
			}
		} catch {
			error = 'An error occurred. Please try again.';
		}
	}
</script>

<form on:submit|preventDefault={handleRegister} class="space-y-4">
	<div>
		<label for="name" class="block text-sm font-medium text-gray-700">Name</label>
		<input
			type="text"
			id="name"
			bind:value={name}
			required
			class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
		/>
		<!-- Icon example: <i class="fas fa-user absolute ..."></i> -->
	</div>
	<div>
		<label for="email" class="block text-sm font-medium text-gray-700">Email</label>
		<input
			type="email"
			id="email"
			bind:value={email}
			required
			class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
		/>
		<!-- Icon example: <i class="fas fa-envelope absolute ..."></i> -->
	</div>
	<div>
		<label for="nickname" class="block text-sm font-medium text-gray-700">Nickname</label>
		<input
			type="text"
			id="nickname"
			bind:value={nickname}
			required
			class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
		/>
		<!-- Icon example: <i class="fas fa-tag absolute ..."></i> -->
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
		Register
	</button>
</form>