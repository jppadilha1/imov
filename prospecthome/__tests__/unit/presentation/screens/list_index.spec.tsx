import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ListScreen from '../../../../app/(tabs)/list/index';
import { useProspectos } from '../../../../src/presentation/hooks/useProspectos';

// Mock useProspectos
jest.mock('../../../../src/presentation/hooks/useProspectos', () => ({
  useProspectos: jest.fn()
}));

// Mock ProspectoCard
jest.mock('../../../../src/presentation/components/ProspectoCard', () => ({
  ProspectoCard: ({ prospecto, onPress }: any) => <></>
}));

describe('ListScreen', () => {
  const mockRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useProspectos as jest.Mock).mockReturnValue({
      prospectos: [
        { id: '1', status: { value: 'novo' }, syncStatus: { isSynced: () => false, isPending: () => true, isError: () => false } }
      ],
      loading: false,
      refreshing: false,
      refresh: mockRefresh
    });
  });

  it('deve renderizar a lista de prospectos', () => {
    const { getByText } = render(<ListScreen />);
    expect(getByText(/Meus Prospectos/i)).toBeTruthy();
  });
});
