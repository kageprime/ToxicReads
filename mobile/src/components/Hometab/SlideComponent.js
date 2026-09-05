import {StyleSheet, View} from 'react-native';
import React from 'react';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

// custom import
import CText from '../common/CText';
import {moderateScale, deviceWidth} from '../../common/constant';
import {Colors} from '../../Theme/Colors';
import {styles} from '../../Theme';

export default function SlideComponent(props) {
  const {endPoint, maxValue, title, subTitle1, subTitle2} = props;

  const customMarker = event => {
    return (
      <View style={localStyle.markerContainer}>
        <View style={localStyle.sliderLength} />
      </View>
    );
  };
  return (
    <View style={styles.mb10}>
      <CText type={'S16'} style={localStyle.textStyle}>
        {title}
      </CText>
      <MultiSlider
        sliderLength={deviceWidth - moderateScale(48)}
        values={[endPoint]}
        min={0}
        max={maxValue}
        step={1}
        markerOffsetY={20}
        selectedStyle={{backgroundColor: Colors.Primary}}
        trackStyle={localStyle.sliderContainer}
        customMarker={customMarker}
      />
      <View style={localStyle.lowerTextStyle}>
        <CText type={'S12'} color={Colors.Gray60}>
          {'$260'}
        </CText>
        <CText type={'S12'} color={Colors.Gray60}>
          {'$12,000'}
        </CText>
      </View>
    </View>
  );
}

const localStyle = StyleSheet.create({
  sliderContainer: {
    height: moderateScale(8),
    borderRadius: moderateScale(8),
    backgroundColor: Colors.secondary,
  },
  textStyle: {
    ...styles.mv10,
    ...styles.ml5,
  },
  sliderLength: {
    height: moderateScale(24),
    width: moderateScale(24),
    borderRadius: moderateScale(12),
    borderWidth: moderateScale(6),
    backgroundColor: Colors.Primary,
    borderColor: Colors.White,
  },
  markerContainer: {
    height: moderateScale(55),
    ...styles.center,
    ...styles.justifyStart,
  },
  lowerTextStyle: {
    ...styles.rowSpaceBetween,
    bottom: moderateScale(15),
    ...styles.mt5,
  },
});
