import {StyleSheet, TouchableOpacity, View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, {useRef, useState} from 'react';

import KeyboardAvoidingView from '../../components/common/KeyboardAvoidingView';
import {styles} from '../../Theme';
import CText from '../../components/common/CText';
import {Colors} from '../../Theme/Colors';
import String from '../../i18n/String';
import {moderateScale} from '../../common/constant';
import CButton from '../../components/common/CButton';
import {StackNav} from '../../Navigation/NavigationKeys';
import SelectLanguageModal from '../../components/Modals/SelectLanguageModal';

export default function SelectLanguageScreen(props) {
  const [language, setLanguage] = useState('');
  let {navigation} = props;
  const SheetRef = useRef(null);

  const onPressSelect = () => SheetRef.current?.show();
  const onPressContinue = () => {
    navigation.reset({
      index: 0,
      routes: [{name: StackNav.TabNavigation}],
    });
  };

  const selectedLanguage = itm => {
    setLanguage(itm);
  };

  return (
    <View style={styles.mainContainerWhite}>
      <KeyboardAvoidingView contentContainerStyle={styles.flexGrow1}>
        <View style={localStyle.mainContainer}>
          <CText type={'D24'} align={'center'} color={Colors.Black}>
            {String.selectLanguage}
          </CText>
          <CText
            type={'M14'}
            align={'center'}
            color={Colors.GrayScale}
            numberOfLines={2}
            style={styles.pv10}>
            {String.successfullyLoginPageText}
          </CText>
        </View>
        <View style={styles.mt30}>
          <CText type={'M14'} color={Colors.Gray70} style={styles.ml25}>
            {String.language}
          </CText>
          <TouchableOpacity onPress={onPressSelect}>
            {!!language ? (
              <View style={localStyle.container}>
                <CText type={'M16'} color={Colors.Black} style={styles.m10}>
                  {language?.name}
                </CText>
                <Ionicons
                  name="chevron-down-outline"
                  size={moderateScale(24)}
                  color={Colors.Gray60}
                  style={styles.mr10}></Ionicons>
              </View>
            ) : (
              <View style={localStyle.container}>
                <CText type={'M16'} color={Colors.Gray60} style={styles.m10}>
                  {String.select}
                </CText>
                <Ionicons
                  name="chevron-down-outline"
                  size={moderateScale(24)}
                  color={Colors.Gray60}
                  style={styles.mr10}></Ionicons>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <View style={localStyle.bottomBtnStyle}>
          <CButton
            onPress={onPressContinue}
            containerStyle={localStyle.ButtonStyle}>
            <CText type={'S16'} align={'center'} color={Colors.White}>
              {String.continue}
            </CText>
          </CButton>
        </View>
        <SelectLanguageModal
          SheetRef={SheetRef}
          selectedLanguage={selectedLanguage}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const localStyle = StyleSheet.create({
  mainContainer: {
    ...styles.mh30,
    ...styles.mt20,
  },
  container: {
    backgroundColor: Colors.secondary,
    borderRadius: moderateScale(24),
    width: '90%',
    height: moderateScale(52),
    ...styles.selfCenter,
    ...styles.mt10,
    ...styles.rowSpaceBetween,
  },
  bottomBtnStyle: {
    ...styles.justifyEnd,
    ...styles.flex,
  },
  ButtonStyle: {
    width: '90%',
    ...styles.selfCenter,
    ...styles.mb25,
  },
});
