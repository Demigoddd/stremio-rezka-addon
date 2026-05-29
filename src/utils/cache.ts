export class SimpleCache<T> {
    private cache = new Map<string, { value: T; expiresAt: number }>();

    constructor(private ttlMs: number = 1000 * 60 * 60) {} // By default 1 hour

    set(key: string, value: T): void {
        this.cache.set(key, { value, expiresAt: Date.now() + this.ttlMs });
    }

    get(key: string): T | null {
        const cached = this.cache.get(key);

        if (!cached) return null;

        if (Date.now() > cached.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return cached.value;
    }
}
