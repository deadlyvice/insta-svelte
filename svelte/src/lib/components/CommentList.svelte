<script lang="ts">
	import { api } from '$lib/api/posts'
  import { posts } from '$lib/store/postsState.svelte'
  import { profile } from '$lib/store/userState.svelte'
  export let comments: IComment[] = []
  export let loading: boolean = false
  export let postId!: number

  let text = ''
  let submitting = false

  // format date helper
  function fmt(date: string | Date) {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleString()
  }

  async function send() {
    const payload = { post_id: postId, data: text.trim() }
    if (!payload.data) return
    if (!($profile)) return // user must be logged in

    submitting = true
    try {
      const res = await posts.postComment(postId, payload)
      if (res && (res as any).ok) {
        // server returns created IComment
        const created: IComment = (res as any).data
        comments = [...comments, created] // append returned comment
        text = ''
      } else {
        // handle error (optional): you can show toast
        console.warn('Failed to post comment', res)
      }
    } catch (err) {
      console.error('postComment error', err)
    } finally {
      submitting = false
    }
  }

  async function onDeleteComment(id:number) {
    api.deleteComment(id)
  }
</script>

{#if loading}
  <div class="comments-empty">Loading comments…</div>
{:else}
  {#if comments.length === 0}
    <div class="comments-empty">No comments yet.</div>
  {:else}
    <div>
      {#each comments as c (c.id)}
        <div class="comment">
          <div class="avatar" aria-hidden="true"></div>
          <div style="flex:1">
            <div class="meta">
              <strong>User #{c.user_id}</strong>
              <span style="margin-left:8px">• {fmt(c.created_at)}</span>
              {#if $profile?.id === c.user_id}
                 <button class="ml-[100%] hover:bg-red-500! p-1! " onclick={()=> onDeleteComment(c.id)}>delete</button>
              {/if}
            </div>
            <div class="content">{c.data}</div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
{/if}

{#if !$profile}
<div class="text-red-400">
  register to write a comment
</div>
{/if}
<div class="comment-input">
  <textarea bind:value={text} placeholder="Write a comment…" >
  </textarea>
  <button
    onclick={send}
    disabled={!$profile || submitting || text.trim().length === 0}
  >
    {#if submitting}Sending…{:else}Send{/if}
  </button>
</div>



<style>
  .comment {
    display: flex;
    gap: 12px;
    padding: 8px 0;
    border-bottom: 1px solid #f1f5f9;
  }
  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(90deg,#e6e6e6 0%,#f2f2f2 50%,#e6e6e6 100%);
    background-size: 200% 100%;
    animation: pulse 1.2s linear infinite;
    flex-shrink: 0;
  }
  .meta { font-size: 12px; color: #6b7280; }
  .content { margin-top: 4px; white-space: pre-wrap; }

  @keyframes pulse { 0% { background-position:200% 0 } 100% { background-position:-200% 0 } }

  .comments-empty { padding: 12px; color: #6b7280; text-align: center; }

  .comment-input { display:flex; gap:8px; margin-top:12px; align-items:center; }
  .comment-input textarea { flex:1; min-height:44px; padding:8px; border-radius:6px; border:1px solid #e6e6e6; resize:vertical; }
  .comment-input button { padding:8px 12px; border-radius:6px; background:#ef476f; color:white; border:none; cursor:pointer; }
  .comment-input button[disabled] { opacity:0.6; cursor:not-allowed; }
</style>
