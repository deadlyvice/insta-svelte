<script lang="ts">
	import Loader from "$lib/components/Loader.svelte"
	import { onMount } from "svelte"
    import {posts as service} from '$lib/store/postsState.svelte';

    let posts: IPost[] = $state([])    
    let isMounted = $state(false)
    let error: string | null = $state(null);

  // Track image loading per-post: map postId -> boolean[] (loaded states)
  const loadedMap = new Map<number, boolean[]>();

  function initLoadedStateFor(post: IPost) {
    if (!loadedMap.has(post.id)) {
      const arr = post.img_urls?.map(() => false) ?? [];
      loadedMap.set(post.id, arr);
    }
  }

  function setImageLoaded(postId: number, index: number) {
    const arr = loadedMap.get(postId);
    if (!arr) return;
    arr[index] = true;
    // trigger reactivity by re-setting the Map entry (Map is fine but we mutate it, Svelte won't notice;
    // so reassign to itself to hint change)
    loadedMap.set(postId, arr);
  }

  function isImageLoaded(postId: number, index: number) {
    const arr = loadedMap.get(postId);
    return !!arr && !!arr[index];
  }

  // Small utility: shorten content
  function excerpt(text: string, n = 160) {
    if (!text) return '';
    return text.length > n ? text.slice(0, n).trim() + '…' : text;
  }

  onMount(async () => {
    try {
      const res = await service.getPosts();
      if (!res.ok) {
        error = typeof res === 'object' && 'error' in res ? (res as any).error : 'Failed to load';
        posts = [];
      } else {
        posts = res.data ?? [];
        posts.forEach(initLoadedStateFor);
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
  <div class="p-6">
    <Loader />
  </div>
{:else}
  {#if error}
    <div class="p-6 text-center text-red-600 dark:text-red-400">
      Error: {error}
    </div>
  {:else}
    {#if posts.length === 0}
      <div class="p-6 text-center text-gray-600 dark:text-gray-400">
        No posts yet.
      </div>
    {:else}
      <div class="p-4 lg:px-8">
        <!-- responsive grid: 1 col mobile, 2 md, 3 lg -->
        <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {#each posts as post (post.id)}
            <article class="card">
              <!-- Image area: show big image if single, grid thumbnails if multiple, skeleton if none -->
              {#if post.img_urls && post.img_urls.length > 0}
                {#if post.img_urls.length === 1}
                  <div class="aspect-16-9 mb-3">
                    <div class="absolute-fill">
                      <!-- skeleton shown while image not loaded -->
                      {#if !isImageLoaded(post.id, 0)}
                        <div class="absolute-fill skeleton" ></div>
                      {/if}
                      <img
                        src={post.img_urls[0]}
                        alt={post.title || 'post image'}
                        class="img-cover absolute-fill"
                        onload={() => setImageLoaded(post.id, 0)}
                        onerror={() => setImageLoaded(post.id, 0)}
                      />
                    </div>
                  </div>
                {:else}
                  <!-- multiple images: small grid -->
                  <div class="grid grid-cols-2 gap-2 mb-3">
                    {#each post.img_urls.slice(0, 4) as url, i}
                      <div class="aspect-1-1 relative">
                        {#if !isImageLoaded(post.id, i)}
                          <div class="absolute-fill skeleton" ></div>
                        {/if}
                        <img
                          src={url}
                          alt={post.title ? `${post.title} (image ${i + 1})` : `image ${i + 1}`}
                          class="img-cover absolute-fill"
                          onload={() => setImageLoaded(post.id, i)}
                          onerror={() => setImageLoaded(post.id, i)}
                        />
                      </div>
                    {/each}
                  </div>
                {/if}
              {:else}
                <!-- placeholder skeleton for missing image -->
                <div class="aspect-16-9 mb-3">
                  <div class="absolute-fill skeleton" ></div>
                </div>
              {/if}

              <!-- Meta: title, excerpt -->
              <header class="mb-2">
                <h3 class="text-lg font-semibold">{post.title}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{excerpt(post.content, 120)}</p>
              </header>

              <!-- actions/metrics -->
              <footer class="mt-3 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                <div class="flex items-center gap-3">
                  <button aria-label="Like" class="flex items-center gap-1">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M12 21s-6-4.35-9-7.5C-0.5 11.5 1 6.5 5 5.5c2.5-.6 4.5 1 7 3.5 2.5-2.5 4.5-4.1 7-3.5 4 1 5.5 6 2 8-3 3.15-9 7.5-9 7.5z" fill="currentColor"/>
                    </svg>
                    <span>{post.like_count}</span>
                  </button>

                  <button aria-label="Dislike" class="flex items-center gap-1">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M12 3s6 4.35 9 7.5c3.5 3.65 2 8.65-2 9.5-2.5.6-4.5-1-7-3.5-2.5 2.5-4.5 4.1-7 3.5-4-1-5.5-6-2-8C6 7.85 12 3 12 3z" fill="currentColor"/>
                    </svg>
                    <span>{post.dislike_count}</span>
                  </button>
                </div>

                <div class="text-xs text-gray-400">
                  #{post.id}
                </div>
              </footer>
            </article>
          {/each}
        </div>
      </div>
    {/if}
  {/if}
{/if}




<style>
  /* Skeleton animation */
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

  /* keep images nicely cropped */
  .img-cover {
    object-fit: cover;
    width: 100%;
    height: 100%;
    display: block;
  }

  /* small helper for image container aspect ratio */
  .aspect-16-9 {
    position: relative;
    width: 100%;
    padding-top: 56.25%; /* 16:9 */
    overflow: hidden;
    border-radius: 8px;
  }

  .aspect-1-1 {
    position: relative;
    width: 100%;
    padding-top: 100%; /* 1:1 */
    overflow: hidden;
    border-radius: 8px;
  }

  .absolute-fill {
    position: absolute;
    inset: 0;
  }

  /* responsive card */
  .card {
    background: white;
    border-radius: 10px;
    box-shadow: 0 1px 6px rgba(16, 24, 40, 0.06);
    padding: 16px;
  }

  @media (prefers-color-scheme: dark) {
    .card {
      background: #0b1220;
      color: #e6eef8;
      box-shadow: 0 1px 10px rgba(2, 6, 23, 0.6);
    }
  }
</style>
