
<script>
  import { onMount } from 'svelte';
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

<h2>Logger</h2>

<button on:click={clearLogs}>Clear Logs</button>
<button on:click={() => fetchAnalysis('hf')}>Analyze Logs (HF)</button>
<button on:click={() => fetchAnalysis('cgpt')}>Analyze Logs (CGPT)</button>

<div>
  {#each logs as log}
    <p><strong>Message:</strong> {log.message}, <strong>Type:</strong> {log.type}, <strong>Timestamp:</strong> {log.timestamp}</p>
  {/each}
</div>

{#if analysis}
  <div>
    <h3>AI Analysis:</h3>
    <pre>{analysis}</pre>
  </div>
{/if}

{#if error}
  <div style="color:red">
    <h3>Error:</h3>
    <pre>{error}</pre>
  </div>
{/if}
