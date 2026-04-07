import React from 'react';
import { render } from '@testing-library/react-native';
import MapScreen from '../../../../app/(tabs)/map';
import { useProspectos } from '../../../../src/presentation/hooks/useProspectos';

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const React = require('react');
  const View = require('react-native').View;
  const MockMapView = (props: any) => <View {...props} />;
  return {
    __esModule: true,
    default: MockMapView,
    Marker: (props: any) => <View {...props} />,
    Callout: (props: any) => <View {...props} />,
    PROVIDER_GOOGLE: 'google'
  };
});

// Mock useProspectos
jest.mock('../../../../src/presentation/hooks/useProspectos', () => ({
  useProspectos: jest.fn(() => ({
    prospectos: [],
    loading: false
  }))
}));

describe('MapScreen', () => {
  it('deve renderizar a tela do mapa', () => {
    const { getByText } = render(<MapScreen />);
    expect(getByText(/Mapa de Imóveis/i)).toBeTruthy();
  });
});
