// Session state for the mobile app (Bearer token in AsyncStorage).
import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ACCESS_TOKEN} from '../Utils/Keys';
import {trpc} from './client';

const AuthContext = createContext({
  user: null,
  restoring: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export function AuthProvider({children}) {
  const [user, setUser] = useState(null);
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(ACCESS_TOKEN);
        if (raw && JSON.parse(raw)) {
          const me = await trpc.auth.me.query();
          setUser(me);
        }
      } catch {
        await AsyncStorage.removeItem(ACCESS_TOKEN).catch(() => {});
        setUser(null);
      } finally {
        setRestoring(false);
      }
    })();
  }, []);

  const login = async (username, password) => {
    const res = await trpc.auth.login.mutate({username, password});
    await AsyncStorage.setItem(ACCESS_TOKEN, JSON.stringify(res.token));
    setUser({
      id: res.id,
      username: res.username,
      name: res.name,
      role: res.role,
    });
    return res;
  };

  const register = async (username, password, name) => {
    const res = await trpc.auth.register.mutate({username, password, name});
    await AsyncStorage.setItem(ACCESS_TOKEN, JSON.stringify(res.token));
    setUser({
      id: res.id,
      username: res.username,
      name: res.name,
      role: res.role,
    });
    return res;
  };

  const logout = async () => {
    try {
      await trpc.auth.logout.mutate();
    } catch {
      // Local session clears regardless.
    }
    await AsyncStorage.removeItem(ACCESS_TOKEN).catch(() => {});
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{user, restoring, isAuthenticated: !!user, login, register, logout}}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
