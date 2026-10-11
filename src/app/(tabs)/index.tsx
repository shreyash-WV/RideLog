import React from 'react';
import { View, Image, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { useGarageStore } from '../../store/useGarageStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassCard } from '../../components/GlassCard';

const { width } = Dimensions.get('window');

export default function GarageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const { bikes, activeBikeId, setActiveBike } = useGarageStore();
  const activeBike = bikes.find(b => b.id === activeBikeId) || bikes[0];

  const handleStartRide = () => {
    router.push('/(ride)/active');
  };

  return (
    <View className="flex-1 bg-carbon" style={{ paddingTop: insets.top }}>
      <Typography variant="h1" className="px-4 mb-6 mt-4 text-white">Garage</Typography>
      
      {bikes.length === 0 ? (
        <View className="flex-1 px-4 justify-center">
          <Typography variant="h2" color="text-white">No bikes yet</Typography>
          <Typography variant="bodySm" color="text-gray-400" className="mt-2">
            Add a bike to track mileage for your rides.
          </Typography>
        </View>
      ) : (
        <>
          <View style={{ height: 350 }}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / width);
                if (bikes[index]) setActiveBike(bikes[index].id);
              }}
            >
              {bikes.map((bike) => (
                <View key={bike.id} style={{ width }} className="px-4">
                  <View className="flex-1 rounded-3xl overflow-hidden relative border border-white/10 bg-titanium">
                    {bike.imageUrl && (
                      <Image
                        source={{ uri: bike.imageUrl }}
                        className="absolute inset-0 w-full h-full opacity-80"
                        resizeMode="cover"
                      />
                    )}
                    <View className="absolute inset-x-0 bottom-0 h-32 bg-black/60" />

                    <View className="absolute bottom-4 left-4 right-4">
                      <Typography variant="h2" color="text-white">{bike.nickname || bike.model}</Typography>
                      <Typography variant="bodySm" color="text-gray-300">
                        {bike.year} {bike.make} {bike.model}
                      </Typography>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          <View className="px-4 mt-6 flex-1">
            <GlassCard intensity={15} className="mb-4">
              <Typography variant="caption" color="text-gray-400">TOTAL MILEAGE</Typography>
              <Typography variant="h2" color="text-white">
                {activeBike?.totalMileage?.toLocaleString() ?? '0'} <Typography variant="bodySm" color="text-gray-400">mi</Typography>
              </Typography>
            </GlassCard>
          </View>
        </>
      )}

      <View className="px-4 pb-28">
        <Button variant="primary" onPress={handleStartRide}>Start Ride</Button>
      </View>
    </View>
  );
}
