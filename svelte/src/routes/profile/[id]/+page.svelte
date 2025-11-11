<script lang="ts">
  import Loader from '$lib/components/Loader.svelte';
  import { posts as postService } from '$lib/store/postsState.svelte';

  
	import { page } from "$app/state"

	import { api as apiProfile} from "$lib/api/profile"
	import { api, api as apiPosts } from "$lib/api/posts"
  
	import { onMount } from "svelte"
	import TestGrid from '$lib/components/PostGrid/TestGrid.svelte'
	import { gridState } from '$lib/components/PostGrid/PostGrid.state'


    const userId = Number(page.params.id)
    let profile: IUser | undefined = $state()
    let loading = $state(true);
    let error: string | null = $state(null);

    const grid = gridState()


    onMount(async ()=> {
      
        if (userId) {
            const [profileRes] = await Promise.all([
              apiProfile.getProfileById(userId),
              grid.initPosts(() => apiPosts.getPostsByUserId(userId) ),
            ])
            if (profileRes.ok) profile = profileRes.data
            else error = profileRes.error
        }
        loading = false
    })

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
    <TestGrid posts={$grid}/>
  </section>

</div>

{/if}

<style>
  input[disabled] { opacity: 0.9; background: #f7fafc; padding: 8px; border-radius: 6px; border: none; }
</style>