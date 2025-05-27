/* eslint-disable @typescript-eslint/no-explicit-any */

export class CacheManager<TCache = any, TFetchTime = any> {
  public constructor(
    public cache: TCache, 
    public lastFetchTime: TFetchTime, 
    public cacheLife: number, 
    public refreshTimer: number | null
  ) {
    this.cache = cache;
    this.lastFetchTime = lastFetchTime;
    this.cacheLife = cacheLife;
    this.refreshTimer = refreshTimer ?? null;
  }

  /**
   * Checks if cache is expired for simple scalar timestamp caches
   */
  isExpired(): boolean {
    if (typeof this.lastFetchTime === 'number') {
      return Date.now() - this.lastFetchTime > this.cacheLife;
    }
    return false;
  }

  /**
   * Clears the refresh timer if it exists
   */
  clearTimer(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}