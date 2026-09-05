import {StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {TouchableOpacity} from 'react-native-gesture-handler';

// custom import
import CHeader from '../../components/common/CHeader';
import {styles} from '../../Theme';
import String from '../../i18n/String';
import CTextInput from '../../components/common/CTextInput';
import {deviceWidth, moderateScale} from '../../common/constant';
import CButton from '../../components/common/CButton';
import {Colors} from '../../Theme/Colors';
import KeyboardAvoidingView from '../../components/common/KeyboardAvoidingView';
import {
  validName,
  validateCardNumber,
  validateCvv,
} from '../../Utils/Validation';
import CText from '../../components/common/CText';

export default function AddNewCard({navigation}) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardHolderName1, setCardHolderName1] = useState('');
  const [expired, setExpired] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardNumberError, setCardNumberError] = useState('');
  const [cardHolderNameError, setCardHolderNameError] = useState('');
  const [cardHolderNameError1, setCardHolderNameError1] = useState('');
  const [expiredError, setExpiredError] = useState('');
  const [cvvError, setCvvError] = useState('');
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const onChangeCardNumber = text => {
    const {msg} = validateCardNumber(text);
    setCardNumber(text);
    setCardNumberError(msg);
    return false;
  };
  const onChangeCardHolderName = text => {
    const {msg} = validName(text);
    setCardHolderName(text);
    setCardHolderNameError(msg);
    return false;
  };
  const onChangeCardName = text => {
    const {msg} = validName(text);
    setCardHolderName1(text);
    setCardHolderNameError1(msg);
    return false;
  };

  const onChangeCvv = text => {
    const {msg} = validateCvv(text);
    setCvv(text);
    setCvvError(msg);
    return false;
  };

  const hideDatePicker = () => setDatePickerVisible(false);

  const handleConfirm = date => {
    var expiryDate = date.toISOString().split('T')[0];
    const month = expiryDate.split('-')[1];
    const year = expiryDate.split('-')[0];
    setExpired(month + '/' + year);
    console.log(setExpired(month + '/' + year));
    hideDatePicker();
  };

  const onPressCalender = () => setDatePickerVisible(true);

  const onPressAddNewCard = () => {
    navigation.goBack();
  };
  
  return (
    <View style={styles.mainContainerWhite}>
      <CHeader title={String.addNewCard} />
      <KeyboardAvoidingView containerStyle={styles.flexGrow1}>
        <CTextInput
          label={String.cardNumber}
          value={cardNumber}
          onChangeText={onChangeCardNumber}
          placeholder={String.enterCardNumber}
          maxLength={16}
          autoCapitalize={'none'}
          errorText={cardNumberError}
          keyboardType="number-pad"
          color={Colors.Black}
        />
        <CTextInput
          label={String.cardHolderName}
          value={cardHolderName}
          onChangeText={onChangeCardHolderName}
          placeholder={String.enterHolderName}
          color={Colors.Black}
          errorText={cardHolderNameError}
          autoCapitalize={'none'}
        />
        <CTextInput
          label={String.cardHolderName}
          value={cardHolderName1}
          onChangeText={onChangeCardName}
          placeholder={String.enterHolderName}
          errorText={cardHolderNameError1}
          color={Colors.Black}
          autoCapitalize={'none'}
        />
        <View style={[styles.justifySpaceBetween, styles.flexRow]}>
          <View style={localStyle.mainContainer}>
            <CText type={'M14'} color={Colors.Black} style={styles.ml5}>
              {String.expired}
            </CText>
            <TouchableOpacity
              style={localStyle.datePikerStyle}
              onPress={onPressCalender}>
              <CText
                type={'M16'}
                color={expired ? Colors.Black : Colors.Gray60}
                style={styles.ml15}>
                {expired ? expired : String.expiredFormat}
              </CText>
              <DateTimePickerModal
                isVisible={datePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
                date={new Date()}
                minimumDate={new Date()}
              />
            </TouchableOpacity>
          </View>
          <CTextInput
            label={String.cvvCode}
            value={cvv}
            onChangeText={onChangeCvv}
            placeholder={String.cvv}
            containerStyle={localStyle.cvvTextInputStyle}
            keyboardType="number-pad"
            maxLength={3}
            errorText={cvvError}
            secureTextEntry={true}
            color={Colors.Black}
            labelStyle={{marginLeft: 0}}
          />
        </View>
      </KeyboardAvoidingView>
      <CButton
        title={String.addCard}
        type={'S16'}
        color={Colors.Gray80}
        containerStyle={localStyle.btnStyle}
        onPress={onPressAddNewCard}
        autoCapitalize={'none'}
      />
    </View>
  );
}

const localStyle = StyleSheet.create({
  textInputStyle: {
    width: deviceWidth / 2.5,
    marginRight: 0,
  },
  cvvTextInputStyle: {
    width: deviceWidth / 2.5,
    marginLeft: 0,
  },
  btnStyle: {
    backgroundColor: Colors.secondary,
    ...styles.mv10,
    width: '90%',
    ...styles.selfCenter,
  },
  datePikerStyle: {
    backgroundColor: Colors.secondary,
    width: deviceWidth / 2.5,
    borderColor: Colors.secondary,
    borderWidth: moderateScale(1),
    ...styles.selfCenter,
    borderRadius: moderateScale(25),
    height: moderateScale(52),
    ...styles.mt5,
    ...styles.justifyCenter,
  },
  mainContainer: {
    ...styles.ml10,
    ...styles.ph20,
    ...styles.mt15,
  },
});
