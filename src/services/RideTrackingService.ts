import * as Location from 'expo-location';
import { databaseService } from './DatabaseService';
import { BACKGROUND_LOCATION_TASK } from './BackgroundLocationTask';

class RideTrackingService {
  public async startTrip() {
    const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
    if (fgStatus !== 'granted') {
      console.error('[RideTrackingService] Foreground location permission denied');
      return;
    }
    
    const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
    if (bgStatus !== 'granted') {
      console.warn('[RideTrackingService] Background location permission denied, app will not track when closed.');
    }

    // 1. Create trip record in SQLite
    const tripId = `trip_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    await databaseService.createTrip(tripId);

    // 2. Start Background Tracking
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    if (!hasStarted) {
      await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 2000,
        distanceInterval: 5,
        foregroundService: {
          notificationTitle: 'RideLog is tracking your trip',
          notificationBody: 'Your location is being recorded in the background.',
          notificationColor: '#E6F4FE',
        },
        showsBackgroundLocationIndicator: true,
      });
    }
    return tripId;
  }

  public async stopTrip() {
    // Stop Tracking
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    if (hasStarted) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    }

    // Mark active trip as completed
    const activeTrip = await databaseService.getActiveTrip();
    if (activeTrip) {
      await databaseService.updateTrip({
        ...activeTrip,
        status: 'completed',
        ended_at: new Date().toISOString(),
      });
    }
  }
}

export const rideTrackingService = new RideTrackingService();
