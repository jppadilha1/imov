import React from 'react';
import { render } from '@testing-library/react-native';
import { MapMarkerCallout } from './MapMarkerCallout';
import { Prospecto } from '../src/domain/entities/Prospecto';
import { PhotoPath } from '../src/domain/value-objects/PhotoPath';
import { Coordinates } from '../src/domain/value-objects/Coordinates';

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const React = require('react');
  const View = require('react-native').View;
  return {
    Callout: ({ children }: any) => <View>{children}</View>
  };
});

describe('MapMarkerCallout', () => {
  const mockProp = Prospecto.create({
    id: 'local-1',
    userId: 'u1',
    photoPath: new PhotoPath('test.jpg'),
    coordinates: new Coordinates(0, 0)
  });

  it('deve exibir id encurtado e status', () => {
    const { getByText } = render(<MapMarkerCallout prospecto={mockProp} />);
    expect(getByText(/ID: local-1/i)).toBeTruthy();
  });
});
