import * as SQLite from 'expo-sqlite';

const DB_NAME = 'ridelog.db';

export type TripStatus = 'recording' | 'paused' | 'completed' | 'interrupted';

export interface Trip {
  id: string;
  started_at: string;
  ended_at: string | null;
  status: TripStatus;
  duration_seconds: number;
  distance_meters: number;
  average_speed_mps: number;
  maximum_speed_mps: number;
  total_recorded_points: number;
  created_at: string;
  updated_at: string;
}

export interface TripPoint {
  id: string;
  trip_id: string;
  latitude: number;
  longitude: number;
  recorded_at: string;
  accuracy_meters: number;
  speed_mps: number | null;
  altitude_meters: number | null;
  heading_degrees: number | null;
  sequence_number: number;
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init() {
    if (this.db) return;
    this.db = await SQLite.openDatabaseAsync(DB_NAME);
    await this.runMigrations();
  }

  getDb(): SQLite.SQLiteDatabase {
    if (!this.db) {
      this.db = SQLite.openDatabaseSync(DB_NAME);
    }
    return this.db;
  }

  private async runMigrations() {
    const db = this.getDb();
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
      
      CREATE TABLE IF NOT EXISTS trips (
        id TEXT PRIMARY KEY,
        started_at TEXT NOT NULL,
        ended_at TEXT,
        status TEXT NOT NULL,
        duration_seconds INTEGER DEFAULT 0,
        distance_meters REAL DEFAULT 0,
        average_speed_mps REAL DEFAULT 0,
        maximum_speed_mps REAL DEFAULT 0,
        total_recorded_points INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS trip_points (
        id TEXT PRIMARY KEY,
        trip_id TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        recorded_at TEXT NOT NULL,
        accuracy_meters REAL,
        speed_mps REAL,
        altitude_meters REAL,
        heading_degrees REAL,
        sequence_number INTEGER NOT NULL,
        FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_trip_points_trip_id ON trip_points(trip_id);
      CREATE INDEX IF NOT EXISTS idx_trip_points_recorded_at ON trip_points(recorded_at);
      CREATE INDEX IF NOT EXISTS idx_trip_points_sequence ON trip_points(trip_id, sequence_number);
    `);
  }

  async createTrip(id: string): Promise<void> {
    const db = this.getDb();
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO trips (id, started_at, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
      [id, now, 'recording', now, now]
    );
  }

  async updateTrip(trip: Trip): Promise<void> {
    const db = this.getDb();
    const now = new Date().toISOString();
    await db.runAsync(
      `UPDATE trips SET 
        ended_at = ?, status = ?, duration_seconds = ?, distance_meters = ?, 
        average_speed_mps = ?, maximum_speed_mps = ?, total_recorded_points = ?, updated_at = ?
       WHERE id = ?`,
      [
        trip.ended_at, trip.status, trip.duration_seconds, trip.distance_meters,
        trip.average_speed_mps, trip.maximum_speed_mps, trip.total_recorded_points, now,
        trip.id
      ]
    );
  }

  async getActiveTrip(): Promise<Trip | null> {
    const db = this.getDb();
    const trip = await db.getFirstAsync<Trip>(`SELECT * FROM trips WHERE status = 'recording' ORDER BY started_at DESC LIMIT 1`);
    return trip;
  }

  async getTrip(id: string): Promise<Trip | null> {
    const db = this.getDb();
    const trip = await db.getFirstAsync<Trip>(`SELECT * FROM trips WHERE id = ?`, [id]);
    return trip;
  }

  async getAllTrips(): Promise<Trip[]> {
    const db = this.getDb();
    return await db.getAllAsync<Trip>(`SELECT * FROM trips ORDER BY started_at DESC`);
  }

  async getTripPoints(tripId: string): Promise<TripPoint[]> {
    const db = this.getDb();
    return await db.getAllAsync<TripPoint>(`SELECT * FROM trip_points WHERE trip_id = ? ORDER BY sequence_number ASC`, [tripId]);
  }

  async insertTripPoints(points: Omit<TripPoint, 'id'>[]): Promise<void> {
    if (points.length === 0) return;
    const db = this.getDb();
    
    // SQLite.runAsync supports parameterized queries, but inserting multiple rows 
    // requires a transaction and a loop with prepareAsync or just running in sequence.
    await db.withTransactionAsync(async () => {
      const statement = await db.prepareAsync(`
        INSERT INTO trip_points (id, trip_id, latitude, longitude, recorded_at, accuracy_meters, speed_mps, altitude_meters, heading_degrees, sequence_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      try {
        for (const pt of points) {
          const id = `pt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          await statement.executeAsync([
            id, pt.trip_id, pt.latitude, pt.longitude, pt.recorded_at, 
            pt.accuracy_meters, pt.speed_mps, pt.altitude_meters, pt.heading_degrees, pt.sequence_number
          ]);
        }
      } finally {
        await statement.finalizeAsync();
      }
    });
  }
  
  async deleteTrip(tripId: string): Promise<void> {
    const db = this.getDb();
    await db.withTransactionAsync(async () => {
      await db.runAsync('DELETE FROM trip_points WHERE trip_id = ?', [tripId]);
      await db.runAsync('DELETE FROM trips WHERE id = ?', [tripId]);
    });
  }
}

export const databaseService = new DatabaseService();
