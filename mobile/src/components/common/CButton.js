import {StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
import {Colors} from '../../Theme/Colors';
import CText from './CText';
import {moderateScale} from '../../common/constant';
import {styles} from '../../Theme';

export default function CButton({
  title,
  type,
  color,
  onPress,
  style,
  containerStyle,
  textStyle,
  children,
  ...props
}) {
  return (
    <TouchableOpacity
      style={[
        localStyle.btnStyle,
        styles.rowCenter,
        {backgroundColor: Colors.Primary},
        containerStyle,
      ]}
      onPress={onPress}
      {...props}>
      <CText type={type} style={style} color={color}>
        {' '}
        {title}
      </CText>
      {children}
    </TouchableOpacity>
  );
}
const localStyle = StyleSheet.create({
  btnStyle: {
    backgroundColor: Colors.Primary,
    height: moderateScale(56),
    borderRadius: moderateScale(24),
    ...styles.center,
  },
});
