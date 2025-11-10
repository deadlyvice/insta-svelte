<script lang="ts">
  import PostGrid from '$lib/components/PostGrid.svelte';
  import Loader from '$lib/components/Loader.svelte';
  import CreatePostModal from '$lib/components/CreatePostModal.svelte';
  import { profile as profileService } from '$lib/store/userState.svelte';
  import { posts as postService } from '$lib/store/postsState.svelte';

  // reactive access
  const profile: IUser = $profileService!;
  let isOpenCreatePost = $state(false);

  function onMountGrid() {
    // server returned created post; refresh server state
    // parent uses server truth, so reload list
    console.log('on mount');
    
    return postService.getPostsByUserId(profile.id) as ApiResponse<IPost[]>
  }

  function onOpenModal() {
    isOpenCreatePost = true;
  }
  
  function onCloseModal() {
    isOpenCreatePost = false;
  }
  
  function onCreatePost(e: CustomEvent<IPost>) {
    const addPostEvent = new CustomEvent<IPost>('add-post', {detail: e.detail})
      document.dispatchEvent(addPostEvent)
  }


</script>

<div class="w-full p-4 flex flex-col items-center">
  <h1 class="text-center text-2xl font-semibold mb-4">Welcome to <b>Profile</b> page</h1>

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

  <section class="w-full">
    <h2 class="text-lg font-semibold mb-2">Your posts</h2>

      <PostGrid 
          loadPostsOnMount={onMountGrid}
      />
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