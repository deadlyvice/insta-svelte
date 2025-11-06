<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	const { user } = data;
</script>

<div class="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
	<div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
		<h1 class="text-2xl font-bold mb-4 text-center">Profile</h1>
		<p><strong>ID:</strong> {user.id}</p>
		<p><strong>Name:</strong> {user.name}</p>
		<p><strong>Email:</strong> {user.email}</p>
		<p><strong>Nickname:</strong> {user.nickname}</p>
		<!-- Add logout if needed: fetch('/auth/logout', {method: 'POST'}).then(() => window.location.href = '/') -->
	</div>
</div>