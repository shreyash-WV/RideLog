import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { databaseService, TripPoint } from './DatabaseService';

export const BACKGROUND_LOCATION_TASK = 'background-location-task';

// Haversine formula for geodesic distance in meters
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Radius of earth in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('[BackgroundLocationTask] Error:', error.message);
    return;
  }
  
  if (!data) return;
  const { locations } = data as { locations: Location.LocationObject[] };

  try {
    // 1. Get the active trip directly from SQLite 
    // Do NOT rely on React state because this might run in a background headless JS context
    // where UI states aren't instantiated in the same way.
    const activeTrip = await databaseService.getActiveTrip();
    if (!activeTrip) {
      // If we don't have an active trip, we should stop tracking to save battery.
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
      return;
    }

    const pointsToInsert: Omit<TripPoint, 'id'>[] = [];
    let addedDistanceMeters = 0;
    let maxSpeedObserved = activeTrip.maximum_speed_mps;

    // We need to fetch the last point to calculate distance incrementally
    const existingPoints = await databaseService.getTripPoints(activeTrip.id);
    let lastPoint = existingPoints.length > 0 ? existingPoints[existingPoints.length - 1] : null;
    let currentSequence = existingPoints.length;

    for (const location of locations) {
      const coords = location.coords;

      // Filter invalid points (low accuracy)
      if (coords.accuracy && coords.accuracy > 50) {
        continue; 
      }

      const currentTimestamp = new Date(location.timestamp).toISOString();
      const currentSpeed = coords.speed && coords.speed > 0 ? coords.speed : 0;
      
      if (currentSpeed > maxSpeedObserved) {
        maxSpeedObserved = currentSpeed;
      }

      if (lastPoint) {
        const dist = calculateDistanceMeters(
          lastPoint.latitude, lastPoint.longitude,
          coords.latitude, coords.longitude
        );
        // Ignore implausible jumps
        if (dist > 0 && dist < 1000) { 
          addedDistanceMeters += dist;
        }
      }

      const newPoint = {
        trip_id: activeTrip.id,
        latitude: coords.latitude,
        longitude: coords.longitude,
        recorded_at: currentTimestamp,
        accuracy_meters: coords.accuracy || 0,
        speed_mps: coords.speed || null,
        altitude_meters: coords.altitude || null,
        heading_degrees: coords.heading || null,
        sequence_number: currentSequence++,
      };

      pointsToInsert.push(newPoint);
      lastPoint = { ...newPoint, id: '' };
    }

    if (pointsToInsert.length > 0) {
      await databaseService.insertTripPoints(pointsToInsert);

      // Update trip stats
      const newTotalDistance = activeTrip.distance_meters + addedDistanceMeters;
      
      // Calculate duration and avg speed
      const startedAt = new Date(activeTrip.started_at).getTime();
      const lastRecordedAt = new Date(pointsToInsert[pointsToInsert.length - 1].recorded_at).getTime();
      
      let durationSeconds = activeTrip.duration_seconds;
      if (lastRecordedAt > startedAt) {
        durationSeconds = Math.floor((lastRecordedAt - startedAt) / 1000);
      }

      let averageSpeed = activeTrip.average_speed_mps;
      if (durationSeconds > 0) {
        averageSpeed = newTotalDistance / durationSeconds;
      }

      await databaseService.updateTrip({
        ...activeTrip,
        distance_meters: newTotalDistance,
        duration_seconds: durationSeconds,
        average_speed_mps: averageSpeed,
        maximum_speed_mps: maxSpeedObserved,
        total_recorded_points: activeTrip.total_recorded_points + pointsToInsert.length,
      });
    }

  } catch (err) {
    console.error('[BackgroundLocationTask] Error saving locations:', err);
  }
});
