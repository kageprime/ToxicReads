import {StyleSheet, TouchableOpacity, View, Image} from 'react-native';
import React, {memo, useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

//custom import
import {moderateScale} from '../../common/constant';
import {Colors} from '../../Theme/Colors';
import CText from '../common/CText';
import {styles} from '../../Theme';

const BookDataComponents = ({item, onPress}) => {
  const [isLike, setIsLike] = useState(false);

  const onPressLikeButton = () => setIsLike(!isLike);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={localStyle.mainContainer}
      onPress={onPress}>
      <View style={localStyle.imageBackgroundStyle}>
        <Image source={item.image} style={localStyle.bookImageStyle}></Image>
        {item.discount ? (
          <View style={localStyle.discountTextStyle}>
            <CText type={'S10'} color={Colors.White}>
              {item.discount}
            </CText>
          </View>
        ) : null}
        <TouchableOpacity
          onPress={onPressLikeButton}
          style={localStyle.likeBtnStyle}>
          <Ionicons
            name={isLike ? 'heart' : 'heart-outline'}
            size={moderateScale(16)}
            color={Colors.LikeColor}
          />
        </TouchableOpacity>
      </View>
      <View style={localStyle.bookTextContainer}>
        <CText type={'D14'} color={Colors.Black} numberOfLines={1}>
          {item.title}
        </CText>
        <CText type={'R10'} color={Colors.Gray70}>
          {item.msg}
        </CText>
        <View style={styles.rowSpaceBetween}>
          <View style={[styles.rowSpaceBetween, styles.mt5]}>
            <CText type={'B12'} color={Colors.Black} style={styles.mr10}>
              {item.originalPrice}
            </CText>
            <CText type={'R10'} color={Colors.Red}>
              {item.withoutDiscountPrice}
            </CText>
          </View>
          <View style={[styles.rowSpaceBetween, styles.mt5]}>
            {item.ratingStar}
            <CText type={'B12'} color={Colors.Black} style={styles.ml5}>
              {item.rating}
            </CText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default memo(BookDataComponents);

const localStyle = StyleSheet.create({
  mainContainer: {
    ...styles.flex,
    width: moderateScale(154),
    ...styles.mr10,
    ...styles.mb10,
  },
  imageBackgroundStyle: {
    backgroundColor: Colors.secondary,
    borderRadius: moderateScale(4),
    height: moderateScale(221),
  },
  bookImageStyle: {
    height: moderateScale(185),
    width: moderateScale(126),
    ...styles.selfCenter,
    ...styles.mv15,
  },
  discountTextStyle: {
    backgroundColor: Colors.Primary,
    height: moderateScale(24),
    width: moderateScale(55),
    borderRadius: moderateScale(4),
    position: 'absolute',
    ...styles.center,
    top: moderateScale(10),
    left: moderateScale(10),
  },
  likeBtnStyle: {
    position: 'absolute',
    top: moderateScale(10),
    right: moderateScale(10),
    backgroundColor: Colors.White,
    borderRadius: moderateScale(12),
    height: moderateScale(24),
    width: moderateScale(24),
    ...styles.center,
  },
  bookTextContainer: {
    ...styles.mt5,
  },
});
