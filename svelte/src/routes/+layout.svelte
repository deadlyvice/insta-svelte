<script>
	import { profile } from '$lib/store/userState.svelte'
	import { onMount } from 'svelte'
	import '../app.css'
	import 'uno.css'; 
	import { render } from 'svelte/server'
	import Toast from '$lib/components/Toast.svelte'

	let { children } = $props()
	
	let authPath = $derived($profile ? '/profile' : '/auth/login')
	let authText = $derived($profile ? 'Profile' : 'Login')

	
	profile.subscribe((user)=>{
		// console.log($profile);
		// authPath = user ? '/profile' : '/auth/login'
	    // authText = user ? 'Profile' : 'Login'
	})
	onMount(async ()=>{
		await profile.fetchSafeProfile()
	})
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
		<Toast />
	</main>
</div>