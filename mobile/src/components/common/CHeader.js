//library import
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';
import Icons from 'react-native-vector-icons/Ionicons';

// local import
import {styles} from '../../Theme';
import {Colors} from '../../Theme/Colors';
import {moderateScale} from '../../common/constant';
import CText from './CText';

export default function CHeader(props) {
  const {title, OnPressBack, isHideBack, rightIcon, containerStyle, textStyle} =
    props;
  const navigation = useNavigation();
  const goBack = () => navigation.goBack();

  return (
    <View
      style={[
        localStyle.mainContainer,
        !!isHideBack && styles.ph10,
        containerStyle,
      ]}>
      {!isHideBack && (
        <TouchableOpacity
          onPress={OnPressBack || goBack}
          style={[localStyle.backIconStyle]}>
          <Icons
            name="arrow-back-outline"
            size={moderateScale(24)}
            style={styles.m5}
            color={Colors.Black}></Icons>
        </TouchableOpacity>
      )}

      <View style={[localStyle.container]}>
        <CText
          type={'D18'}
          align={'center'}
          numberOfLines={1}
          style={textStyle}>
          {title}
        </CText>
      </View>
      {!!rightIcon && rightIcon}
    </View>
  );
}

const localStyle = StyleSheet.create({
  mainContainer: {
    backgroundColor: Colors.White,
    ...styles.rowSpaceBetween,
    ...styles.ph20,
    ...styles.pv15,
    height: moderateScale(60),
  },
  backIconStyle: {
    backgroundColor: Colors.Gray30,
    ...styles.p5,
    borderRadius: moderateScale(25),
    ...styles.ml15,
    position: 'absolute',
    zIndex: 1,
  },
  container: {
    ...styles.flex,
    ...styles.mh40,
  },
});
