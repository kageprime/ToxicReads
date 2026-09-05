import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

//custom imports
import {styles} from '../../Theme';
import KeyboardAvoidingView from '../../components/common/KeyboardAvoidingView';
import CHeader from '../../components/common/CHeader';
import String from '../../i18n/String';
import {Colors} from '../../Theme/Colors';
import {moderateScale} from '../../common/constant';
import CText from '../../components/common/CText';
import CTextInput from '../../components/common/CTextInput';
import CButton from '../../components/common/CButton';
import {AuthNav, StackNav} from '../../Navigation/NavigationKeys';
import BottomViewComponents from '../../components/Hometab/BottomViewComponents';
import {useAuth} from '../../api/AuthContext';

export default function SignInEmailScreen(props) {
  const {navigation} = props;
  const {login} = useAuth();

  const [username, setUsername] = useState('');
  const [passWord, setPassWord] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const onChangeUsernameField = text => {
    setUsername(text);
    if (errorMsg) setErrorMsg('');
  };

  const OnChangePassword = text => {
    setPassWord(text);
  };

  const OnPressRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  const onPressSignInButton = async () => {
    if (busy) return;
    if (!username.trim() || !passWord) {
      setErrorMsg('Enter your username and password');
      return;
    }
    setBusy(true);
    setErrorMsg('');
    try {
      await login(username.trim(), passWord);
      navigation.reset({
        index: 0,
        routes: [{name: StackNav.TabNavigation}],
      });
    } catch (e) {
      setErrorMsg(e?.message || 'Sign in failed. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const onPressForgotPassword = () => {
    navigation.navigate(AuthNav.ForgotPasswordScreen);
  };

  const onPressSignUp = () => {
    navigation.navigate(AuthNav.CreateAccountScreen);
  };

  return (
    <View style={styles.mainContainerWhite}>
      <CHeader title={String.signIn}></CHeader>
      <KeyboardAvoidingView contentContainerStyle={styles.flexGrow1}>
        <CTextInput
          label={'Username'}
          value={username}
          onChangeText={onChangeUsernameField}
          placeholder={'Enter your username'}
          maxLength={100}
          autoCapitalize={'none'}
          errorText={errorMsg}
        />

        <CTextInput
          label={String.passWord}
          value={passWord}
          onChangeText={OnChangePassword}
          placeholder={String.enterYourPassword}
          maxLength={100}
          isSecure
        />

        <View style={[styles.rowSpaceBetween, styles.mt15]}>
          <View style={styles.rowSpaceAround}>
            <TouchableOpacity onPress={OnPressRememberMe}>
              <Ionicons
                name={!!rememberMe ? 'radio-button-on' : 'radio-button-off'}
                color={!!rememberMe ? Colors.Primary : Colors.Gray30}
                size={moderateScale(24)}
                style={styles.ml25}></Ionicons>
            </TouchableOpacity>
            <CText type={'S14'} color={Colors.Gray70} align={'center'}>
              {String.rememberMe}{' '}
            </CText>
          </View>
          <TouchableOpacity onPress={onPressForgotPassword}>
            <CText
              type={'S14'}
              color={Colors.ErrorAlert}
              align={'center'}
              style={styles.mr20}>
              {' '}
              {String.forgotPassWord}{' '}
            </CText>
          </TouchableOpacity>
        </View>
        <View style={localStyle.BtnStyle}>
          <CButton
            onPress={onPressSignInButton}
            containerStyle={localStyle.ButtonStyle}>
            <CText type={'S16'} color={Colors.White} align={'center'}>
              {String.signIn}
            </CText>
          </CButton>
        </View>
        <BottomViewComponents
          AccountText={String.dontHaveAccount}
          text={String.signUp}
          onPress={onPressSignUp}
          containerStyle={[styles.flex0, styles.mt20]}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const localStyle = StyleSheet.create({
  BtnStyle: {
    ...styles.mt30,
  },
  ButtonStyle: {
    width: '90%',
    ...styles.selfCenter,
  },
});
