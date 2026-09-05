import {Image, Modal, StyleSheet, View} from 'react-native';
import React from 'react';

import images from '../../assets/images';
import {Colors} from '../../Theme/Colors';
import {styles} from '../../Theme';
import {moderateScale} from '../../common/constant';
import CText from '../common/CText';
import String from '../../i18n/String';
import CButton from '../common/CButton';

export default function LoginSuccessfullyModal(props) {
  let {visible, onPressClose} = props;

  return (
    <Modal animationType="slide" visible={visible} transparent={true}>
      <View style={localStyle.modalMainContainer}>
        <View style={localStyle.modalContainer}>
          <Image
            source={images.successfullyLoginImage}
            resizeMode={'contain'}
            style={localStyle.imageStyle}
          />
          <CText
            type={'D24'}
            color={Colors.Black}
            align={'center'}
            style={styles.m10}
            numberOfLines={2}>
            {String.successfullyLoginText}
          </CText>
          <CText
            type={'M14'}
            color={Colors.GrayScale}
            align={'center'}
            style={styles.mv10}
            numberOfLines={2}>
            {String.successfullyLoginPageText}
          </CText>
          <CButton
            onPress={onPressClose}
            containerStyle={localStyle.ButtonStyle}>
            <CText type={'S16'} align={'center'} color={Colors.White}>
              {' '}
              {String.continue}{' '}
            </CText>
          </CButton>
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
    width: '90%',
    ...styles.pv30,
    ...styles.ph25,
    ...styles.center,
  },
  imageStyle: {
    height: moderateScale(105),
    width: moderateScale(105),
    ...styles.mb30,
  },

  ButtonStyle: {
    width: '90%',
    ...styles.selfCenter,
    ...styles.m10,
  },
});
