<script lang="ts">
    

    import PostGrid from '$lib/components/PostGrid.svelte';
    import Loader from '$lib/components/Loader.svelte';
    import { posts as postService } from '$lib/store/postsState.svelte';
	import { page } from "$app/state"
	import { api } from "$lib/api/profile"
	import { onMount } from "svelte"


    const userId = Number(page.params.id)
    let profile: IUser | undefined = $state()

    onMount(async ()=>{
        await loadMyPosts();

        if (userId) {
            const res = await api.getProfileById(userId)
            if (res.ok){
                profile = res.data
            }

        }

    })

  let posts: IPost[] = $state([]);

  let loading = $state(false);
  let error: string | null = $state(null);

  async function loadMyPosts() {
    loading = true;
    error = null;
    try {
      const res = await postService.getPostsById(userId);
      console.log(res);
      
      if (!res.ok) {
        error = res.error || 'Failed to load';
        posts = [];
      } else {
        posts = res.data.map((data)=>{
            delete data.nickname
            return data
        })
      }
    } catch (err) {
      error = (err as Error).message ?? 'Unknown error';
      posts = [];
    } finally {
      loading = false;
    }
  }

</script>

{#if !profile?.id}
    ...
{:else}
<div class="w-full p-4 flex flex-col items-center">
  <h1 class="text-center text-2xl font-semibold mb-4">Welcome to <b>{profile.name}</b> page</h1>

  <div class="flex flex-col gap-3 mb-6 max-w-2xl w-full">
    <div>
      <label for="name">Name</label>
      <input id="name" disabled type="text" bind:value={profile.name} class="w-full" />
    </div>

    <div>
      <label for="nickname">Nickname</label>
      <input id="nickname" disabled type="text" bind:value={profile.nickname} class="w-full" />
    </div>

    <div>
      <label for="email">Email</label>
      <input id="email" disabled type="email" bind:value={profile.email} class="w-full" />
    </div>
  </div>

  <section class="w-full">
    <h2 class="text-lg font-semibold mb-2">{profile.nickname} posts</h2>

    {#if loading}
      <Loader />
    {:else}
      {#if error}
        <div class="text-red-600 dark:text-red-400">Error: {error}</div>
      {:else}
        <PostGrid posts={posts} />
      {/if}
    {/if}
  </section>
</div>

{/if}

<style>
  input[disabled] { opacity: 0.9; background: #f7fafc; padding: 8px; border-radius: 6px; }

  .btn-primary { background:#06b6d4; color:white; padding:8px 12px; border-radius:8px; border:none; }
  .btn-ghost { background:transparent; color:#374151; border:1px solid #e6e6e6; padding:8px 12px; border-radius:8px; }
</style>