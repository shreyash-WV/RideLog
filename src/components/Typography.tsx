import React from 'react';
import { Text, TextProps } from 'react-native';

interface TypographyProps extends TextProps {
  variant?: 'h1' | 'h2' | 'bodyLg' | 'bodySm' | 'caption' | 'telemetry';
  color?: string; // Optional tailwind color class e.g., 'text-amber'
  className?: string;
}

export const Typography = ({
  variant = 'bodyLg',
  color = 'text-white',
  className = '',
  children,
  ...props
}: TypographyProps) => {
  let baseStyle = '';

  switch (variant) {
    case 'h1':
      baseStyle = 'text-[34px] font-bold leading-tight';
      break;
    case 'h2':
      baseStyle = 'text-[28px] font-bold leading-tight';
      break;
    case 'bodyLg':
      baseStyle = 'text-[17px] leading-relaxed';
      break;
    case 'bodySm':
      baseStyle = 'text-[15px] leading-relaxed';
      break;
    case 'caption':
      baseStyle = 'text-[13px] leading-snug';
      break;
    case 'telemetry':
      // The crucial monospaced huge font for dashboards
      baseStyle = 'text-[96px] font-mono leading-none tracking-tighter';
      break;
  }

  return (
    <Text className={`${baseStyle} ${color} ${className}`} {...props}>
      {children}
    </Text>
  );
};
