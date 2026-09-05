import {StyleSheet, View} from 'react-native';
import React, {useState} from 'react';

import {styles} from '../../Theme';
import CText from '../../components/common/CText';
import String from '../../i18n/String';
import {Colors} from '../../Theme/Colors';
import CTextInput from '../../components/common/CTextInput';
import BottomViewComponents from '../../components/Hometab/BottomViewComponents';
import CButton from '../../components/common/CButton';
import {AuthNav} from '../../Navigation/NavigationKeys';
import KeyboardAvoidingView from '../../components/common/KeyboardAvoidingView';
import {validateEmail} from '../../Utils/Validation';

export default function CreateAccountScreen(props) {
  let {navigation} = props;
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const onChangeEmailField = text => {
    const {msg} = validateEmail(text);
    setEmail(text);
    setErrorMsg(msg);
    return false;
  };

  const onPressContinue = () => {
    navigation.navigate(AuthNav.SignUpScreen);
  };

  const OnpressLogIn = () => {
    navigation.navigate(AuthNav.SignInScreen);
  };

  return (
    <View style={styles.mainContainerSurface}>
      <KeyboardAvoidingView contentContainerStyle={styles.flexGrow1}>
        <View style={styles.pv60}>
          <CText type={'D24'} align={'center'} color={Colors.Ink}>
            {String.createAccount}
          </CText>
          <CText
            type={'M14'}
            align={'center'}
            color={Colors.Ochre}
            style={styles.m10}>
            {String.signInPageText}
          </CText>
        </View>
        <View style={localStyle.mainContainerWithRadius}>
          <View style={styles.mv20}>
            <CTextInput
              label={String.email}
              value={email}
              onChangeText={onChangeEmailField}
              placeholder={String.enterEmailAddress}
              autoCapitalize={'none'}
              errorText={errorMsg}
              keyBoardType={'email-address'}
              maxLength={30}></CTextInput>
          </View>
          <View style={localStyle.BtnStyle}>
            <CButton
              onPress={onPressContinue}
              containerStyle={localStyle.ButtonStyle}>
              <CText type={'S16'} color={Colors.White} align={'center'}>
                {String.continueWithEmail}
              </CText>
            </CButton>
          </View>
          <BottomViewComponents
            AccountText={String.alreadyHaveAccount}
            onPress={OnpressLogIn}
            text={String.login}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
const localStyle = StyleSheet.create({
  mainContainerWithRadius: {
    ...styles.mainContainerWithRadius,
    ...styles.justifySpaceBetween,
  },
  BtnStyle: {
    ...styles.mt10,
  },
  ButtonStyle: {
    width: '90%',
    ...styles.selfCenter,
  },
});
