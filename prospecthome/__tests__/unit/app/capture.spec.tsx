import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CaptureScreen from '../../../app/(tabs)/capture';
import { useCapture } from '../../../hooks/useCapture';

// Mock useCapture
jest.mock('../../../hooks/useCapture', () => ({
  useCapture: jest.fn()
}));

// Mock icons
jest.mock('lucide-react-native', () => ({
  Camera: ({ size, color }: any) => <></>,
  MapPin: ({ size, color }: any) => <></>,
  ArrowLeft: ({ size, color }: any) => <></>,
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
  router: { push: jest.fn(), back: jest.fn() }
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
    
    fireEvent.press(getByText('TIRAR FOTO'));

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
