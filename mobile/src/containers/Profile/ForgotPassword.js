import {StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import Icons from 'react-native-vector-icons/MaterialIcons';

// custom import
import {styles} from '../../Theme';
import CHeader from '../../components/common/CHeader';
import String from '../../i18n/String';
import {deviceWidth, moderateScale} from '../../common/constant';
import {Colors} from '../../Theme/Colors';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import KeyboardAvoidingView from '../../components/common/KeyboardAvoidingView';
import CTextInput from '../../components/common/CTextInput';
import {validateEmail} from '../../Utils/Validation';

export default function ForgotPassword({navigation}) {
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const onChangeEmailField = text => {
    const {msg} = validateEmail(text);
    setEmail(text);
    setErrorMsg(msg);
    return false;
  };
  const onPressSubmit = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.mainContainerWhite}>
      <CHeader title={String.forgotPassWord} />
      <KeyboardAvoidingView>
        <View style={localStyle.mainContainer}>
          <View style={localStyle.boxStyle}>
            <Icons
              name={'info'}
              color={Colors.Gray60}
              size={moderateScale(24)}
              style={styles.ph5}
            />
            <CText
              type={'S12'}
              color={Colors.Black}
              style={localStyle.textStyle}
              numberOfLines={2}>
              {String.forgotPassWordString}
            </CText>
          </View>
          <CTextInput
            label={String.email}
            value={email}
            onChangeText={onChangeEmailField}
            placeholder={String.enterEmailAddress}
            keyBoardType={'email-address'}
            maxLength={30}
            autoCapitalize={'none'}
            errorText={errorMsg}
            labelStyle={styles.mt10}
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
    ...styles.ph20,
    ...styles.center,
  },
  boxStyle: {
    height: moderateScale(88),
    borderRadius: moderateScale(8),
    backgroundColor: Colors.Gray20,
    width: deviceWidth - moderateScale(40),
    ...styles.mt20,
    ...styles.flexRow,
    ...styles.ph10,
    ...styles.center,
  },

  textStyle: {
    lineHeight: moderateScale(20),
    ...styles.flex,
  },
  btnStyle: {
    width: '90%',
    ...styles.selfCenter,
    ...styles.mb10,
  },
});
