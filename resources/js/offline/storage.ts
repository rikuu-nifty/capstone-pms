import { pmsDB } from './db';

export async function cacheTable(table: string, data: any[]) {
  await pmsDB.table(table).clear();
  await pmsDB.table(table).bulkPut(data);
}

// Load cached data when offline
export async function getCachedTable(table: string) {
  return await pmsDB.table(table).toArray();
}
