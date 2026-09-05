import {StyleSheet, TouchableOpacity, View, ScrollView} from 'react-native';
import React, {useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ActionSheet from 'react-native-actions-sheet';

// custom import
import CText from '../common/CText';
import {styles} from '../../Theme';
import String from '../../i18n/String';
import BookTypeComponents from '../Hometab/BookTypeComponents';
import CButton from '../common/CButton';
import {moderateScale} from '../../common/constant';
import {Colors} from '../../Theme/Colors';
import SlideComponent from '../Hometab/SlideComponent';
import RatingComponents from '../Hometab/RatingComponents';

const FilterModal = ({SheetRef}) => {
  const [isSelect, setIsSelect] = useState(false);

  const onPressStar = item => {
    setIsSelect(item);
  };

  const onPressSelectClose = () => {
    SheetRef?.current?.hide();
  };

  const onPressApplyFilter = () => {
    SheetRef?.current?.hide();
  };

  return (
    <ActionSheet ref={SheetRef} containerStyle={localStyle.mainContainer}>
      <ScrollView
        style={styles.flexGrow1}
        showsVerticalScrollIndicator={false}
        bounces={false}>
        <View style={localStyle.modalMainContainer}>
          <View style={localStyle.headerContainer}>
            <View style={[styles.flexRow, styles.mt20]}>
              <TouchableOpacity onPress={onPressSelectClose}>
                <Ionicons
                  name={'close'}
                  color={Colors.Black}
                  size={moderateScale(24)}
                />
              </TouchableOpacity>
              <CText type={'S18'} color={Colors.Black} style={styles.ml15}>
                {String.filter}
              </CText>
            </View>
            <TouchableOpacity style={styles.mt20}>
              <CText type={'S14'} color={Colors.Primary}>
                {String.resetFilter}
              </CText>
            </TouchableOpacity>
          </View>
          <CText type={'S16'} color={Colors.Black} style={styles.m10}>
            {String.categories}
          </CText>
          <View style={[styles.flexRow, {flexWrap: 'wrap'}]}>
            <BookTypeComponents
              activebgColor={Colors.Primary}
              activeTxtColor={Colors.White}
              containerStyle={localStyle.bookTypeStyle}
              numColumns={4}
            />
          </View>
          <SlideComponent title={String.price} endPoint={50} maxValue={200} />
          <CText type={'B16'} color={Colors.Black} style={styles.mb5}>
            {String.starRating}
          </CText>
          <View style={[styles.flexRow, {flexWrap: 'wrap'}]}>
            {Array(6)
              .fill(0, 1)
              .map((_, data) => (
                <RatingComponents
                  count={data}
                  onPressStar={() => onPressStar(data)}
                  containerStyle={{
                    borderColor:
                      isSelect === data ? Colors.Primary : Colors.Borderline,
                  }}
                />
              ))}
          </View>

          <CButton
            title={String.applyFilters}
            type={'S16'}
            color={Colors.White}
            onPress={onPressApplyFilter}
            containerStyle={localStyle.btnStyle}
          />
        </View>
      </ScrollView>
    </ActionSheet>
  );
};

export default FilterModal;

const localStyle = StyleSheet.create({
  mainContainer: {
    height: '70%',
    borderTopLeftRadius: moderateScale(35),
    borderTopRightRadius: moderateScale(35),
  },
  modalMainContainer: {
    ...styles.mainContainerWhite,
    ...styles.ph15,
    borderRadius: moderateScale(35),
  },
  headerContainer: {
    ...styles.rowSpaceBetween,
    ...styles.m10,
  },

  starContainer: {
    height: moderateScale(30),
    width: moderateScale(30),
    ...styles.mb10,
  },
  btnStyle: {
    ...styles.mv20,
  },
  bookTypeStyle: {
    height: moderateScale(44),
    borderRadius: moderateScale(24),
  },
  reviewContainer: {
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(24),
    height: moderateScale(32),
    ...styles.ph20,
    ...styles.mr20,
    ...styles.mv5,
  },
});
