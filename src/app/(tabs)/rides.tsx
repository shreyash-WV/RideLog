import React from 'react';
import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '../../components/Typography';
import { GlassCard } from '../../components/GlassCard';
import { useRideStore } from '../../store/useRideStore';
import { Ride } from '../../types/models';

export default function RidesScreen() {
  const insets = useSafeAreaInsets();
  const { history } = useRideStore();

  const renderItem = ({ item }: { item: Ride }) => {
    const date = new Date(item.startTime).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric' 
    });

    return (
      <View className="px-4 mb-4">
        <GlassCard intensity={20} className="flex-row items-center justify-between">
          <View>
            <Typography variant="bodyLg" className="font-semibold text-white">{date}</Typography>
            <Typography variant="bodySm" color="text-gray-400 mt-1">
              {item.weather?.condition} • {item.weather?.temperature}°
            </Typography>
          </View>
          <View className="items-end">
            <Typography variant="h2" color="text-amber">
              {item.totalDistance.toFixed(1)} <Typography variant="caption" color="text-amber">mi</Typography>
            </Typography>
            <Typography variant="caption" color="text-gray-400 mt-1">
              Max Lean: {item.maxLeanAngle}°
            </Typography>
          </View>
        </GlassCard>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-carbon" style={{ paddingTop: insets.top }}>
      <Typography variant="h1" className="px-4 mb-6 mt-4 text-white">Ride History</Typography>

      {history.length === 0 ? (
        <View className="flex-1 px-4 justify-center">
          <Typography variant="h2" color="text-white">No rides yet</Typography>
          <Typography variant="bodySm" color="text-gray-400" className="mt-2">
            Finished rides will show up here.
          </Typography>
        </View>
      ) : (
        <FlashList
          data={history}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
}
