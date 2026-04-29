import React from 'react';
import { render } from '@testing-library/react-native';
import MapScreen from '../../../app/(tabs)/map';

jest.mock('react-native-maps', () => {
  const React = require('react');
  const View = require('react-native').View;
  const MockMapView = React.forwardRef((props: any, ref: any) => (
    <View testID="map-view" {...props} />
  ));
  return {
    __esModule: true,
    default: MockMapView,
    Marker: (props: any) => <View {...props} />,
    Callout: (props: any) => <View {...props} />,
    PROVIDER_GOOGLE: 'google',
  };
});

jest.mock('../../../hooks/useProspectos', () => ({
  useProspectos: jest.fn(() => ({ prospectos: [], loading: false, fetch: jest.fn() })),
}));

jest.mock('../../../hooks/useLocation', () => ({
  useLocation: jest.fn(() => ({
    getCurrentPosition: jest.fn(),
    geocodeAddress: jest.fn(),
    loading: false,
  })),
}));

const mockIsConnected: { value: boolean | null } = { value: true };

jest.mock('../../../hooks/useNetwork', () => ({
  useNetwork: jest.fn(() => ({ isConnected: mockIsConnected.value })),
}));

jest.mock('../../../components/ProspectPreviewCard', () => ({
  ProspectPreviewCard: () => null,
}));

jest.mock('../../../components/SearchBar', () => ({
  SearchBar: () => null,
}));

jest.mock('lucide-react-native', () => ({
  RefreshCw: () => null,
  Search: () => null,
  Plus: () => null,
  Minus: () => null,
  Navigation: () => null,
  Home: () => null,
  WifiOff: () => <></>,
}));

jest.mock('react-native-safe-area-context', () => {
  const View = require('react-native').View;
  return {
    SafeAreaView: (props: any) => <View {...props} />,
    SafeAreaProvider: (props: any) => <View {...props} />,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

const { useNetwork } = require('../../../hooks/useNetwork');

describe('MapScreen', () => {
  it('deve renderizar a tela do mapa com branding', () => {
    useNetwork.mockReturnValue({ isConnected: true });
    const { getByText } = render(<MapScreen />);
    expect(getByText(/ProspectHome/i)).toBeTruthy();
  });

  it('exibe o MapView quando online', () => {
    useNetwork.mockReturnValue({ isConnected: true });
    const { getByTestId, queryByText } = render(<MapScreen />);
    expect(getByTestId('map-view')).toBeTruthy();
    expect(queryByText(/Você está offline/i)).toBeNull();
  });

  it('exibe placeholder quando offline (isConnected = false)', () => {
    useNetwork.mockReturnValue({ isConnected: false });
    const { getByText, queryByTestId } = render(<MapScreen />);
    expect(getByText(/Você está offline/i)).toBeTruthy();
    expect(getByText(/sincronizadas automaticamente/i)).toBeTruthy();
    expect(queryByTestId('map-view')).toBeNull();
  });

  it('exibe placeholder quando isConnected ainda é null (estado inicial)', () => {
    useNetwork.mockReturnValue({ isConnected: null });
    const { queryByTestId, queryByText } = render(<MapScreen />);
    // null não é false — mapa deve ser exibido
    expect(queryByTestId('map-view')).toBeTruthy();
    expect(queryByText(/Você está offline/i)).toBeNull();
  });
});
