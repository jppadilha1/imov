import React from 'react';
import { render } from '@testing-library/react-native';
import MapScreen from '../../../app/(tabs)/map';
import { useProspectos } from '../../../hooks/useProspectos';

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const React = require('react');
  const View = require('react-native').View;
  const MockMapView = React.forwardRef((props: any, ref: any) => <View {...props} />);
  return {
    __esModule: true,
    default: MockMapView,
    Marker: (props: any) => <View {...props} />,
    Callout: (props: any) => <View {...props} />,
    PROVIDER_GOOGLE: 'google'
  };
});

// Mock useProspectos
jest.mock('../../../hooks/useProspectos', () => ({
  useProspectos: jest.fn(() => ({
    prospectos: [],
    loading: false
  }))
}));

// Mock icons
jest.mock('lucide-react-native', () => ({
  RefreshCw: ({ size, color }: any) => <></>,
  Search: ({ size, color }: any) => <></>,
  Plus: ({ size, color }: any) => <></>,
  Minus: ({ size, color }: any) => <></>,
  Navigation: ({ size, color }: any) => <></>,
  ChevronRight: ({ size, color }: any) => <></>,
}));

// Mock safe area
jest.mock('react-native-safe-area-context', () => {
  const View = require('react-native').View;
  return {
    SafeAreaView: (props: any) => <View {...props} />,
    SafeAreaProvider: (props: any) => <View {...props} />,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

// Mock router
jest.mock('expo-router', () => ({
  router: { push: jest.fn() }
}));

describe('MapScreen', () => {
  it('deve renderizar a tela do mapa com branding', () => {
    const { getByText } = render(<MapScreen />);
    expect(getByText(/ProspectHome/i)).toBeTruthy();
  });
});
