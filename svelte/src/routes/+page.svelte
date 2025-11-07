<script lang="ts">
  import { onMount } from 'svelte';
  import Loader from '$lib/components/Loader.svelte';
  import PostGrid from '$lib/components/PostGrid.svelte';
  import { posts as service } from '$lib/store/postsState.svelte';

  let posts: IPost[] = $state([]);
  let isMounted = $state(false);
  let error: string | null = $state(null);

  onMount(async () => {
    try {
      const res = await service.getPosts();
      if (!res.ok) {
        error = typeof res === 'object' && 'error' in res ? (res as any).error : 'Failed to load';
        posts = [];
      } else {
        posts = res.data ?? [];
      }
    } catch (err) {
      error = (err as Error).message ?? 'Unknown error';
      posts = [];
    } finally {
      isMounted = true;
    }
  });
</script>

{#if !isMounted}
  <div class="h-full"><Loader /></div>
{:else}
  {#if error}
    <div class="p-6 text-center text-red-600 dark:text-red-400">Error: {error}</div>
  {:else}
    <PostGrid {posts} />
  {/if}
{/if}
