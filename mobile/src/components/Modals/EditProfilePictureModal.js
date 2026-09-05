import {StyleSheet, View, Modal} from 'react-native';
import React from 'react';

// custom import
import {Colors} from '../../Theme/Colors';
import {styles} from '../../Theme';
import {deviceWidth, moderateScale} from '../../common/constant';
import CText from '../common/CText';
import String from '../../i18n/String';
import {TouchableOpacity} from 'react-native';
import {CameraIcon, FileIcon, RemoveIcon} from '../../assets/svg';

export default function EditProfilePictureModal(props) {

  let {visible, onPressCamera, onPressGallery, onPressDeletePhoto} = props;

  const PhotoChoose = ({color, onPress, svgIcon, title}) => {
    return (
      <TouchableOpacity style={localStyle.boxStyle} onPress={onPress}>
        <View style={localStyle.innerViewContainer}>
          {svgIcon}
          <CText type={'B14'} color={color} style={styles.ml10}>
            {title}
          </CText>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal animationType="slide" visible={visible} transparent={true}>
      <View style={localStyle.modalMainContainer}>
        <View style={localStyle.modalContainer}>
          <CText type={'S20'} color={Colors.Black} align={'center'}>
            {String.changeYourPicture}
          </CText>
          <View style={localStyle.lineStyle} />
          <PhotoChoose
            svgIcon={<CameraIcon />}
            color={Colors.Black}
            title={String.takePhoto}
            onPress={onPressCamera}
          />
          <PhotoChoose
            svgIcon={<FileIcon />}
            color={Colors.Black}
            title={String.chooseFromYourFile}
            onPress={onPressGallery}
          />
          <PhotoChoose
            svgIcon={<RemoveIcon />}
            color={Colors.Red}
            title={String.deletePhoto}
            onPress={onPressDeletePhoto}
          />
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
    ...styles.pv20,
    ...styles.ph10,
    ...styles.center,
  },
  lineStyle: {
    width: '106%',
    backgroundColor: Colors.Borderline,
    height: moderateScale(1),
    ...styles.mv10,
  },
  boxStyle: {
    height: moderateScale(60),
    width: deviceWidth - moderateScale(80),
    backgroundColor: Colors.MessageContainerColor,
    borderRadius: moderateScale(8),
    ...styles.m10,
    ...styles.p20,
  },
  innerViewContainer: {
    ...styles.flexRow,
  },
});
