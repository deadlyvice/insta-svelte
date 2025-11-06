<script>
	let { children } = $props()
	import '../app.css'
	import 'uno.css'; 
</script>

<div class="flex flex-col h-full">
	<main class="mx-auto grow outline rounded-md px-4">
		{@render children()}
	</main>
	
	<nav class="h-20 flex items-center gap-2">
		<a href="/" class="_i-mdi-home button " >Home</a>
		<a href="/search" class="button ">Search</a>
		<a href="/auth/login" class="button  ">Profile</a>
		<!-- <a class="button" href="/">Home</a> -->
		<!-- <a class="button" href="/profile">Profile</a> -->
	</nav>
</div>