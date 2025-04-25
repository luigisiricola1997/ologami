<script>
  import { onMount } from 'svelte';
  import { marked } from 'marked';

  let logs = [];
  let analysis = '';
  let error = '';
  let socket;

  onMount(() => {
    socket = new WebSocket('ws://localhost/api');
    socket.addEventListener('message', (event) => {
      if (!event.data) return;
      try {
        const log = JSON.parse(event.data);
        if (log.message && log.type && log.timestamp) {
          logs = [...logs, log];
        }
      } catch (err) {
        console.error('Parsing error:', err);
      }
    });

    const handleEsc = (e) => {
      if (e.key === 'Escape') analysis = '';
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  });

  const clearLogs = () => {
    logs = [];
    analysis = '';
    error = '';
  };

  const fetchAnalysis = async (type) => {
    analysis = '';
    error = '';
    try {
      const res = await fetch(`http://localhost/api/logger/log-analysis/${type}`, { method: 'POST' });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      analysis = data.analysis;
    } catch (err) {
      error = err.message;
    }
  };
</script>

<h2 class="text-xl mb-4 text-center">Logger</h2>

<div class="flex flex-wrap justify-center gap-2 mb-4">
  <button class="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded" on:click={clearLogs}>Clear Logs</button>
  <button class="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded" on:click={() => fetchAnalysis('hf')}>Analyze Logs (HF)</button>
  <button class="bg-green-700 hover:bg-green-600 px-4 py-2 rounded" on:click={() => fetchAnalysis('openai')}>Analyze Logs (OpenAI)</button>
</div>

<div class="space-y-2">
  {#each logs as log}
    <div class="bg-gray-800 p-3 rounded shadow">
      <p><strong>Message:</strong> {log.message}</p>
      <p><strong>Type:</strong> {log.type}</p>
      <p><strong>Timestamp:</strong> {log.timestamp}</p>
    </div>
  {/each}
</div>

{#if analysis}
  <div
    class="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center"
    role="dialog"
    aria-modal="true"
  >
    <button
      class="absolute inset-0"
      aria-label="Close analysis modal"
      on:click={() => analysis = ''}
      type="button"
    />
    <div
      class="relative bg-gray-900 text-white rounded-xl shadow-xl max-w-3xl w-full p-6 z-10"
      role="document"
      on:click|stopPropagation
    >
      <button
        class="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
        on:click={() => analysis = ''}
        aria-label="Close"
        type="button"
      >
        &times;
      </button>
      <h3 class="text-xl font-bold mb-4">AI Analysis</h3>
      <div class="max-h-[60vh] overflow-y-auto custom-scrollbar">
        <div class="prose prose-invert max-w-none">
          {@html marked(analysis)}
        </div>
      </div>
    </div>
  </div>
{/if}

{#if error}
  <div class="mt-6 p-4 bg-red-800 text-white rounded shadow">
    <h3 class="text-lg font-bold mb-2">Error:</h3>
    <pre>{error}</pre>
  </div>
{/if}
