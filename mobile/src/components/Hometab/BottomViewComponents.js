import {View, TouchableOpacity, StyleSheet} from 'react-native';
import React from 'react';

// custom import
import CText from '../common/CText';
import {GoogleIcon, AppleIcon} from '../../assets/svg';
import String from '../../i18n/String';
import {Colors} from '../../Theme/Colors';
import {styles} from '../../Theme';
import {moderateScale} from '../../common/constant';

export default function BottomViewComponents(props) {
  const {text, AccountText, navigation, onPress, containerStyle} = props;
  const OnPressContinueWithGoogle = () => {};

  const OnPressContinueWithApple = () => {};

  return (
    <View style={localStyle.mainContainer}>
      <View style={localStyle.SignInContainer}>
        <View style={localStyle.lineStyle}></View>
        <CText
          type={'S16'}
          align={'center'}
          color={Colors.GrayScale}
          style={styles.mh10}>
          {' '}
          {String.orContinueWith}
        </CText>
        <View style={localStyle.lineStyle}></View>
      </View>
      <TouchableOpacity
        onPress={OnPressContinueWithGoogle}
        style={localStyle.googleStyle}>
        <GoogleIcon />
        <CText
          type={'S16'}
          color={Colors.Black}
          align={'center'}
          style={styles.mh20}>
          {String.continueWithGoogle}
        </CText>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={OnPressContinueWithApple}
        style={localStyle.googleStyle}>
        <AppleIcon />
        <CText
          type={'S16'}
          color={Colors.Black}
          align={'center'}
          style={styles.mh20}>
          {String.continueWithApple}
        </CText>
      </TouchableOpacity>
      <View style={[localStyle.lastViewStyle, containerStyle]}>
        <CText type={'S16'} align={'center'} color={Colors.GrayScale}>
          {' '}
          {AccountText}{' '}
        </CText>
        <TouchableOpacity onPress={onPress}>
          <CText type={'S16'} align={'center'} color={Colors.Primary}>
            {' '}
            {text}{' '}
          </CText>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const localStyle = StyleSheet.create({
  mainContainer: {
    ...styles.flex,
    ...styles.mt30,
  },
  SignInContainer: {
    ...styles.rowCenter,
    ...styles.mh40,
    ...styles.mb20,
  },
  lineStyle: {
    height: moderateScale(1),
    backgroundColor: Colors.GrayScale,
    ...styles.flex,
  },
  googleStyle: {
    ...styles.alignCenter,
    ...styles.flexRow,
    ...styles.mv10,
    ...styles.center,
    ...styles.selfCenter,
    borderColor: Colors.Black,
    borderWidth: moderateScale(1),
    height: moderateScale(52),
    width: '90%',
    borderRadius: moderateScale(24),
  },
  lastViewStyle: {
    ...styles.rowCenter,
    ...styles.mt40,
  },
});
