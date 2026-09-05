import {Modal, StyleSheet, View, TouchableOpacity} from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';

// custom import
import {styles} from '../../Theme';
import {Colors} from '../../Theme/Colors';
import {moderateScale} from '../../common/constant';

import CText from '../common/CText';
import String from '../../i18n/String';
import CButton from '../common/CButton';
import {AuthNav} from '../../Navigation/NavigationKeys';
import {useAuth} from '../../api/AuthContext';

export default function LogOutModal(props) {
  let {visible, onPressClose} = props;

  const navigation = useNavigation();
  const {logout} = useAuth();

  const onPressLogOut = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{name: AuthNav.SignInScreen}],
    });
  };

  return (
    <Modal animationType="slide" visible={visible} transparent={true}>
      <View style={localStyle.modalMainContainer}>
        <View style={localStyle.modalContainer}>
          <TouchableOpacity
            style={localStyle.closeBtnStyle}
            onPress={onPressClose}>
            <Ionicons name={'close'} size={moderateScale(24)} />
          </TouchableOpacity>
          <View style={styles.ph25}>
            <CText type={'S18'} color={Colors.Black} align={'center'}>
              {String.logoutText}
            </CText>
            <CButton
              title={String.cancel}
              color={Colors.White}
              type={'S14'}
              onPress={onPressClose}
              containerStyle={localStyle.btnStyle}
            />
            <TouchableOpacity onPress={onPressLogOut}>
              <CText
                type={'S14'}
                color={Colors.ErrorAlert}
                style={localStyle.textStyle}>
                {String.logOut}
              </CText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const localStyle = StyleSheet.create({
  modalMainContainer: {
    backgroundColor: Colors.ModalBackgroundColor,
    ...styles.flex,
    ...styles.center,
  },
  modalContainer: {
    backgroundColor: Colors.White,
    borderRadius: moderateScale(16),
    width: '85%',
    ...styles.pv20,
    ...styles.ph10,
    ...styles.center,
  },
  closeBtnStyle: {
    height: moderateScale(32),
    width: moderateScale(32),
    backgroundColor: Colors.secondary,
    ...styles.selfEnd,
    borderRadius: moderateScale(16),
    ...styles.center,
    ...styles.mr5,
  },
  btnStyle: {
    ...styles.mt25,
  },
  textStyle: {
    ...styles.selfCenter,
    ...styles.m20,
  },
});
