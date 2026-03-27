import React, { createContext, useContext, useState, useEffect } from 'react';
import { container } from '../../di/container';
import { Corretor } from '../../domain/entities/Corretor';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase';
import { CheckSessionUseCase } from '../../application/use-cases/CheckSessionUseCase';
import { LogoutUseCase } from '../../application/use-cases/LogoutUseCase';

type AuthContextType = {
  user: Corretor | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as any);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Corretor | null>(null);
  const [loading, setLoading] = useState(true);

  const loginUseCase = new LoginUseCase(container.authGateway, container.sessionRepository);
  const checkSessUseCase = new CheckSessionUseCase(container.sessionRepository);
  const logoutUseCase = new LogoutUseCase(container.authGateway, container.sessionRepository);

  useEffect(() => {
    checkSessUseCase.execute().then(res => {
      setUser(res?.corretor || null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await loginUseCase.execute(email, pass);
      setUser(res.corretor);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await logoutUseCase.execute();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
