// tRPC client for the ToxicReads backend (same API the website uses).
import {createTRPCClient, httpBatchLink} from '@trpc/client';
import superjson from 'superjson';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ACCESS_TOKEN} from '../Utils/Keys';
import {TRPC_URL} from './config';

async function authHeaders() {
  try {
    const raw = await AsyncStorage.getItem(ACCESS_TOKEN);
    const token = raw ? JSON.parse(raw) : null;
    return token ? {Authorization: `Bearer ${token}`} : {};
  } catch {
    return {};
  }
}

export const trpc = createTRPCClient({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: TRPC_URL,
      async headers() {
        return authHeaders();
      },
    }),
  ],
});
