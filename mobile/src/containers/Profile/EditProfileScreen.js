import {
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  View,
  FlatList,
} from 'react-native';
import React, {useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import ImagePicker from 'react-native-image-crop-picker';

// custom import
import {styles} from '../../Theme';
import CHeader from '../../components/common/CHeader';
import String from '../../i18n/String';
import images from '../../assets/images';
import {deviceWidth, moderateScale} from '../../common/constant';
import KeyboardAvoidingView from '../../components/common/KeyboardAvoidingView';
import {Colors} from '../../Theme/Colors';
import {validName, validateEmail} from '../../Utils/Validation';
import {DatePickerIcon, EditProfileIcon} from '../../assets/svg';
import CTextInput from '../../components/common/CTextInput';
import CText from '../../components/common/CText';
import {GenderDataArr} from '../../api/constant';
import CButton from '../../components/common/CButton';
import EditProfilePictureModal from '../../components/Modals/EditProfilePictureModal';
import {TabNav} from '../../Navigation/NavigationKeys';

export default function EditProfileScreen({navigation}) {
  const [firstName, setFirstName] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [email, setEmail] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [lastName, setLastName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSelected, setIsSelected] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectImage, setSelectImage] = useState(null);
  const [location, setLocation] = useState('');

  const onPressEditIcon = () => {
    setIsModalVisible(!isModalVisible);
  };

  const onPressCamera = () => {
    ImagePicker.openCamera({
      mediaType: 'photo',
      includeBase64: true,
    }).then(image => {
      setSelectImage(image.path);
      setIsModalVisible(false);
    });
  };

  const onPressGallery = () => {
    ImagePicker.openPicker({
      mediaType: 'photo',
      includeBase64: true,
    }).then(images => {
      setSelectImage(images.path);
      setIsModalVisible(false);
    });
  };

  const deleteProfileImage = () => {
    setSelectImage(null);
    setIsModalVisible(false);
  };

  const onChangeName = text => {
    const {msg} = validName(text);
    setFirstName(text);
    setFirstNameError(msg);
    return false;
  };
  const onChangeLastName = text => {
    const {msg} = validName(text);
    setLastName(text);
    setLastNameError(msg);
    return false;
  };
  const onChangeEmailField = text => {
    const {msg} = validateEmail(text);
    setEmail(text);
    setErrorMsg(msg);
    return false;
  };

  const onChangeLocationField = text => {
    setLocation(text);
  };
  const onPressGender = item => {
    setIsSelected(item.id);
  };
  const genderData = ({item}) => {
    return (
      <TouchableOpacity
        style={localStyle.genderContainer}
        onPress={() => onPressGender(item)}>
        {isSelected === item.id ? (
          <Ionicons
            name={'checkmark-circle'}
            color={Colors.Primary}
            size={moderateScale(24)}
            style={localStyle.selectGenderStyle}
          />
        ) : (
          <Ionicons
            name={'radio-button-off'}
            color={Colors.Gray30}
            size={moderateScale(24)}
            style={localStyle.selectGenderStyle}
          />
        )}
        <CText type={'S16'} color={Colors.Black} align={'center'}>
          {item.name}
        </CText>
      </TouchableOpacity>
    );
  };
  const RightIcons = () => {
    return (
      <TouchableOpacity onPress={showDatePicker}>
        <DatePickerIcon />
      </TouchableOpacity>
    );
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = date => {
    var expiryDate = date.toISOString().split('T')[0];
    const day = expiryDate.split('-')[2];
    const month = expiryDate.split('-')[1];
    const year = expiryDate.split('-')[0];
    setSelectedDate(day + '/' + month + '/' + year);

    hideDatePicker();
  };
  const onPressSave = () => {
    navigation.navigate(TabNav.ProfileTab);
  };
  return (
    <View style={styles.flex}>
      <CHeader title={String.profile} />
      <KeyboardAvoidingView containerStyle={localStyle.mainContainer}>
        <ImageBackground
          source={selectImage ? {uri: selectImage} : images.profileImage}
          imageStyle={{borderRadius: moderateScale(100)}}
          style={localStyle.profileImageStyle}>
          <TouchableOpacity
            style={localStyle.editProfileIconStyle}
            onPress={onPressEditIcon}>
            <EditProfileIcon />
          </TouchableOpacity>
        </ImageBackground>
        <CTextInput
          label={String.firstName}
          value={firstName}
          onChangeText={onChangeName}
          placeholder={String.enterYourName}
          maxLength={30}
          autoCapitalize={'none'}
          errorText={firstNameError}
          containerStyle={localStyle.containerStyle}
        />
        <CTextInput
          label={String.lastName}
          value={lastName}
          onChangeText={onChangeLastName}
          placeholder={String.enterYourName}
          maxLength={30}
          autoCapitalize={'none'}
          errorText={lastNameError}
          containerStyle={localStyle.containerStyle}
        />
        <CTextInput
          label={String.email}
          value={email}
          onChangeText={onChangeEmailField}
          placeholder={String.enterEmailAddress}
          keyBoardType={'email-address'}
          maxLength={30}
          autoCapitalize={'none'}
          errorText={errorMsg}
          containerStyle={localStyle.containerStyle}
        />
        <View>
          <CText
            type={'M14'}
            color={Colors.Gray70}
            style={localStyle.labelContainer}>
            {String.dateOfBirth}
          </CText>
          <TouchableOpacity
            style={localStyle.datePikerStyle}
            onPress={showDatePicker}>
            <View style={localStyle.innerContainerStyle}>
              <CText
                type={'M16'}
                color={selectedDate ? Colors.Black : Colors.Gray60}
                style={styles.ml5}>
                {selectedDate ? selectedDate : String.dateOfBirth}
              </CText>
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onCancel={hideDatePicker}
                onConfirm={handleConfirm}
                date={new Date()}
                maximumDate={new Date()}
              />
              <RightIcons />
            </View>
          </TouchableOpacity>
        </View>

        <View style={localStyle.labelContainer}>
          <CText type={'M14'} color={Colors.Gray70}>
            {String.gender}
          </CText>

          <FlatList
            data={GenderDataArr}
            renderItem={genderData}
            horizontal
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
        <CTextInput
          label={String.location}
          value={location}
          onChangeText={onChangeLocationField}
          placeholder={String.locationText}
          autoCapitalize={'none'}
          multiline={true}
          containerStyle={localStyle.locationContainer}
          inputBoxStyle={{bottom: moderateScale(10)}}
        />

        <CButton
          title={String.saveChanges}
          containerStyle={localStyle.btnStyle}
          type={'S16'}
          color={Colors.Gray60}
          onPress={onPressSave}
        />
      </KeyboardAvoidingView>
      <EditProfilePictureModal
        visible={isModalVisible}
        onPressCamera={onPressCamera}
        onPressGallery={onPressGallery}
        onPressDeletePhoto={deleteProfileImage}
      />
    </View>
  );
}

const localStyle = StyleSheet.create({
  mainContainer: {
    ...styles.mainContainerWhite,
  },
  profileImageStyle: {
    height: moderateScale(105),
    width: moderateScale(105),
    ...styles.selfCenter,
  },
  editProfileIconStyle: {
    backgroundColor: Colors.Primary,
    height: moderateScale(32),
    width: moderateScale(32),
    position: 'absolute',
    borderWidth: moderateScale(3),
    borderColor: Colors.White,
    borderRadius: moderateScale(24),
    left: moderateScale(75),
    top: moderateScale(70),
    ...styles.center,
  },
  containerStyle: {
    borderColor: Colors.Primary,
    backgroundColor: Colors.White,
  },
  genderContainer: {
    width: deviceWidth / 2.4,
    height: moderateScale(48),
    borderColor: Colors.Primary,
    borderRadius: moderateScale(24),
    borderWidth: moderateScale(1),
    ...styles.flexRow,
    ...styles.mt5,
    ...styles.center,
    ...styles.mr10,
    ...styles.justifyStart,
  },
  labelContainer: {
    ...styles.ml25,
    ...styles.mt10,
  },
  selectGenderStyle: {
    ...styles.mr10,
    ...styles.ml15,
  },
  locationContainer: {
    width: '90%',
    backgroundColor: Colors.White,
    height: moderateScale(132),
    borderColor: Colors.Primary,
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(24),
    ...styles.mt5,
    ...styles.selfCenter,
    ...styles.mh0,
  },
  btnStyle: {
    backgroundColor: Colors.secondary,
    height: moderateScale(56),
    width: '90%',
    ...styles.selfCenter,
    ...styles.mt40,
    ...styles.mb10,
  },
  datePikerStyle: {
    borderColor: Colors.Primary,
    backgroundColor: Colors.White,
    width: '87%',
    borderWidth: moderateScale(1),
    ...styles.selfCenter,
    borderRadius: moderateScale(25),
    height: moderateScale(52),
    ...styles.mt5,
  },
  innerContainerStyle: {
    ...styles.rowSpaceBetween,
    ...styles.flex,
    ...styles.ph10,
  },
});
