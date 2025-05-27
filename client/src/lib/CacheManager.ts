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
}