import {View} from 'react-native';
import React, {useState} from 'react';

import CHeader from '../../components/common/CHeader';
import KeyboardAvoidingView from '../../components/common/KeyboardAvoidingView';
import CTextInput from '../../components/common/CTextInput';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import String from '../../i18n/String';
import {styles} from '../../Theme';
import {Colors} from '../../Theme/Colors';
import {StyleSheet} from 'react-native';
import {moderateScale} from '../../common/constant';
import {AuthNav} from '../../Navigation/NavigationKeys';
import {validPassword} from '../../Utils/Validation';

export default function CreatePasswordScreen(props) {
  let {navigation} = props;

  const [passWord, setPassWord] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordConfirmError, setPasswordConfirmError] = useState('');

  const OnChangePasswordField = text => {
    const {msg} = validPassword(text);
    setPassWord(text);
    setPasswordError(msg);
    return false;
  };

  const onChangeConfirmPassword = text => {
    setConfirmPassword(text);
    if (passWord !== text) {
      setPasswordConfirmError(String.bothPasswordAreNotSame);
    } else {
      setPasswordConfirmError('');
    }
  };

  const OnPressContinue = () => {
    navigation.navigate(AuthNav.SignInEmailScreen);
  };

  return (
    <View style={styles.mainContainerWhite}>
      <CHeader />
      <KeyboardAvoidingView contentContainerStyle={styles.flexGrow1}>
        <View style={styles.m20}>
          <CText type={'D24'} color={Colors.Black} align={'center'}>
            {String.createNewPassword}
          </CText>
          <CText type={'D24'} color={Colors.Black} align={'center'}>
            {' '}
            {String.newPassword}{' '}
          </CText>
          <CText
            type={'S14'}
            color={Colors.Gray70}
            align={'center'}
            style={styles.mv10}>
            {String.enterYourNewPassword}
          </CText>
        </View>
        <View style={styles.mv20}>
          <CTextInput
            label={String.newPassword}
            value={passWord}
            onChangeText={OnChangePasswordField}
            placeholder={String.enterYourPassword}
            maxLength={15}
            autoCapitalize={'none'}
            isSecure
            errorText={passwordError}
          />
          <CTextInput
            label={String.confirmPassword}
            value={confirmPassword}
            onChangeText={onChangeConfirmPassword}
            placeholder={String.enterYourPassword}
            maxLength={15}
            autoCapitalize={'none'}
            errorText={passwordConfirmError}
            isSecure
          />
        </View>
        <View style={localStyle.BtnStyle}>
          <CButton onPress={OnPressContinue}>
            <CText type={'S16'} color={Colors.White}>
              {String.continue}
            </CText>
          </CButton>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const localStyle = StyleSheet.create({
  BtnStyle: {
    ...styles.selfCenter,
    width: moderateScale(327),
  },
});
