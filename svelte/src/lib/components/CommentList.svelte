<script lang="ts">

  export let comments: IComment[] = [];
  export let loading: boolean = false;

  // format date helper
  function fmt(date: string | Date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString();
  }
</script>

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
  .meta {
    font-size: 12px;
    color: #6b7280;
  }
  .content {
    margin-top: 4px;
    white-space: pre-wrap;
  }

  @keyframes pulse {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .comments-empty {
    padding: 12px;
    color: #6b7280;
    text-align: center;
  }

  .comment-input {
    display:flex;
    gap:8px;
    margin-top:12px;
    align-items:center;
  }
  .comment-input textarea {
    flex:1;
    min-height:44px;
    padding:8px;
    border-radius:6px;
    border:1px solid #e6e6e6;
    resize:vertical;
  }
  .comment-input button {
    padding:8px 12px;
    border-radius:6px;
    background:#ef476f;
    color:white;
    border:none;
    cursor:pointer;
  }
  .comment-input button[disabled] { opacity:0.6; cursor:not-allowed; }
</style>

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
            </div>
            <div class="content">{c.data}</div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
{/if}

<!-- UI-only comment form (no submit wiring) -->
<div class="comment-input">
  <textarea placeholder="Write a comment…" disabled></textarea>
  <button disabled>Send</button>
</div>
