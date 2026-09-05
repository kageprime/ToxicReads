import {StyleSheet, TouchableOpacity, View, FlatList} from 'react-native';
import React, {useState} from 'react';
import Icons from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ActionSheet from 'react-native-actions-sheet';

// custom import
import {styles} from '../../Theme';
import {Colors} from '../../Theme/Colors';
import {moderateScale} from '../../common/constant';
import CText from '../common/CText';
import String from '../../i18n/String';
import {LanguageData} from '../../api/constant';

export default function SelectLanguageModal(props) {
  const [isSelect, setIsSelect] = useState('');

  let {SheetRef, selectedLanguage} = props;

  const closeSheet = () => {
    SheetRef.current?.hide();
  };

  const onPressSelectLanguage = item => {
    setIsSelect(item);
    selectedLanguage(item);
    SheetRef.current?.hide();
  };

  const RenderLanguageData = ({item, index}) => {
    return (
      <TouchableOpacity onPress={() => onPressSelectLanguage(item)}>
        <View
          style={[
            localStyle.mainViewContainer,
            {borderColor: isSelect == item ? Colors.Primary : Colors.secondary},
          ]}>
          <Icons
            name={isSelect === item ? 'check-circle' : 'circle-thin'}
            color={isSelect === item ? Colors.Primary : Colors.Gray30}
            size={moderateScale(24)}
          />
          <CText type={'M16'} color={Colors.Black} style={styles.ml20}>
            {item.name}
          </CText>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <ActionSheet ref={SheetRef} containerStyle={localStyle.mainContainer}>
      <View style={localStyle.mainContainer}>
        <View style={localStyle.container}>
          <TouchableOpacity
            onPress={closeSheet}
            style={localStyle.closeIconStyle}>
            <Ionicons
              color={Colors.Black}
              size={moderateScale(24)}
              name={'close'}
            />
          </TouchableOpacity>
          <CText
            type={'D18'}
            color={Colors.Black}
            align={'center'}
            style={styles.ml25}>
            {String.selectALanguage}
          </CText>
        </View>
        <FlatList
          data={LanguageData}
          renderItem={RenderLanguageData}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          vertical
        />
      </View>
    </ActionSheet>
  );
}

const localStyle = StyleSheet.create({
  mainContainer: {
    height: moderateScale(60),
    ...styles.flex,
    ...styles.pv24,
  },
  mainContainer: {
    borderTopLeftRadius: moderateScale(35),
    borderTopRightRadius: moderateScale(35),
    ...styles.mv10,
  },
  closeIconStyle: {
    backgroundColor: Colors.Gray30,
    ...styles.ml25,
    width: moderateScale(48),
    height: moderateScale(48),
    ...styles.center,
    borderRadius: moderateScale(25),
  },
  container: {
    ...styles.flexRow,
    ...styles.alignCenter,
    ...styles.mb20,
    ...styles.mt10,
  },
  mainViewContainer: {
    backgroundColor: Colors.secondary,
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(24),
    width: '90%',
    height: moderateScale(52),
    ...styles.selfCenter,
    ...styles.alignCenter,
    ...styles.flexRow,
    ...styles.m5,
    ...styles.pl10,
  },
});
