import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {memo, useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

// custom import
import {styles} from '../../Theme';
import {Colors} from '../../Theme/Colors';
import {moderateScale} from '../../common/constant';
import CText from '../common/CText';

const RecommendationBookComponents = ({item, onPress}) => {
  const [isLike, setIsLike] = useState(false);

  const onPressLikeBtn = () => {
    setIsLike(!isLike);
  };

  return (
    <TouchableOpacity style={localStyles.mainContainer} onPress={onPress}>
      <View style={localStyles.imageBackgroundStyle}>
        <Image source={item.image} style={localStyles.bookImageStyle} />
        <TouchableOpacity
          onPress={onPressLikeBtn}
          style={localStyles.likeBtnStyle}>
          <Ionicons
            name={isLike ? 'heart' : 'heart-outline'}
            size={moderateScale(16)}
            color={Colors.LikeColor}
          />
        </TouchableOpacity>
      </View>
      <View style={localStyles.bookTextStyle}>
        <View style={[styles.rowSpaceBetween, styles.mb5]}>
          <CText
            type={'M12'}
            style={styles.flex}
            numberOfLines={1}
            color={Colors.Gray80}>
            {item.subTitle}{' '}
          </CText>
          <View style={styles.rowSpaceBetween}>
            {item.ratingStar}
            <CText type={'B12'} color={Colors.Black} style={styles.ml5}>
              {item.rating}
            </CText>
          </View>
        </View>
        <View style={styles.mb5}>
          <CText type={'D16'} color={Colors.Black} numberOfLines={1}>
            {item.title}
          </CText>
        </View>
        <View style={styles.rowStart}>
          <CText type={'B14'} color={Colors.Black}>
            {item.price}
          </CText>
          {item.withoutDiscountPrice ? (
            <CText type={'M12'} color={Colors.LikeColor} style={styles.ml5}>
              {item.withoutDiscountPrice}
            </CText>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};
export default memo(RecommendationBookComponents);

const localStyles = StyleSheet.create({
  mainContainer: {
    backgroundColor: Colors.White,
    ...styles.mv5,
    activeOpacity: 0.8,
    ...styles.flexRow,
  },
  imageBackgroundStyle: {
    backgroundColor: Colors.secondary,
    borderRadius: moderateScale(4),
    height: moderateScale(100),
    width: moderateScale(117),
  },
  bookImageStyle: {
    borderRadius: moderateScale(4),
    height: moderateScale(80),
    width: moderateScale(98),
    ...styles.center,
    ...styles.m10,
  },
  bookTextStyle: {
    ...styles.flex,
    ...styles.ph10,
  },

  likeBtnStyle: {
    position: 'absolute',
    right: moderateScale(5),
    backgroundColor: Colors.White,
    borderRadius: moderateScale(12),
    height: moderateScale(24),
    width: moderateScale(24),
    ...styles.center,
  },
});
