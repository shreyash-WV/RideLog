import React, { ReactNode } from 'react';
import { ViewProps, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassCardProps extends ViewProps {
  children: ReactNode;
  intensity?: number;
  className?: string;
}

export const GlassCard = ({ children, intensity = 20, className = '', ...props }: GlassCardProps) => {
  return (
    <BlurView
      intensity={intensity}
      tint="dark"
      className={`rounded-2xl overflow-hidden border border-glass bg-glass p-4 ${className}`}
      {...props}
    >
      {children}
    </BlurView>
  );
};
