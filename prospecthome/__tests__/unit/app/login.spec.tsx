import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../../app/(auth)/login';
import { useAuth } from '../../../hooks/useAuth';

// Mock useAuth hook
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: jest.fn()
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
  }
}));

// Mock icons
jest.mock('lucide-react-native', () => ({
  Home: ({ size, color }: any) => <></>,
  Search: ({ size, color }: any) => <></>,
  Mail: ({ size, color }: any) => <></>,
  Lock: ({ size, color }: any) => <></>,
  Eye: ({ size, color }: any) => <></>,
  EyeOff: ({ size, color }: any) => <></>,
}));

describe('LoginScreen', () => {
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      user: null,
      loading: false
    });
  });

  it('deve renderizar os campos de email e senha', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);

    expect(getByPlaceholderText('E-mail')).toBeTruthy();
    expect(getByPlaceholderText('Senha')).toBeTruthy();
  });

  it('deve chamar a funcao de login ao clicar no botao', async () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('E-mail'), 'test@test.com');
    fireEvent.changeText(getByPlaceholderText('Senha'), '123456');
    fireEvent.press(getByText('ENTRAR'));

    expect(mockLogin).toHaveBeenCalledWith('test@test.com', '123456');
  });

  it('deve exibir link para criar conta', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('Criar conta')).toBeTruthy();
  });
});
