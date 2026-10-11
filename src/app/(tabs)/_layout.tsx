import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { View, StyleSheet } from 'react-native';
import { Bike, Map, User } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { position: 'absolute', bottom: 0, left: 0, right: 0, elevation: 0, borderTopWidth: 0, backgroundColor: 'transparent' },
        tabBarBackground: () => (
          <BlurView 
            tint="dark" 
            intensity={40} 
            style={StyleSheet.absoluteFill} 
            className="border-t border-glass"
          />
        ),
        tabBarActiveTintColor: '#FF9F0A', // Amber
        tabBarInactiveTintColor: '#60646C',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Garage',
          tabBarIcon: ({ color }) => <Bike color={color as string} size={24} />,
        }}
      />
      <Tabs.Screen
        name="rides"
        options={{
          title: 'Rides',
          tabBarIcon: ({ color }) => <Map color={color as string} size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User color={color as string} size={24} />,
        }}
      />
    </Tabs>
  );
}
