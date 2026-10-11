import React from 'react';
import { Pressable, PressableProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Typography } from './Typography';

interface ButtonProps extends PressableProps {
  variant?: 'primary' | 'secondary' | 'danger';
  children: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({ variant = 'primary', children, style, onPress, ...props }: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-amber border-transparent';
      case 'secondary':
        return 'bg-glass border-glass';
      case 'danger':
        return 'bg-red-500/20 border-red-500/50';
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return 'text-black';
      case 'secondary':
        return 'text-white';
      case 'danger':
        return 'text-red-500';
    }
  };

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSpring(0.96, { stiffness: 400, damping: 20 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { stiffness: 400, damping: 20 });
  };

  const handlePress = (e: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onPress) onPress(e);
  };

  return (
    <AnimatedPressable
      className={`h-14 rounded-2xl items-center justify-center border ${getVariantStyles()}`}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[animatedStyle, style as any]}
      {...props}
    >
      <Typography variant="bodyLg" className={`font-semibold ${getTextColor()}`}>{children}</Typography>
    </AnimatedPressable>
  );
}
