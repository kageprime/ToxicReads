import {
  Image,
  Modal,
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React, {memo, useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

// custom import
import {styles} from '../../Theme';
import CText from '../common/CText';
import {Colors} from '../../Theme/Colors';
import {deviceHeight, getHeight, moderateScale} from '../../common/constant';
import String from '../../i18n/String';
import CButton from '../common/CButton';

const BuyBookModal = props => {
  let {visible, item, onPressClose, onPressReview} = props;

  const [isLike, setIsLike] = useState(false);

  const onPressLikeButton = () => {
    setIsLike(!isLike);
  };

  return (
    <Modal animationType="fade" transparent={true} visible={visible}>
      <View style={localStyle.mainContainer}>
        <View style={localStyle.modalContainer}>
          <Image source={item.image} style={localStyle.bookImageStyle} />
          <View style={localStyle.scrollTopContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View>
                <View style={localStyle.reviewContainer}>
                  {item.ratingStar}
                  <CText type={'S16'} color={Colors.Black} style={styles.m10}>
                    {item.rating}
                  </CText>
                  <TouchableOpacity onPress={onPressReview}>
                    <CText type={'S16'} color={Colors.Black}>
                      {String.review}
                      {'('}
                      <CText type={'S16'} color={Colors.Gray70}>
                        {item.noOfPeopleRated}
                      </CText>
                      {')'}
                    </CText>
                  </TouchableOpacity>
                </View>
                <CText
                  type={'S20'}
                  color={Colors.Black}
                  align={'center'}
                  numberOfLines={2}>
                  {item.title}
                </CText>
                <CText
                  type={'S16'}
                  color={Colors.Black}
                  align={'center'}
                  style={styles.m10}>
                  {item.author}
                </CText>
                <View style={localStyle.dotContainerStyle}>
                  <View style={localStyle.dotStyle} />
                  <View style={localStyle.dotStyle} />
                  <View style={localStyle.dotStyle} />
                </View>
                <View style={[styles.rowSpaceBetween, styles.mt10]}>
                  <View>
                    <CText type={'M14'} color={Colors.Gray70}>
                      {String.price}
                    </CText>
                    <CText
                      type={'S18'}
                      color={Colors.Black}
                      style={styles.mt10}>
                      {item.originalPrice}
                    </CText>
                  </View>
                  <View>
                    <CText type={'M14'} color={Colors.Gray70}>
                      {String.soldBy}
                    </CText>
                    <CText
                      type={'S18'}
                      color={Colors.Black}
                      style={styles.mt10}>
                      {item.soldBy}
                      <CText type={'S18'} color={Colors.Black}>
                        {String.book}
                      </CText>
                    </CText>
                  </View>
                </View>
                <View style={styles.rowSpaceBetween}></View>

                <CText
                  type={'M14'}
                  color={Colors.Gray70}
                  style={[styles.mv10, styles.mt20]}>
                  {String.synopsis}
                </CText>
                <CText
                  type={'R14'}
                  color={Colors.Gray90}
                  style={localStyle.paragraphStyle}>
                  {item.bookParagraphText1}
                </CText>
                <CText
                  type={'R14'}
                  color={Colors.Gray90}
                  style={localStyle.paragraphStyle}>
                  {item.bookParagraphText2}
                </CText>
              </View>
            </ScrollView>
          </View>
          <View style={localStyle.bottomContainer}>
            <View style={[styles.flexRow, styles.alignCenter]}>
              <TouchableOpacity
                onPress={onPressLikeButton}
                style={localStyle.likeBtnStyle}>
                <Ionicons
                  name={isLike ? 'heart' : 'heart-outline'}
                  size={moderateScale(24)}
                  color={Colors.LikeColor}
                />
              </TouchableOpacity>
              <CText type={'M12'} color={Colors.Gray100}>
                {String.addWishlist}
              </CText>
            </View>
            <CButton
              title={String.buyNow}
              color={Colors.White}
              type={'D16'}
              onPress={onPressClose}
              containerStyle={localStyle.btnStyle}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default memo(BuyBookModal);

const localStyle = StyleSheet.create({
  mainContainer: {
    ...styles.flex,
    backgroundColor: Colors.ModalBackgroundColor,
  },
  modalContainer: {
    backgroundColor: Colors.White,
    borderTopRightRadius: moderateScale(20),
    borderTopLeftRadius: moderateScale(20),
    ...styles.ph20,
    ...styles.justifyEnd,
    // height: '70%',
    height: deviceHeight / 1.39,
    bottom: 0,
    position: 'absolute',
  },
  bookImageStyle: {
    height: moderateScale(297),
    width: moderateScale(193),
    borderRadius: moderateScale(8),
    ...styles.selfCenter,
    position: 'absolute',
    top: moderateScale(-160),
  },
  scrollTopContainer: {
    height: getHeight(340),
    ...styles.pv10,
  },
  reviewContainer: {
    ...styles.rowSpaceBetween,
    ...styles.center,
  },
  dotContainerStyle: {
    ...styles.flexRow,
    ...styles.center,
  },
  dotStyle: {
    height: moderateScale(5),
    backgroundColor: Colors.Gray50,
    borderRadius: moderateScale(8),
    width: moderateScale(5),
    ...styles.m10,
  },
  likeBtnStyle: {
    backgroundColor: Colors.White,
    borderRadius: moderateScale(24),
    height: moderateScale(40),
    width: moderateScale(40),
    ...styles.center,
    ...styles.m10,
    borderColor: Colors.Borderline,
    borderWidth: moderateScale(1),
  },
  btnStyle: {
    width: '50%',
  },
  paragraphStyle: {
    lineHeight: getHeight(28),
  },
  bottomContainer: {
    ...styles.rowSpaceBetween,
    ...styles.mb20,
    backgroundColor: Colors.White,
  },
});
