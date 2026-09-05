import {Platform} from 'react-native';
import {moderateScale} from '../common/constant';

// ToxicReads type system — matches web:
// body → system sans (SF / Roboto), display → serif (Georgia / Noto Serif)
const sansFamily = Platform.select({android: 'sans-serif', ios: null});
const serifFamily = Platform.select({android: 'serif', ios: 'Georgia'});

const fontWeights = {
  Regular: {
    ...(sansFamily ? {fontFamily: sansFamily} : {}),
    fontWeight: '400',
  },
  Medium: {
    ...(sansFamily ? {fontFamily: sansFamily} : {}),
    fontWeight: '500',
  },
  Bold: {
    ...(sansFamily ? {fontFamily: sansFamily} : {}),
    fontWeight: '700',
  },
  SemiBold: {
    ...(sansFamily ? {fontFamily: sansFamily} : {}),
    fontWeight: '600',
  },
  ItalicBold: {
    ...(sansFamily ? {fontFamily: sansFamily} : {}),
    fontWeight: '700',
    fontStyle: 'italic',
  },
  // Display serif — headlines, book titles, wordmark
  Display: {
    ...(serifFamily ? {fontFamily: serifFamily} : {}),
    fontWeight: '400',
  },
};

const fontSize = {
  f10: {
    fontSize: moderateScale(10),
  },
  f12: {
    fontSize: moderateScale(12),
  },
  f14: {
    fontSize: moderateScale(14),
  },
  f16: {
    fontSize: moderateScale(16),
  },
  f18: {
    fontSize: moderateScale(18),
  },
  f20: {
    fontSize: moderateScale(20),
  },
  f22: {
    fontSize: moderateScale(22),
  },
  f24: {
    fontSize: moderateScale(24),
  },
  f26: {
    fontSize: moderateScale(26),
  },
  f28: {
    fontSize: moderateScale(28),
  },
  f30: {
    fontSize: moderateScale(30),
  },
  f32: {
    fontSize: moderateScale(32),
  },
  f34: {
    fontSize: moderateScale(34),
  },
  f36: {
    fontSize: moderateScale(36),
  },
  f38: {
    fontSize: moderateScale(38),
  },
  f40: {
    fontSize: moderateScale(40),
  },
  f48: {
    fontSize: moderateScale(48),
  },
  f80: {
    fontSize: moderateScale(80),
  },
};
const typography = {fontWeights, fontSize};
export default typography;
