<script>
	import { profile } from '$lib/store/userState.svelte'
	import '../app.css'
	import 'uno.css'; 
	let { children } = $props()
	
	let authPath = $derived($profile ? '/profile' : '/auth/login')
	let authText = $derived($profile ? 'profile' : 'login')

	// profile.subscribe((user)=>{})
</script>

<div class="flex flex-col h-full">
	<nav class="h-20 flex items-center gap-2">
		<a href="/" class="_i-mdi-home button " >Home</a>
		<a href="/search" class="button ">Search</a>
		<a href="{authPath}" class="button">{authText}</a>
		<!-- <a class="button" href="/">Home</a> -->
		<!-- <a class="button" href="/profile">Profile</a> -->
	</nav>
	<main class="mx-auto grow rounded-md px-4">
		{@render children()}
	</main>
	
</div>