import React from 'react';
import { Platform, View, useWindowDimensions } from 'react-native';

/** On wide web viewports the app is shown inside a phone-sized frame so reviewers see the real layout. */
export function PhoneFrame({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();
  if (Platform.OS !== 'web' || width < 560) return <>{children}</>;
  const frameHeight = Math.min(860, height - 32);
  const frameWidth = Math.min(402, Math.round(frameHeight * 0.47));
  return (
    <View style={{ flex: 1, backgroundColor: '#DDE2EA', alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: frameWidth,
          height: frameHeight,
          borderRadius: 46,
          borderWidth: 10,
          borderColor: '#0B1220',
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 30px 80px rgba(15,23,42,0.35)',
        }}
      >
        {children}
      </View>
    </View>
  );
}
