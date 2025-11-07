<script lang="ts">
	import { profile } from "$lib/store/userState.svelte"
	const state = $derived($profile!)
</script>

<div class=" w-full flex flex-col gap-3">
	<h1 class="text-center">Welcome to <b>Profile</b> page</h1>

	<div>
		<label for="name">Name</label>
		<input id="name" disabled type="text" bind:value={state.name} required />
	</div>

	<div>
		<label for="nickname">Nickname</label>
		<input id="nickname" disabled type="text" bind:value={state.nickname} required />
	</div>

	<div>
		<label for="email">Email</label>
		<input disabled id="email" type="email" bind:value={state.email} required />
	</div>

	<span>
		Want to log out ? <a class="text-pink-400" href="/auth/login">click here</a>
	</span>
</div>
