<script lang="ts">
  let url = '';
  let shortenedUrl = '';
  let error = '';
  let loading = false;

  // Fallback if VITE_API_URL is undefined (e.g., in dev)
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  
  // Type for the API response
  interface ShortenResponse {
    shortUrl?: string;
    error?: string;
  }    


  async function handleSubmit() {
    if (!url) {
      error = 'Please enter a URL';
      return;
    }

    // Reset state
    error = '';
    shortenedUrl = '';
    loading = true;

    // Add URL validation
    try {
      new URL(url); // This will throw if URL is invalid
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

      console.log('Received response status:', response.status);

      const data: ShortenResponse = await response.json();
      console.log('API Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || `Server responded with status ${response.status}`);
      }

      if (!data.shortUrl) {
        throw new Error('Server did not return a shortened URL');
      }

      shortenedUrl = data.shortUrl;
    } catch (err) {
      console.error('Error details:', err);
      error = err instanceof Error ? err.message : 'An unexpected error occurred';
      
      // For network errors, provide more specific messaging
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        error = 'Could not connect to the server. Please try again later.';
      }
    } finally {
      loading = false;
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
      <div class="error">{error}</div>
    {/if}

    {#if shortenedUrl}
      <div class="result">
        <p>Your shortened URL:</p>
        <a href={shortenedUrl} target="_blank" rel="noopener noreferrer">
          {shortenedUrl}
        </a>
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

  .error {
    color: var(--color-beige);
    margin: 1rem 0;
    padding: 0.75rem;
    background-color: rgba(34, 40, 49, 0.5);
    border-radius: 4px;
    border: 1px solid var(--color-beige);
    font-weight: 500;
  }

  .result {
    margin-top: 1rem;
    padding: 1rem;
    background-color: rgba(34, 40, 49, 0.5);
    border-radius: 4px;
    border: 1px solid var(--color-brown);
  }

  .result p {
    margin-bottom: 0.5rem;
    color: var(--color-beige);
    font-weight: 500;
  }

  .result a {
    color: var(--color-brown);
    text-decoration: none;
    word-break: break-all;
    transition: color 0.2s;
    font-weight: 500;
  }

  .result a:hover {
    color: var(--color-beige);
    text-decoration: underline;
  }
</style>
