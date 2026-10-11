import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure the default behavior when a notification arrives while the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;

  public init() {
    // Listener for when a notification is received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('[NotificationService] Foreground notification received:', notification.request.content.title);
      // We could trigger a local Zustand toast here if we wanted custom UI instead of the OS banner
    });

    // Listener for when the user taps the OS notification banner
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log('[NotificationService] User tapped notification. Payload:', data);
      
      // In a real app, we would use Expo Router to deep link here
      // if (data.url) router.push(data.url);
    });
  }

  public cleanup() {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
  }

  public async requestPermissionsAndGetToken(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log('[NotificationService] Must use physical device for Push Notifications');
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('ridelog-alerts', {
        name: 'RideLog Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF9F0A', // Amber
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('[NotificationService] Failed to get push token for push notification!');
      return null;
    }

    try {
      const projectId = 'ridelog-app-placeholder'; // Normally loaded from Constants.expoConfig?.extra?.eas?.projectId
      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('[NotificationService] Expo Push Token:', token);
      
      // In a real app, we would sync this token to Supabase users table here
      
      return token;
    } catch (e) {
      console.error('[NotificationService] Error getting push token', e);
      return null;
    }
  }
}

export const notificationService = new NotificationService();
