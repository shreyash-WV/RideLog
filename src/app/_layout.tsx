import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import React, { useEffect } from 'react';
import { syncService } from '../services/SyncService';
import { notificationService } from '../services/NotificationService';
import { databaseService } from '../services/DatabaseService';
import '../services/BackgroundLocationTask';

export default function RootLayout() {
  useEffect(() => {
    databaseService.init();
    syncService.start();
    notificationService.init();
    
    return () => {
      syncService.stop();
      notificationService.cleanup();
    };
  }, []);

  return (
    <View className="flex-1 bg-oled" style={{ flex: 1, backgroundColor: '#000000' }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }} initialRouteName="(tabs)">
        <Stack.Screen name="(tabs)" />
        <Stack.Screen 
          name="(ride)" 
          options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} 
        />
      </Stack>
    </View>
  );
}
