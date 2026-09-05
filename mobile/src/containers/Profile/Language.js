import {StyleSheet, View, SectionList, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

// custom import
import {styles} from '../../Theme';
import CHeader from '../../components/common/CHeader';
import String from '../../i18n/String';
import CText from '../../components/common/CText';
import {Colors} from '../../Theme/Colors';
import {moderateScale, deviceWidth} from '../../common/constant';
import {SuggestedLanguages} from '../../api/constant';

export default function Language() {
  const [isSelected, setIsSelected] = useState(false);

  const onPressLanguage = item => {
    setIsSelected(item);
  };

  const RenderSectionHeader = ({section: {title}}) => {
    return (
      <CText
        type={'S12'}
        color={Colors.Gray80}
        numberOfLines={1}
        style={styles.mt15}>
        {title}
      </CText>
    );
  };

  const RenderLanguages = ({item}) => {
    return (
      <View>
        <TouchableOpacity
          style={localStyle.innerViewContainer}
          onPress={() => onPressLanguage(item)}>
          <CText type={'M16'} color={Colors.Black}>
            {item.name}
          </CText>
          {isSelected === item ? (
            <Ionicons
              name={'checkmark-circle'}
              color={Colors.Primary}
              size={moderateScale(20)}
            />
          ) : null}
        </TouchableOpacity>
        {item.id === 9 ? null : <View style={localStyle.lineStyle} />}
      </View>
    );
  };
  return (
    <View style={styles.mainContainerWhite}>
      <CHeader title={String.language} />
      <View style={localStyle.mainContainer}>
        <SectionList
          sections={SuggestedLanguages}
          bounces={false}
          keyExtractor={(item, index) => item + index}
          renderItem={RenderLanguages}
          renderSectionHeader={RenderSectionHeader}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const localStyle = StyleSheet.create({
  mainContainer: {
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(12),
    borderColor: Colors.Gray30,
    ...styles.mt20,
    width: deviceWidth - moderateScale(40),
    ...styles.selfCenter,
    ...styles.ph10,
  },
  innerViewContainer: {
    ...styles.rowSpaceBetween,
    ...styles.p10,
    ...styles.m10,
  },

  lineStyle: {
    width: deviceWidth - moderateScale(80),
    borderColor: Colors.Gray30,
    borderWidth: moderateScale(1),
    ...styles.ph10,
    ...styles.selfCenter,
  },
});
