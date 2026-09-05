import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import React, {useState} from 'react';
import ActionSheet from 'react-native-actions-sheet';
import Ionicons from 'react-native-vector-icons/Ionicons';

// custom import
import {Colors} from '../../Theme/Colors';
import {moderateScale} from '../../common/constant';
import {styles} from '../../Theme';
import CText from '../common/CText';
import String from '../../i18n/String';
import images from '../../assets/images';
import CTextInput from '../common/CTextInput';
import CButton from '../common/CButton';

export default function WriteReview(props) {
  let {SheetRef} = props;

  const [rating, setRating] = useState('');
  const [reviewText, setReviewText] = useState('');

  const onPressClose = () => SheetRef.current?.hide();

  const onPressSubmit = () => SheetRef.current?.hide();

  const onPressReview = index => setRating(index);

  const onChangeReviewText = text => setReviewText(text);

  const renderStar = ({item, index}) => {
    return (
      <TouchableOpacity
        onPress={() => onPressReview(index)}
        style={styles.mh10}>
        <Image
          source={rating < index ? images.unFillStar : images.fillStar}
          style={localStyle.starContainer}
        />
      </TouchableOpacity>
    );
  };

  return (
    <ActionSheet
      ref={SheetRef}
      gestureEnabled={false}
      containerStyle={localStyle.actionSheetContainer}>
      <View style={localStyle.containerStyle}>
        <TouchableOpacity onPress={onPressClose}>
          <Ionicons
            name={'close'}
            color={Colors.Black}
            size={moderateScale(24)}
          />
        </TouchableOpacity>
        <View style={localStyle.container}>
          <CText type={'S20'} color={Colors.Black}>
            {String.giveReview}
          </CText>
        </View>
      </View>
      <View style={localStyle.ratingContainer}>
        <FlatList
          data={[1, 2, 3, 4, 5]}
          renderItem={renderStar}
          keyExtractor={item => item.toString()}
          horizontal
          bounces={false}
        />
      </View>
      <CTextInput
        multiline
        value={reviewText}
        label={String.detailReview}
        labelStyle={localStyle.labelStyle}
        containerStyle={localStyle.inputStyle}
        placeHolder={String.message}
        onChangeText={onChangeReviewText}
        keyBoardType={'default'}
      />

      <CButton
        title={String.submit}
        type={'S16'}
        color={Colors.White}
        containerStyle={localStyle.btnStyle}
        onPress={onPressSubmit}
      />
    </ActionSheet>
  );
}

const localStyle = StyleSheet.create({
  actionSheetContainer: {
    backgroundColor: Colors.White,
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
    ...styles.ph20,
    ...styles.pv20,
  },
  containerStyle: {
    ...styles.rowSpaceBetween,
    ...styles.pv15,
  },
  container: {
    ...styles.flex0,
    right: moderateScale(80),
    ...styles.mh20,
  },
  ratingContainer: {
    ...styles.mt15,
    ...styles.center,
  },
  starContainer: {
    height: moderateScale(30),
    width: moderateScale(30),
    ...styles.mb10,
  },
  inputStyle: {
    ...styles.selfCenter,
    height: moderateScale(132),
    borderColor: Colors.Primary,
  },
  labelStyle: {
    marginLeft: 0,
  },
  btnStyle: {
    ...styles.mb20,
    ...styles.mt40,
  },
});
