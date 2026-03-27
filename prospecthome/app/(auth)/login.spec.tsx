import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from './login';
import { useAuth } from '../../src/presentation/hooks/useAuth';

// Mock useAuth hook
jest.mock('../../src/presentation/hooks/useAuth', () => ({
  useAuth: jest.fn()
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn()
  }
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

  it('deve exibir erro se o login falhar', async () => {
    mockLogin.mockRejectedValue(new Error('Credenciais inválidas'));
    // Mock global alert
    global.alert = jest.fn();

    const { getByText } = render(<LoginScreen />);
    fireEvent.press(getByText('ENTRAR'));

    await waitFor(() => expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Credenciais inválidas')));
  });
});
