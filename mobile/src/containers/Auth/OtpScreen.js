import {View, StyleSheet, Alert, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import OTPInputView from '@twotalltotems/react-native-otp-input';

//custom Import
import {styles} from '../../Theme';
import CHeader from '../../components/common/CHeader';
import KeyboardAvoidingView from '../../components/common/KeyboardAvoidingView';
import CText from '../../components/common/CText';
import {Colors} from '../../Theme/Colors';
import String from '../../i18n/String';
import CButton from '../../components/common/CButton';
import {moderateScale} from '../../common/constant';
import {AuthNav} from '../../Navigation/NavigationKeys';
import typography from '../../Theme/Typography';
import LoginSuccessfullyModal from '../../components/Modals/LoginSuccessfullyModal';

export default function OtpScreen(props) {
  let {navigation} = props;

  const [otp, setOtp] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const onPressContinue = () => {
    setIsModalVisible(true);
  };
  const onOtpChange = text => setOtp(text);

  const onPressResendCode = () => {
    alert('Otp Resend');
  };

  const onpressCloseModal = () => {
    setIsModalVisible(false);
    navigation.navigate(AuthNav.SelectLanguageScreen);
  };

  return (
    <View style={styles.mainContainerWhite}>
      <CHeader />
      <KeyboardAvoidingView contentContainerStyle={styles.flexGrow1}>
        <CText type={'D24'} align={'center'} color={Colors.Black}>
          {String.enterOtp}
        </CText>
        <CText
          type={'M14'}
          align={'center'}
          color={Colors.GrayScale}
          style={styles.mt15}>
          {String.otpPageText}
        </CText>
        <CText type={'M14'} align={'center'} color={Colors.GrayScale}>
          {String.email}
          <CText>{String.emailExample}</CText>
        </CText>

        <OTPInputView
          pinCount={4}
          style={localStyle.otpInputViewStyle}
          code={otp}
          onCodeChanged={onOtpChange}
          autoFocusOnLoad={false}
          codeInputFieldStyle={localStyle.underlineStyleBase}
          codeInputHighlightStyle={localStyle.underlineStyleHighLighted}
        />
        <View style={localStyle.BtnStyle}>
          <CButton onPress={onPressContinue}>
            <CText type={'S16'} color={Colors.White}>
              {String.continue}
            </CText>
          </CButton>
        </View>
        <View style={styles.rowCenter}>
          <CText type={'S16'} color={Colors.GrayScale} align={'center'}>
            {' '}
            {String.didNotHaveReceiveCode}
          </CText>
          <TouchableOpacity onPress={onPressResendCode}>
            <CText type={'S16'} color={Colors.Primary} align={'center'}>
              {' '}
              {String.resendCode}{' '}
            </CText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <LoginSuccessfullyModal
        visible={isModalVisible}
        onPressClose={onpressCloseModal}
      />
    </View>
  );
}
const localStyle = StyleSheet.create({
  BtnStyle: {
    ...styles.selfCenter,
    width: moderateScale(327),
    ...styles.mb40,
  },
  otpInputStyle: {
    height: moderateScale(50),
    ...styles.selfCenter,
    ...styles.mt20,
  },
  underlineStyleBase: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(20),
    borderColor: Colors.Primary,
    color: Colors.Black,
    ...typography.fontWeights.Bold,
    ...typography.fontSize.f24,
  },
  underlineStyleHighLighted: {
    borderColor: Colors.Primary,
  },
  otpInputViewStyle: {
    ...styles.selfCenter,
    width: '80%',
    height: '20%',
  },
});
