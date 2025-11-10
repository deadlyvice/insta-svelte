<script lang="ts">
	import PostCard from "./PostCard.svelte"
  import { onMount } from 'svelte';
  import Loader from '$lib/components/Loader.svelte';
	import { api } from "$lib/api/posts"

  let posts: IPost[] = $state([]);
  let isMounted = $state(false);
  let error: string | null = $state(null);

  export interface IPropsGrid {
    onMounted: () => ApiResponse<IPost[]>//ApiResponse< IPost[] >
  }
  
  const {onMounted, }: IPropsGrid  = $props()


  onMount(async () => {
    try {
      const res = await onMounted()

      if (!res.ok) posts = [];
      else posts = res.data;

    } catch (err) {
      error = (err as Error).message ?? 'Unknown error';
      posts = [];
    } finally {
      isMounted = true;
    }
  });
</script>

{#if !isMounted}
  <Loader />
{:else}
{#if posts.length === 0}
  <div class="p-6 text-center text-gray-600 dark:text-gray-400">No posts to show.</div>
{:else}
  <div class="p-4 lg:px-8">
    <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {#each posts as post (post.id)}
        <PostCard  post={post} 

        OnDeleteComment = {(comments) => {
          return [] as any
        }}

        onDeletePost={async (postId) => {
          const res = await api.deletePublication(postId)
          if (res.ok){
            posts = posts.filter(({id})=> id !== postId)
          }
        }
      }
        />
      {/each}
    </div>
  </div>
{/if}
{/if}


<style>
  /* no additional styles here; PostCard has its own */
</style>
