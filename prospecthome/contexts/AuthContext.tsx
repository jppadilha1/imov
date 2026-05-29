import React, { createContext, useContext, useState, useEffect } from 'react';
import { container } from '../src/di/container';
import { Corretor } from '../src/domain/entities/Corretor';
import { LoginUseCase } from '../src/domain/use-cases/LoginUseCase';
import { RegisterUseCase } from '../src/domain/use-cases/RegisterUseCase';
import { CheckSessionUseCase } from '../src/domain/use-cases/CheckSessionUseCase';
import { LogoutUseCase } from '../src/domain/use-cases/LogoutUseCase';

type AuthContextType = {
  user: Corretor | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({} as any);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Corretor | null>(null);
  const [loading, setLoading] = useState(true);

  // Lazy loading instances to avoid issues in tests or di race conditions
  const getLoginUseCase = () => new LoginUseCase(container.authGateway);
  const getRegisterUseCase = () => new RegisterUseCase(container.authGateway);
  const getCheckSessUseCase = () => new CheckSessionUseCase(container.authGateway);
  const getLogoutUseCase = () => new LogoutUseCase(container.authGateway);

  useEffect(() => {
    getCheckSessUseCase().execute().then(res => {
      setUser(res?.corretor || null);
    }).catch(() => {
      setUser(null);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await getLoginUseCase().execute(email, pass);
      setUser(res.corretor);
    } catch (e) {
      setUser(null);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      const res = await getRegisterUseCase().execute(email, pass, name);
      setUser(res.corretor);
    } catch (e) {
      setUser(null);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await getLogoutUseCase().execute();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
