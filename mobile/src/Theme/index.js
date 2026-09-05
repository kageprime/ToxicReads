import {StyleSheet} from 'react-native';
import flex from './flex';
import margin from './margin';
import padding from './padding';
import CommonStyle from './CommonStyle';
import {Colors} from './colors';
// export * from './colors';

// Combine All Styles Here
export const styles = StyleSheet.create({
  ...flex,
  ...margin,
  ...padding,
  ...CommonStyle,
  // ...Colors,
});
