import {View, StyleSheet, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';

//custom imports
import {styles} from '../../Theme';
import CTextInput from '../../components/common/CTextInput';
import CHeader from '../../components/common/CHeader';
import String from '../../i18n/String';
import KeyboardAvoidingView from '../../components/common/KeyboardAvoidingView';
import CText from '../../components/common/CText';
import {Colors} from '../../Theme/Colors';
import {AuthNav, StackNav} from '../../Navigation/NavigationKeys';
import CButton from '../../components/common/CButton';
import {useAuth} from '../../api/AuthContext';

export default function SignUpScreen(props) {
  let {navigation} = props;
  const {register} = useAuth();

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [passWord, setPassWord] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [passwordConfirmError, setPasswordConfirmError] = useState('');
  const [busy, setBusy] = useState(false);

  const onChangeConfirmPassword = text => {
    setConfirmPassword(text);
    if (passWord !== text) {
      setPasswordConfirmError(String.bothPasswordAreNotSame);
    } else {
      setPasswordConfirmError('');
    }
  };

  const OnPressSignUp = async () => {
    if (busy) return;
    if (username.trim().length < 3) {
      setFormError('Username needs at least 3 characters');
      return;
    }
    if (passWord.length < 6) {
      setFormError('Password needs at least 6 characters');
      return;
    }
    if (passWord !== confirmPassword) {
      setFormError(String.bothPasswordAreNotSame);
      return;
    }
    setBusy(true);
    setFormError('');
    try {
      await register(
        username.trim(),
        passWord,
        displayName.trim() || undefined,
      );
      navigation.reset({
        index: 0,
        routes: [{name: StackNav.TabNavigation}],
      });
    } catch (e) {
      setFormError(e?.message || 'Sign up failed. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const onPressLogin = () => {
    navigation.navigate(AuthNav.SignInScreen);
  };

  return (
    <View style={styles.mainContainerWhite}>
      <CHeader title={String.signUp}></CHeader>
      <KeyboardAvoidingView contentContainerStyle={styles.flexGrow1}>
        <View style={styles.mv10}>
          <CText type={'D24'} color={Colors.Black} align={'center'}>
            {String.completeYourAccount}
          </CText>
        </View>
        <View>
          <CTextInput
            label={'Username'}
            value={username}
            onChangeText={setUsername}
            placeholder={'Pick a username'}
            maxLength={100}
            autoCapitalize={'none'}
          />
          <CTextInput
            label={'Display name (optional)'}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder={String.enterYourName}
            maxLength={100}
          />

          <CTextInput
            label={String.passWord}
            value={passWord}
            onChangeText={setPassWord}
            placeholder={String.enterYourPassword}
            maxLength={100}
            isSecure
          />
          <CTextInput
            label={String.confirmPassword}
            value={confirmPassword}
            onChangeText={onChangeConfirmPassword}
            placeholder={String.enterYourPassword}
            maxLength={100}
            autoCapitalize={'none'}
            errorText={passwordConfirmError}
            isSecure></CTextInput>
        </View>
        {formError ? (
          <CText type={'M14'} color={Colors.ErrorAlert} align={'center'}>
            {formError}
          </CText>
        ) : null}
        <View style={localStyle.BtnStyle}>
          <CButton
            onPress={OnPressSignUp}
            containerStyle={localStyle.ButtonStyle}>
            <CText type={'S16'} color={Colors.White} align={'center'}>
              {String.signUp}
            </CText>
          </CButton>
        </View>
        <View style={localStyle.lastViewStyle}>
          <CText type={'S16'} align={'center'} color={Colors.GrayScale}>
            {' '}
            {String.alreadyHaveAccount}
          </CText>
          <TouchableOpacity onPress={onPressLogin}>
            <CText type={'S16'} align={'center'} color={Colors.Primary}>
              {' '}
              {String.login}{' '}
            </CText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const localStyle = StyleSheet.create({
  lastViewStyle: {
    ...styles.rowCenter,
    ...styles.mv10,
  },
  BtnStyle: {
    ...styles.mt20,
  },
  ButtonStyle: {
    width: '90%',
    ...styles.selfCenter,
  },
});
