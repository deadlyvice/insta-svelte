<script lang="ts">
  import PostGrid from '$lib/components/PostGrid.svelte';
	import { posts } from '$lib/store/postsState.svelte'

</script>

<!-- onDeletePost={()=>{return {} as any}} -->
<!-- OnDeleteComment={()=>{return {} as any}} -->
<PostGrid

onMounted={async ()=>{
  return posts.getPosts() as any
}}/>

<!-- 
{#if !isMounted}
<div class="h-full"><Loader /></div> -->

  <!-- 
{:else}
  {#if error}
    <div class="p-6 text-center text-red-600 dark:text-red-400">Error: {error}</div>
  {:else}
  {/if} 
  {/if}
-->
