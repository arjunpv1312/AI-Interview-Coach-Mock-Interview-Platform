export class ApiManager {
  private keys: string[];
  public currentIndex: number = 0;

  constructor() {
    const baseKey = process.env.GEMINI_API_KEY || '';
    const extraKeys = process.env.EXTRA_GEMINI_API_KEYS || '';
    
    this.keys = [baseKey, ...extraKeys.split(',')].map(k => k.trim()).filter(Boolean);
    
    if (this.keys.length === 0) {
       console.warn('ApiManager: No API keys found in GEMINI_API_KEY or EXTRA_GEMINI_API_KEYS');
    }
  }

  public getCurrentKey(): string {
    if (this.keys.length === 0) return '';
    return this.keys[this.currentIndex];
  }

  public nextKey(): string {
    if (this.keys.length === 0) return '';
    this.currentIndex = (this.currentIndex + 1) % this.keys.length;
    return this.keys[this.currentIndex];
  }

  public get customFetch() {
    return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const maxRetries = Math.max(1, this.keys.length);
      let attempts = 0;

      while (attempts < maxRetries) {
        const currentKey = this.getCurrentKey();
        
        let urlStr = input.toString();
        // The SDK might append the API key to the URL. If so, replace it dynamically.
        if (urlStr.includes('key=')) {
           urlStr = urlStr.replace(/key=[^&]*/, `key=${currentKey}`);
        }

        const modifiedInit = { ...init };
        const headers = new Headers(modifiedInit.headers || {});
        
        // The SDK might also set the key in headers. Update it dynamically.
        if (headers.has('x-goog-api-key')) {
           headers.set('x-goog-api-key', currentKey);
        }
        
        modifiedInit.headers = headers;

        const response = await fetch(urlStr, modifiedInit);

        if (response.status === 429) {
           console.warn(`[ApiManager] 429 Rate Limit hit with key index ${this.currentIndex}. Switching to next key...`);
           this.nextKey();
           attempts++;
           // If we exhausted all keys, return this 429 response so SDK can throw Error normally
           if (attempts >= maxRetries) {
              return response;
           }
        } else {
           return response;
        }
      }

      // Fallback if loop ends unexpectedly
      return fetch(input, init);
    };
  }
}

export const apiManager = new ApiManager();
