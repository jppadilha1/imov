import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CaptureScreen from '../../../../app/(tabs)/capture';
import { useCapture } from '../../../../src/presentation/hooks/useCapture';

// Mock useCapture
jest.mock('../../../../src/presentation/hooks/useCapture', () => ({
  useCapture: jest.fn()
}));

// Mock icons
jest.mock('lucide-react-native', () => ({
  Camera: ({ size, color }: any) => <></>
}));

// Mock components
jest.mock('../../../../src/presentation/components/OfflineBanner', () => ({
  OfflineBanner: () => <></>
}));

// Mock router
jest.mock('expo-router', () => ({
  router: { push: jest.fn() }
}));

describe('CaptureScreen', () => {
  const mockCapture = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useCapture as jest.Mock).mockReturnValue({
      capture: mockCapture,
      loading: false,
      error: null
    });
  });

  it('deve chamar a captura ao pressionar o botao', async () => {
    const { getByText } = render(<CaptureScreen />);
    
    fireEvent.press(getByText('CAPTURAR IMÓVEL'));

    expect(mockCapture).toHaveBeenCalled();
  });

  it('deve exibir loading enquanto captura', () => {
    (useCapture as jest.Mock).mockReturnValue({
      capture: mockCapture,
      loading: true,
      error: null
    });

    const { getByTestId } = render(<CaptureScreen />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });
});
