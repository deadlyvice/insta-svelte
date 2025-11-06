<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
	<div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
		<h2 class="text-2xl font-bold mb-6 text-center">
			{#if $page.url.pathname.includes('login')}
				Login
			{:else}
				Register
			{/if}
		</h2>
		<slot />
		{#if $page.url.pathname.includes('login')}
			<p class="mt-4 text-center">Don't have an account? <a href="/auth/register" class="text-blue-500">Register</a></p>
		{:else}
			<p class="mt-4 text-center">Already have an account? <a href="/auth/login" class="text-blue-500">Login</a></p>
		{/if}
	</div>
</div>