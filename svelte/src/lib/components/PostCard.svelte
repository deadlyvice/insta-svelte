<script lang="ts">
  import ImageWithSkeleton from '$lib/components/ImageWithSkeleton.svelte';
  import CommentList from '$lib/components/CommentList.svelte';
  import { posts as service } from '$lib/store/postsState.svelte';

  export let post: IPost;

  // counts come from server (updated after reaction)
  let likeCount = post.like_count ?? 0;
  let dislikeCount = post.dislike_count ?? 0;

  let likeLoading = false;
  let dislikeLoading = false;

  let showComments = false;
  let commentsLoading = false;
  let commentsLoaded = false;
  let comments: IComment[] = [];

  function excerpt(text: string, n = 160) {
    if (!text) return '';
    return text.length > n ? text.slice(0, n).trim() + '…' : text;
  }

  async function like() {
    if (likeLoading) return;
    likeLoading = true;
    try {
      const res = await service.likePost(post.id);
      if (res && (res as any).ok && (res as any).data) {
        // server returns updated post
        const updated: IPost = (res as any).data;
        likeCount = updated.like_count;
        dislikeCount = updated.dislike_count;
      }
    } catch (err) {
      console.error('likePost failed', err);
    } finally {
      likeLoading = false;
    }
  }

  async function dislike() {
    if (dislikeLoading) return;
    dislikeLoading = true;
    try {
      const res = await service.dislikePost(post.id);
      if (res && (res as any).ok && (res as any).data) {
        const updated: IPost = (res as any).data;
        likeCount = updated.like_count;
        dislikeCount = updated.dislike_count;
      }
    } catch (err) {
      console.error('dislikePost failed', err);
    } finally {
      dislikeLoading = false;
    }
  }

  async function toggleComments() {
    showComments = !showComments;
    if (showComments && !commentsLoaded) {
      commentsLoading = true;
      try {
        const res = await service.getCommentsByPostId(post.id);
        if (res && (res as any).ok && (res as any).data) {
          comments = (res as any).data;
        } else {
          comments = [];
        }
      } catch (err) {
        comments = [];
      } finally {
        commentsLoaded = true;
        commentsLoading = false;
      }
    }
  }
</script>

<article class="card">
  {#if post.img_urls?.length}
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

  <footer class="mt-3">
    <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
      <div class="flex items-center gap-3">
        <button aria-label="Like" class="flex items-center gap-1" on:click={like} disabled={likeLoading}>
          <!-- icon -->
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 21s-6-4.35-9-7.5C-0.5 11.5 1 6.5 5 5.5c2.5-.6 4.5 1 7 3.5 2.5-2.5 4.5-4.1 7-3.5 4 1 5.5 6 2 8-3 3.15-9 7.5-9 7.5z" fill="currentColor"/></svg>
          <span>{likeCount}</span>
        </button>

        <button aria-label="Dislike" class="flex items-center gap-1" on:click={dislike} disabled={dislikeLoading}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3s6 4.35 9 7.5c3.5 3.65 2 8.65-2 9.5-2.5.6-4.5-1-7-3.5-2.5 2.5-4.5 4.1-7 3.5-4-1-5.5-6-2-8C6 7.85 12 3 12 3z" fill="currentColor"/></svg>
          <span>{dislikeCount}</span>
        </button>

        <button aria-label="Comments" class="flex items-center gap-1" on:click={toggleComments}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="currentColor"/></svg>
          <span>{commentsLoaded ? comments.length : 'Comments'}</span>
        </button>
      </div>

      <div class="text-xs text-gray-400">#{post.id}</div>
    </div>

    <div class="comments-panel {showComments ? 'open' : ''}">
      {#if showComments}
        {#if commentsLoading}
          <div style="padding:12px">Loading comments…</div>
        {:else}
          <CommentList {comments} loading={commentsLoading} postId={post.id} />
        {/if}
      {/if}
    </div>
  </footer>
</article>

<style>
  .card { background: white; border-radius: 10px; box-shadow: 0 1px 6px rgba(16,24,40,0.06); padding: 12px; }
  @media (prefers-color-scheme: dark) { .card { background: #0b1220; color: #e6eef8; box-shadow: 0 1px 10px rgba(2,6,23,0.6); } }
  .comments-panel { max-height: 0; overflow: hidden; transition: max-height 220ms ease; }
  .comments-panel.open { max-height: 1000px; }
  footer { margin-top: 8px; } .grid { margin-bottom: 0.75rem; } button[disabled] { opacity: 0.6; cursor: not-allowed; }
</style>
