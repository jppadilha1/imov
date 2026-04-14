import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RegisterScreen from '../../../app/(auth)/register';
import { useAuth } from '../../../hooks/useAuth';

// Mock useAuth hook
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: jest.fn()
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    back: jest.fn()
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
  User: ({ size, color }: any) => <></>,
}));

describe('RegisterScreen', () => {
  const mockRegister = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      register: mockRegister,
      user: null,
      loading: false
    });
  });

  it('deve renderizar os campos de nome, email e senha', () => {
    const { getByPlaceholderText } = render(<RegisterScreen />);
    
    expect(getByPlaceholderText('Nome Completo')).toBeTruthy();
    expect(getByPlaceholderText('E-mail')).toBeTruthy();
    expect(getByPlaceholderText('Senha')).toBeTruthy();
  });

  it('deve chamar a funcao de registro ao clicar no botao', async () => {
    const { getByText, getByPlaceholderText } = render(<RegisterScreen />);
    
    fireEvent.changeText(getByPlaceholderText('Nome Completo'), 'Novo Corretor');
    fireEvent.changeText(getByPlaceholderText('E-mail'), 'novo@teste.com');
    fireEvent.changeText(getByPlaceholderText('Senha'), '123456');
    fireEvent.press(getByText('CRIAR CONTA'));

    expect(mockRegister).toHaveBeenCalledWith('novo@teste.com', '123456', 'Novo Corretor');
  });

  it('deve exibir erro se o registro falhar', async () => {
    mockRegister.mockRejectedValue(new Error('Email já em uso'));
    global.alert = jest.fn();

    const { getByText, getByPlaceholderText } = render(<RegisterScreen />);
    
    fireEvent.changeText(getByPlaceholderText('Nome Completo'), 'Novo Corretor');
    fireEvent.changeText(getByPlaceholderText('E-mail'), 'novo@teste.com');
    fireEvent.changeText(getByPlaceholderText('Senha'), '123456');
    
    fireEvent.press(getByText('CRIAR CONTA'));

    await waitFor(() => expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Email já em uso')));
  });

  it('deve exibir link para voltar ao login', () => {
    const { getByText } = render(<RegisterScreen />);
    expect(getByText('Entrar')).toBeTruthy();
  });
});
