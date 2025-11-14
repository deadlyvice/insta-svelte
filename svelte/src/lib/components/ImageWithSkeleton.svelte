<script lang="ts">
	import { preventDefault } from "svelte/legacy"

	export let src: string | undefined | null
	export let alt = 'image'
	export let aspect: '16-9' | '1-1' = '16-9'
	export let className = ''

	// $: staticURL = `http://127.0.0.1:3000/files/raw/${src}`
	
	// local loaded state
	let loaded = false

	function onLoad() {
		loaded = true
	}
	function onError(e: any) {
		e.preventDefault()
		// console.log(s);
		
		// e.target.onerror =null
		// if (staticURL !== src) src = staticURL
		loaded = true // hide skeleton even on error
	}
</script>

{#if src}
	<div class:aspect={aspect === '1-1' ? 'aspect-1-1':'aspect-16-9'} class='h-full relative z-0'>
		{#if !loaded}
			<div class=" skeleton" ></div>
		{/if}
		<img
			src={`http://127.0.0.1:3000/files/raw/${src}`}
			{alt}
			class={`img-cover   ${className}`}
			on:load={onLoad}
			on:error={onError}

		/>
	</div>

{:else}
	<!-- placeholder skeleton when no src -->
	<div class:aspect={aspect === '1-1' ? 'aspect-1-1':'aspect-16-9'}>
		<div class=" skeleton" ></div>
	</div>
{/if}

<style>
	img {
		overflow: hidden;
		border-radius: 21px;
	}
	.skeleton {
		background: linear-gradient(90deg, #e6e6e6 0%, #f2f2f2 50%, #e6e6e6 100%);
		background-size: 200% 100%;
		animation: pulse 1.2s linear infinite;
		border-radius: 6px;
	}
	@keyframes pulse {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}

.aspect-16-9 {
		position: relative;
		width: 100%;
		padding-top: 56.25%;
		overflow: hidden;
	}
	.aspect-1-1 {
		position: relative;
		width: 100%;
		padding-top: 100%;
		overflow: hidden;
	}

	img.img-cover {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
</style>
