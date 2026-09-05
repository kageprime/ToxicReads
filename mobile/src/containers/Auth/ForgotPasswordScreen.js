import {View, StyleSheet} from 'react-native';
import React, {useState} from 'react';

// Custom imports
import {styles} from '../../Theme';
import CHeader from '../../components/common/CHeader';
import KeyboardAvoidingView from '../../components/common/KeyboardAvoidingView';
import CText from '../../components/common/CText';
import {Colors} from '../../Theme/Colors';
import String from '../../i18n/String';
import CTextInput from '../../components/common/CTextInput';
import {moderateScale} from '../../common/constant';
import CButton from '../../components/common/CButton';
import {AuthNav} from '../../Navigation/NavigationKeys';
import {validateEmail} from '../../Utils/Validation';

export default function ForgotPasswordScreen({navigation}) {
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const onChangeEmailField = text => {
    const {msg} = validateEmail(text);
    setEmail(text);
    setErrorMsg(msg);
    return false;
  };
  const OnPressContinue = () => {
    navigation.navigate(AuthNav.CreatePasswordScreen);
  };

  return (
    <View style={styles.mainContainerWhite}>
      <CHeader />
      <KeyboardAvoidingView contentContainerStyle={styles.flexGrow1}>
        <View style={styles.m20}>
          <CText type={'D24'} align={'center'} color={Colors.Black}>
            {String.forgotPassWord}
          </CText>
          <CText
            type={'S14'}
            align={'center'}
            color={Colors.Gray70}
            style={styles.mv10}>
            {String.recoverYourAccountPassword}
          </CText>
        </View>
        <CTextInput
          label={String.email}
          value={email}
          onChangeText={onChangeEmailField}
          placeholder={String.enterYourEmail}
          keyBoardType={'email-address'}
          maxLength={30}
          autoCapitalize={'none'}
          errorText={errorMsg}></CTextInput>
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
    ...styles.mv40,
  },
});
