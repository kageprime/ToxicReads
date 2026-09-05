import {StyleSheet, View} from 'react-native';
import React, {useState} from 'react';

// custom import
import {styles} from '../../Theme';
import CHeader from '../../components/common/CHeader';
import String from '../../i18n/String';
import KeyboardAvoidingView from '../../components/common/KeyboardAvoidingView';
import CText from '../../components/common/CText';
import {Colors} from '../../Theme/Colors';
import CTextInput from '../../components/common/CTextInput';
import {validPassword} from '../../Utils/Validation';
import CButton from '../../components/common/CButton';

export default function ChangePassword({navigation}) {
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

  const onPressSubmit = () => {
    navigation.goBack();
  };
  return (
    <View style={styles.mainContainerWhite}>
      <CHeader title={String.changePassword} />
      <KeyboardAvoidingView>
        <View style={localStyle.mainContainer}>
          <CText type={'M18'} color={Colors.Black} style={styles.mt20}>
            {String.passwordString}
          </CText>
          <CTextInput
            label={String.passWord}
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
      </KeyboardAvoidingView>
      <CButton
        title={String.submit}
        color={Colors.White}
        type={'S16'}
        onPress={onPressSubmit}
        containerStyle={localStyle.btnStyle}
      />
    </View>
  );
}

const localStyle = StyleSheet.create({
  mainContainer: {
    ...styles.center,
    ...styles.ph20,
  },
  btnStyle: {
    width: '90%',
    ...styles.selfCenter,
    ...styles.mb10
  },
});
