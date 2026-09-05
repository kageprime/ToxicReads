import {View, StyleSheet} from 'react-native';
import React, {useState} from 'react';

//custom imports
import {Colors} from '../../Theme/Colors';
import CText from '../../components/common/CText';
import String from '../../i18n/String';
import {styles} from '../../Theme';
import CTextInput from '../../components/common/CTextInput';
import CButton from '../../components/common/CButton';
import {AuthNav} from '../../Navigation/NavigationKeys';
import BottomViewComponents from '../../components/Hometab/BottomViewComponents';
import {validateEmail} from '../../Utils/Validation';
import KeyboardAvoidingView from '../../components/common/KeyboardAvoidingView';

export default function SignInScreen({navigation}) {
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const onChangeEmailField = text => {
    const {msg} = validateEmail(text);
    setEmail(text);
    setErrorMsg(msg);
    return false;
  };

  const onPressContinue = () => {
    navigation.navigate(AuthNav.SignInEmailScreen);
  };

  const onPressSignUp = () => {
    navigation.navigate(AuthNav.CreateAccountScreen);
  };

  return (
    <View style={styles.mainContainerSurface}>
      <KeyboardAvoidingView contentContainerStyle={styles.flexGrow1}>
        <View style={styles.pv60}>
          <CText type={'D24'} align={'center'} color={Colors.Ink}>
            {String.welComeText}
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
          <View>
            <CTextInput
              label={String.email}
              value={email}
              onChangeText={onChangeEmailField}
              placeholder={String.enterEmailAddress}
              keyBoardType={'email-address'}
              maxLength={30}
              autoCapitalize={'none'}
              errorText={errorMsg}
            />

            <View style={localStyle.BtnStyle}>
              <CButton
                onPress={onPressContinue}
                containerStyle={localStyle.ButtonStyle}>
                <CText type={'S16'} color={Colors.White} align={'center'}>
                  {String.continueWithEmail}
                </CText>
              </CButton>
            </View>
          </View>
          <BottomViewComponents
            AccountText={String.dontHaveAccount}
            text={String.signUp}
            onPress={onPressSignUp}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const localStyle = StyleSheet.create({
  BtnStyle: {
    ...styles.mt20,
  },
  ButtonStyle: {
    width: '90%',
    ...styles.selfCenter,
  },
  mainContainerWithRadius: {
    ...styles.mainContainerWithRadius,
    ...styles.justifySpaceBetween,
  },
});
