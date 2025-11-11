<script lang="ts">
	import PostGrid from "$lib/components/PostGrid.svelte";
	import { posts } from "$lib/store/postsState.svelte";
	import { setContext } from "svelte";

	let input = $state('');
	setContext('input-posts', input);

	// debounce timer reference
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	// define event type
	interface InputPostsEvent extends CustomEvent<string> {
		detail: string;
	}

	function onInput(e: Event) {
		const target = e.target as HTMLInputElement;
		const value = target.value.trim();

		// clear previous timer
		if (debounceTimer) clearTimeout(debounceTimer);

		// set new timer
		debounceTimer = setTimeout(async () => {
			console.log('Debounced value:', value);

			// Dispatch custom event
			const searchEvent: InputPostsEvent = new CustomEvent('input-posts', {
				detail: value,
			});

			document.dispatchEvent(searchEvent);

			// Optionally fetch directly:
			await posts.getPostsByNickname(value);
		}, 1000); // 1 second debounce
	}

	
</script>

<h1>Search users by <strong>Nickname</strong></h1>

<input
	type="text"
	bind:value={input}
	oninput={onInput}
	placeholder="Type nickname..."
	class="border rounded p-2 w-full"
/>

<PostGrid
	loadPostsOnMount={() => posts.getPostsByNickname(input) as any}
/>
