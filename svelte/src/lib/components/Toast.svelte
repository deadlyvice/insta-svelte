<script lang="ts">
	import { toasts } from '$lib/store/toastState.svelte'
</script>

<div class="fixed right-4 bottom-4 z-50 flex w-full max-w-sm flex-col gap-2">
	{#each $toasts as t (t.id)}
		<div
			class="animate-slide-in flex items-center justify-between rounded-lg text-white shadow-md"
			class:bg-green-600={t.type === 'success'}
			class:bg-red-600={t.type === 'error'}
			class:bg-blue-600={t.type === 'info'}
			role="alert"
		>
			<span class="pl-4!">{t.message}</span>
			<button
				class="ml-4 text-white opacity-80 hover:bg-transparent! hover:opacity-100"
				onclick={() => toasts.update((ts) => ts.filter((tt) => tt.id !== t.id))}
			>
				×
			</button>
		</div>
	{/each}
</div>

<style>
	@keyframes slide-in {
		from {
			opacity: 0;
			transform: translateY(-20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.animate-slide-in {
		animation: slide-in 0.3s ease-out forwards;
	}
</style>
