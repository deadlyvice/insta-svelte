<script lang="ts">
  import ImageWithSkeleton from '$lib/components/ImageWithSkeleton.svelte';

  export let post: IPost;

  function excerpt(text: string, n = 160) {
    if (!text) return '';
    return text.length > n ? text.slice(0, n).trim() + '…' : text;
  }

  // placeholder action handlers (wire to API later)
  function like() { /* TODO */ }
  function dislike() { /* TODO */ }
</script>

<article class="card">
  {#if post.img_urls && post.img_urls.length > 0}
    {#if post.img_urls.length === 1}
      <ImageWithSkeleton src={post.img_urls[0]} alt={post.title} aspect="16-9" />
    {:else}
      <div class="grid grid-cols-2 gap-2 mb-3">
        {#each post.img_urls.slice(0,4) as url}
          <ImageWithSkeleton src={url} alt={post.title} aspect="1-1" />
        {/each}
      </div>
    {/if}
  {:else}
    <ImageWithSkeleton src={null} alt="placeholder" aspect="16-9" />
  {/if}

  <header class="mb-2">
    <h3 class="text-lg font-semibold">{post.title}</h3>
    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{excerpt(post.content, 120)}</p>
  </header>

  <footer class="mt-3 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
    <div class="flex items-center gap-3">
      <button aria-label="Like" class="flex items-center gap-1" on:click={like}>
        <!-- small inline icon -->
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 21s-6-4.35-9-7.5C-0.5 11.5 1 6.5 5 5.5c2.5-.6 4.5 1 7 3.5 2.5-2.5 4.5-4.1 7-3.5 4 1 5.5 6 2 8-3 3.15-9 7.5-9 7.5z" fill="currentColor"/>
        </svg>
        <span>{post.like_count}</span>
      </button>

      <button aria-label="Dislike" class="flex items-center gap-1" on:click={dislike}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 3s6 4.35 9 7.5c3.5 3.65 2 8.65-2 9.5-2.5.6-4.5-1-7-3.5-2.5 2.5-4.5 4.1-7 3.5-4-1-5.5-6-2-8C6 7.85 12 3 12 3z" fill="currentColor"/>
        </svg>
        <span>{post.dislike_count}</span>
      </button>
    </div>

    <div class="text-xs text-gray-400">#{post.id}</div>
  </footer>
</article>

<style>
  .card {
    background: white;
    border-radius: 10px;
    box-shadow: 0 1px 6px rgba(16,24,40,0.06);
    padding: 12px;
  }
  @media (prefers-color-scheme: dark) {
    .card { background: #0b1220; color: #e6eef8; box-shadow: 0 1px 10px rgba(2,6,23,0.6); }
  }
  .grid { margin-bottom: 0.75rem; }
</style>
