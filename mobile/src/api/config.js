// Central API configuration for the ToxicReads mobile app.
import {Platform} from 'react-native';

// Android emulator reaches the dev machine at 10.0.2.2; iOS simulator uses
// localhost. Physical devices: replace DEV_HOST with your machine's LAN IP.
const DEV_HOST =
  Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

// Production backend (same API the website uses).
const PROD_HOST = 'https://toxic-reads.vercel.app';

export const API_BASE_URL = __DEV__ ? DEV_HOST : PROD_HOST;
export const TRPC_URL = `${API_BASE_URL}/api/trpc`;

// Backend cover paths are root-relative ("/images/...") — absolutize them.
export const assetUrl = path => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};
