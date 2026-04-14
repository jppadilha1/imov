import React from 'react';
import { render } from '@testing-library/react-native';
import { ProspectoCard } from './ProspectoCard';
import { Prospecto } from '../src/domain/entities/Prospecto';
import { PhotoPath } from '../src/domain/value-objects/PhotoPath';
import { Coordinates } from '../src/domain/value-objects/Coordinates';

describe('ProspectoCard', () => {
  const mockProp = Prospecto.create({
    id: 'local-123',
    userId: 'u1',
    photoPath: new PhotoPath('test.jpg'),
    coordinates: new Coordinates(0, 0)
  });

  it('deve exibir o ID e status do prospecto', () => {
    const { getByText } = render(<ProspectoCard prospecto={mockProp} />);
    expect(getByText(/ID: local-12/i)).toBeTruthy();
    expect(getByText(/Pendente/i)).toBeTruthy();
  });
});
