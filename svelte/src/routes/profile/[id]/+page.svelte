<script lang="ts">
    

  import PostGrid from '$lib/components/PostGrid.svelte';
  import Loader from '$lib/components/Loader.svelte';
  import { posts as postService } from '$lib/store/postsState.svelte';
	import { page } from "$app/state"
	import { api } from "$lib/api/profile"
	import { onMount } from "svelte"


    const userId = Number(page.params.id)
    let profile: IUser | undefined = $state()
    let loading = $state(true);
    let error: string | null = $state(null);

    onMount(async ()=>{
        if (userId) {
            const res = await api.getProfileById(userId)
            if (res.ok) {
                profile = res.data
            }
            else error = res.error
        }
        loading = false
    })


  async function loadMyPosts() {
    return postService.getPostsByUserId(userId)
  }

</script>
{#if loading}
  <Loader />
{:else if error || !profile?.id}
    {error}
{:else}
<h1 class="text-center text-2xl font-semibold mb-4">Welcome to <b>{profile.nickname}</b> page</h1>

<div class="w-full p-4 flex flex-col items-center  h-full">
  <div class="w-full flex gap-4 flex-wrap items-center justify-between h-full max-w-5xl max-md:justify-center">
    <div class="avatar w-[300px]! h-[300px]!">
      {#if profile.img_url}
        <img src={profile.img_url} alt="">
      {/if}
    </div>
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
  </div>

  <section class="w-full py-4!">
    <h2 class="text-lg font-semibold">{profile.nickname} posts</h2>
    
    <PostGrid loadPostsOnMount={loadMyPosts as any} />
    
  </section>

</div>

{/if}


<style>
  input[disabled] { opacity: 0.9; background: #f7fafc; padding: 8px; border-radius: 6px; }

  .btn-primary { background:#06b6d4; color:white; padding:8px 12px; border-radius:8px; border:none; }
  .btn-ghost { background:transparent; color:#374151; border:1px solid #e6e6e6; padding:8px 12px; border-radius:8px; }
</style>