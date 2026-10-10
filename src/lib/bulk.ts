export type BulkActionResult<T> = {
  succeeded: T[];
  failed: Array<{ item: T; error: unknown }>;
};

export async function runBulkAction<T>(
  items: T[],
  action: (item: T) => Promise<unknown>,
  concurrency = 5,
): Promise<BulkActionResult<T>> {
  const succeeded: T[] = [];
  const failed: Array<{ item: T; error: unknown }> = [];
  let cursor = 0;
  const workerCount = Math.max(1, Math.min(concurrency, items.length));

  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      const item = items[index];
      try {
        await action(item);
        succeeded.push(item);
      } catch (error) {
        failed.push({ item, error });
      }
    }
  }

  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return { succeeded, failed };
}
