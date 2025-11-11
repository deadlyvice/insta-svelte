<script lang="ts">
  import CreatePostModal from '$lib/components/CreatePostModal.svelte';
  import { profile as profileService } from '$lib/store/userState.svelte';
	import TestGrid from '$lib/components/PostGrid/TestGrid.svelte'
	import { onMount } from 'svelte'
	import { gridState } from '$lib/components/PostGrid/PostGrid.state'
	import { api, type IPostPublicationPayload } from '$lib/api/posts'
	import { toast } from '$lib/store/toastState.svelte'

  // reactive access
  const profile: IUser = $profileService!;
  let isOpenCreatePost = $state(false);

  const grid = gridState()

  onMount(async ()=>{
    if (profile.id) 
      grid.initPosts(() => api.getPostsByUserId(profile.id))
  })

  function onOpenModal() {
    isOpenCreatePost = true;
  }
  
  function onCloseModal() {
    isOpenCreatePost = false;
  }
  
  async function onCreatePost({detail: form}: CustomEvent<IPostPublicationPayload>) {
    const res = await api.postPublication(form)
    if (res.ok) grid.pushPost(res.data)
    else toast.error('failed to post publication') 
  }

  async function onDeletePost(postId:number) {
    const res = await api.deletePublication(postId)
    if (res.ok) grid.removePostById(postId)
    else toast.error('error: on delete post')
  }


</script>

<h1 class="text-center text-2xl font-semibold mb-4">Welcome to <b>Profile</b> page</h1>
<div class="w-full p-4 flex flex-col items-center h-full">
  <div class="w-full flex gap-4 items-center justify-between h-full max-w-5xl flex-wrap max-md:justify-center">
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
    
        <div class="mt-2 flex gap-2">
          <button class="btn-primary" onclick={onOpenModal}>Add new</button>
          <button class="btn-ghost" onclick={profileService.logout}>Log out</button>
        </div>

    </div>
  </div>

  <section class="w-full">
    <h2 class="text-lg font-semibold mb-2">Your posts</h2>

      <TestGrid posts={$grid} onDeletePost={onDeletePost}/>
  </section>
</div>

<CreatePostModal
  open={isOpenCreatePost}
  on:created={onCreatePost}
  on:close={onCloseModal}
/>

<style>
  input[disabled] { opacity: 0.9; background: #f7fafc; padding: 8px; border-radius: 6px; }

  .btn-primary { background:#06b6d4; color:white; padding:8px 12px; border-radius:8px; border:none; }
  .btn-ghost { background:transparent; color:#374151; border:1px solid #e6e6e6; padding:8px 12px; border-radius:8px; }
</style>