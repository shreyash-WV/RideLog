import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { rideTrackingService } from '../../services/RideTrackingService';
import { databaseService, Trip } from '../../services/DatabaseService';

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function ActiveRideScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const initAndPoll = async () => {
      // 1. Try to start if not already tracking
      const trip = await databaseService.getActiveTrip();
      if (!trip) {
        await rideTrackingService.startTrip();
      }
      setIsInitializing(false);

      // 2. Poll the database to update UI since tracking is happening in a background process
      interval = setInterval(async () => {
        const updatedTrip = await databaseService.getActiveTrip();
        if (updatedTrip) setActiveTrip(updatedTrip);
      }, 1000);
    };

    initAndPoll();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const handleStop = async () => {
    await rideTrackingService.stopTrip();
    router.back(); 
  };

  const speedKmH = activeTrip ? Math.round(activeTrip.average_speed_mps * 3.6) : 0;
  const maxSpeedKmH = activeTrip ? Math.round(activeTrip.maximum_speed_mps * 3.6) : 0;
  const distanceKm = activeTrip ? (activeTrip.distance_meters / 1000).toFixed(2) : '0.00';
  const duration = activeTrip ? formatDuration(activeTrip.duration_seconds) : '00:00';
  const points = activeTrip ? activeTrip.total_recorded_points : 0;

  return (
    <View className="flex-1 bg-oled" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      
      {/* Top Telemetry */}
      <View className="flex-row justify-between px-6 mt-6">
        <View>
          <Typography variant="caption" color="text-gray-500">MAX SPEED</Typography>
          <Typography variant="h2" color="text-white">{maxSpeedKmH} <Typography variant="caption" color="text-gray-500">km/h</Typography></Typography>
        </View>
        <View className="items-end">
          <Typography variant="caption" color="text-gray-500">POINTS</Typography>
          <Typography variant="h2" color="text-white">{points}</Typography>
        </View>
      </View>

      {/* Primary Speedometer (Showing Avg Speed for now as background points don't constantly ping foreground speed) */}
      <View className="flex-1 items-center justify-center">
        <Typography variant="bodySm" color="text-gray-500" className="mb-2 tracking-widest">
          {isInitializing ? 'INITIALIZING GPS...' : 'AVG SPEED'}
        </Typography>
        <Typography variant="telemetry" color={isInitializing ? "text-gray-600" : "text-amber"}>
          {speedKmH}
        </Typography>
        <Typography variant="h2" color="text-gray-500" className="mt-2">
          KM/H
        </Typography>
        <Typography variant="caption" color="text-green-500 mt-4">
          {activeTrip ? 'RECORDING IN BACKGROUND' : ''}
        </Typography>
      </View>

      {/* Secondary Stats */}
      <View className="flex-row justify-between px-8 mb-12">
        <View className="items-center">
          <Typography variant="caption" color="text-gray-500 mb-1">DISTANCE</Typography>
          <Typography variant="h2" color="text-white">
            {distanceKm} <Typography variant="caption" color="text-gray-500">km</Typography>
          </Typography>
        </View>
        <View className="items-center">
          <Typography variant="caption" color="text-gray-500 mb-1">TIME</Typography>
          <Typography variant="h2" color="text-white">
            {duration}
          </Typography>
        </View>
      </View>

      {/* Stop Controls */}
      <View className="px-6 pb-6">
        <Button variant="danger" onPress={handleStop}>Hold to Stop Ride</Button>
      </View>

    </View>
  );
}
