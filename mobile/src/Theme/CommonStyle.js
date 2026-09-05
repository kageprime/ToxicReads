import {StyleSheet} from 'react-native';
import {Colors} from './Colors';
import flex from './flex';
import {deviceWidth, moderateScale, deviceHeight} from '../common/constant';

export default StyleSheet.create({
  mainContainerWhite: {
    backgroundColor: Colors.White,
    ...flex.flex,
  },
  mainContainerSurface: {
    backgroundColor: Colors.Canvas,
    ...flex.flex,
    width: deviceWidth,
    height: deviceHeight,
  },
  mainContainerWithRadius: {
    ...flex.flex,
    backgroundColor: Colors.White,
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
    height: moderateScale(614),
  },
});
