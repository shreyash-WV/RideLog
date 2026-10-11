import NetInfo from '@react-native-community/netinfo';
import { supabase } from './supabase';
import { useRideStore } from '../store/useRideStore';
import { useAuthStore } from '../store/useAuthStore';

class SyncService {
  private unsubscribeNetInfo: (() => void) | null = null;
  private isSyncing = false;

  public start() {
    console.log('[SyncService] Starting background sync listener');
    this.unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        this.attemptSync();
      }
    });
  }

  public stop() {
    if (this.unsubscribeNetInfo) {
      this.unsubscribeNetInfo();
      this.unsubscribeNetInfo = null;
    }
  }

  private async attemptSync() {
    if (this.isSyncing) return;

    const { history, updateRideSyncStatus } = useRideStore.getState();
    const { user } = useAuthStore.getState();

    // In a real app we require a user to sync to Supabase
    // if (!user) return; 

    // Find rides that failed or haven't been synced yet
    const pendingRides = history.filter(
      (ride) => ride.syncStatus === 'pending' || ride.syncStatus === 'error'
    );

    if (pendingRides.length === 0) return;

    this.isSyncing = true;
    console.log(`[SyncService] Attempting to sync ${pendingRides.length} rides...`);

    for (const ride of pendingRides) {
      try {
        updateRideSyncStatus(ride.id, 'syncing');

        // Transform data for Supabase insert
        // The most critical part: compressing the GPS array into JSONB
        const payload = {
          id: ride.id,
          // user_id: user.id, // Uncomment when Auth is fully active
          bike_id: ride.bikeId,
          start_time: new Date(ride.startTime).toISOString(),
          end_time: ride.endTime ? new Date(ride.endTime).toISOString() : null,
          total_distance: ride.totalDistance,
          max_speed: ride.maxSpeed,
          avg_speed: ride.avgSpeed,
          max_lean_angle: ride.maxLeanAngle,
          route_data: JSON.stringify(ride.route), 
        };

        const { error } = await supabase
          .from('rides')
          .upsert(payload);

        if (error) throw error;

        // Successfully pushed to the cloud
        updateRideSyncStatus(ride.id, 'synced');
        console.log(`[SyncService] Successfully synced ride: ${ride.id}`);
        
      } catch (err) {
        console.error(`[SyncService] Failed to sync ride ${ride.id}:`, err);
        updateRideSyncStatus(ride.id, 'error');
      }
    }

    this.isSyncing = false;
  }
}

export const syncService = new SyncService();
