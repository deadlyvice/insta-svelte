<script lang="ts">
	export let src: string | undefined | null
	export let alt = 'image'
	export let aspect: '16-9' | '1-1' = '16-9'
	export let className = ''

	// local loaded state
	let loaded = false

	function onLoad() {
		loaded = true
	}
	function onError() {
		loaded = true // hide skeleton even on error
	}
</script>

{#if src}
	<div class={aspect === '1-1' ? 'aspect-1-1' : 'aspect-16-9'}>
		<div class="absolute-fill">
			{#if !loaded}
				<div class="absolute-fill skeleton" />
			{/if}
			<img
				{src}
				{alt}
				class={`img-cover absolute-fill ${className}`}
				on:load={onLoad}
				on:error={onError}
			/>
		</div>
	</div>
{:else}
	<!-- placeholder skeleton when no src -->
	<div class={aspect === '1-1' ? 'aspect-1-1' : 'aspect-16-9'}>
		<div class="absolute-fill skeleton" />
	</div>
{/if}

<style>
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
		border-radius: 8px;
	}
	.aspect-1-1 {
		position: relative;
		width: 100%;
		padding-top: 100%;
		overflow: hidden;
		border-radius: 8px;
	}
	.absolute-fill {
		position: absolute;
		inset: 0;
	}
	img.img-cover {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
</style>
