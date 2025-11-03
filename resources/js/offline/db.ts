import Dexie from 'dexie';

// Local IndexedDB database for Tap & Track
export const pmsDB = new Dexie('TapAndTrackDB');

pmsDB.version(1).stores({
  // tableName: primaryKey, indexed fields
  assets: 'id,name,category_id,status,updated_at',
  transfers: 'id,status,current_building_id,receiving_building_id,updated_at',
  scheduling: 'id,asset_id,status,date,updated_at',
  offcampus: 'id,asset_id,status,date_return,updated_at',
  queuedSyncs: '++id,type,data,created_at',
});

export default pmsDB;
