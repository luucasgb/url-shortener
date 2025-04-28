<script lang="ts">
  let url = '';
  let shortenedUrl = '';
  let error = '';
  let loading = false;
  let showResult = false;
  let copyButtonText = 'Copy';
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  
  interface ShortenResponse {
    shortUrl?: string;
    error?: string;
  }    

  async function handleSubmit() {
    if (!url) {
      error = 'Please enter a URL';
      showResult = false;
      return;
    }

    // Reset states
    error = '';
    shortenedUrl = '';
    showResult = false;
    loading = true;

    try {
      new URL(url);
    } catch (e) {
      error = 'Please enter a valid URL (include http:// or https://)';
      loading = false;
      return;
    }

    try {      
      const response = await fetch(`${API_BASE_URL}/shorten`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ originalUrl: url }),
      });

      const data: ShortenResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server responded with status ${response.status}`);
      }

      if (!data.shortUrl) {
        throw new Error('Server did not return a shortened URL');
      }

      shortenedUrl = data.shortUrl;
      showResult = true;
    } catch (err) {
      console.error('Error details:', err);
      error = err instanceof Error ? err.message : 'An unexpected error occurred';
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        error = 'Could not connect to the server. Please try again later.';
      }
    } finally {
      loading = false;
    }
  }

  // Copy to clipboard function
  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      copyButtonText = 'Copied!';
    } catch (err) {
      error = 'Failed to copy to clipboard';
      console.error('Copy failed:', err);
    }
  }
</script>

<main>
  <div class="container">
    <h1>URL Shortener</h1>
    
    <form on:submit|preventDefault={handleSubmit}>
      <div class="input-group">
        <input
          type="url"
          bind:value={url}
          placeholder="Enter your long URL here"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Shortening...' : 'Shorten URL'}
        </button>
      </div>
    </form>

    {#if error}
      <div class="error-message">
        {error}
      </div>
    {/if}

    {#if showResult}
    <div class="result-box">
      <p>Your shortened URL:</p>
      <div class="url-container">
        <a href={shortenedUrl} target="_blank" rel="noopener noreferrer">
          {new URL(shortenedUrl).hostname}/{new URL(shortenedUrl).pathname.split('/')[1]}
        </a>
        <button 
          class="copy-button" 
          on:click={() => copyToClipboard(shortenedUrl)}
          aria-label="Copy to clipboard"
        >
          {copyButtonText}
        </button>
      </div>
    </div>
  {/if}
  </div>
</main>

<style>
  :root {
    --color-dark: #222831;
    --color-gray: #393E46;
    --color-brown: #948979;
    --color-beige: #DFD0B8;
  }

  :global(body) {
    margin: 0;
    font-family: 'Poppins', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
      Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: var(--color-dark);
    color: var(--color-beige);
  }

  main {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
  }

  .container {
    background: var(--color-gray);
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    width: 100%;
    max-width: 600px;
  }

  h1 {
    margin: 0 0 2rem;
    text-align: center;
    color: var(--color-beige);
    font-weight: 600;
    font-size: 2rem;
  }

  .input-group {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  input {
    flex: 1;
    padding: 0.75rem;
    border: 2px solid var(--color-brown);
    border-radius: 4px;
    font-size: 1rem;
    font-family: 'Poppins', sans-serif;
    background-color: var(--color-dark);
    color: var(--color-beige);
  }

  input::placeholder {
    color: var(--color-brown);
    opacity: 0.7;
  }

  button {
    padding: 0.75rem 1.5rem;
    background-color: var(--color-brown);
    color: var(--color-dark);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    transition: all 0.2s;
  }

  button:hover {
    background-color: var(--color-beige);
    transform: translateY(-1px);
  }

  button:disabled {
    background-color: var(--color-gray);
    cursor: not-allowed;
    transform: none;
  }

  .error-message {
    color: #ff6b6b;
    margin: 1rem 0;
    padding: 0.75rem;
    background-color: rgba(255, 107, 107, 0.1);
    border-radius: 4px;
    border: 1px solid #ff6b6b;
    font-weight: 500;
  }

  .result-box {
    margin-top: 1.5rem;
    padding: 1.25rem;
    background-color: rgba(75, 192, 192, 0.1);
    border-radius: 6px;
    border: 1px solid #4bc0c0;
    animation: fadeIn 0.3s ease-out;
  }

  .result-box p {
    margin-bottom: 0.75rem;
    color: #4bc0c0;
    font-weight: 500;
  }

  .result-box a {
    color: #4bc0c0;
    text-decoration: none;
    word-break: break-all;
    transition: color 0.2s;
    font-weight: 500;
  }

  .result-box a:hover {
    color: #2d9d9d;
    text-decoration: underline;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .url-container {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-top: 0.5rem;
  }

  .copy-button {
    padding: 0.5rem 1rem;
    background-color: var(--color-brown);
    color: var(--color-dark);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    font-family: 'Poppins', sans-serif;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .copy-button:hover {
    background-color: var(--color-beige);
    transform: translateY(-1px);
  }

  /* Animation for the "Copied!" feedback */
  @keyframes fadeInOut {
    0% { opacity: 0; transform: scale(0.95); }
    50% { opacity: 1; transform: scale(1.05); }
    100% { opacity: 0; transform: scale(0.95); }
  }

  .copy-button:active {
    transform: translateY(0);
  }
</style>
