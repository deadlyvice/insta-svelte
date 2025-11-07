<script lang="ts">
	import PostCard from "./PostCard.svelte"

  export let posts: IPost[] = [];
</script>

{#if posts.length === 0}
  <div class="p-6 text-center text-gray-600 dark:text-gray-400">No posts to show.</div>
{:else}
  <div class="p-4 lg:px-8">
    <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {#each posts as post (post.id)}
        <PostCard {post} />
      {/each}
    </div>
  </div>
{/if}

<style>
  /* no additional styles here; PostCard has its own */
</style>
