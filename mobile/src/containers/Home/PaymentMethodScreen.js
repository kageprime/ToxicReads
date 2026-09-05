import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import React, {useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';

// custom import
import KeyboardAvoidingView from '../../components/common/KeyboardAvoidingView';
import {styles} from '../../Theme';
import CHeader from '../../components/common/CHeader';
import String from '../../i18n/String';
import {Colors} from '../../Theme/Colors';
import {deviceWidth, moderateScale} from '../../common/constant';
import CText from '../../components/common/CText';
import {BankDetailsData} from '../../api/constant';
import CButton from '../../components/common/CButton';
import {StackNav} from '../../Navigation/NavigationKeys';
import HelpAndSupportComponents from '../../components/Hometab/HelpAndSupportComponents';

export default function PaymentMethodScreen({route}) {
  const item = route?.params?.item;

  const navigation = useNavigation();

  const [isSelected, setIsSelected] = useState(false);
  const [isDescShow, setIsDescShow] = useState(false);
  const onPressShow = () => setIsDescShow(!isDescShow);

  const onPressRadioBtn = item => {
    setIsSelected(item.id);
  };

  const onPressProceedToPayment = () => {
    navigation.navigate(StackNav.PaymentSuccessfulScreen, {item: item});
  };

  const RenderBankDetailsComponents = ({item}) => {
    return (
      <View>
        <TouchableOpacity
          onPress={() => onPressRadioBtn(item)}
          style={[
            localStyle.mainContainerStyle,
            {
              backgroundColor:
                isSelected === item.id
                  ? Colors.ItemBackgroundColor
                  : Colors.White,
            },
            {
              borderColor:
                isSelected === item.id ? Colors.Primary : Colors.White,
            },
          ]}>
          <View style={[styles.rowSpaceBetween, styles.pv15]}>
            <Image source={item.image} style={localStyle.imageStyle} />
            <View
              style={[
                styles.rowSpaceBetween,
                {
                  width: deviceWidth - moderateScale(125),
                },
              ]}>
              <View style={styles.ml10}>
                <CText type={'S16'} color={Colors.Black} numberOfLines={1}>
                  {item.bankName}
                </CText>
                <CText type={'M12'} color={Colors.Gray70} numberOfLines={1}>
                  {item.subtitle}
                </CText>
              </View>

              <Ionicons
                name={
                  isSelected === item.id
                    ? 'radio-button-on'
                    : 'radio-button-off'
                }
                color={isSelected === item.id ? Colors.Primary : Colors.Gray30}
                size={moderateScale(24)}
                style={styles.mr10}
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const BankDetails = ({data}) => {
    return (
      <FlatList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={RenderBankDetailsComponents}
        scrollEnabled={false}
      />
    );
  };

  return (
    <View style={localStyle.mainContainerWhite}>
      <KeyboardAvoidingView containerStyle={styles.flexGrow1}>
        <CHeader title={String.paymentDetail} />
        <View>
          <HelpAndSupportComponents
            title={String.bankTransfer}
            description={<BankDetails data={BankDetailsData} />}
          />
          <HelpAndSupportComponents title={String.creditDebitCard} />
          <HelpAndSupportComponents title={String.payPal} />
        </View>
      </KeyboardAvoidingView>
      <CButton
        onPress={onPressProceedToPayment}
        title={String.proceedToPayment}
        color={Colors.White}
        type={'S16'}
        containerStyle={styles.mb20}
      />
    </View>
  );
}

const localStyle = StyleSheet.create({
  mainContainerWhite: {
    ...styles.mainContainerWhite,
    ...styles.ph10,
  },
  iconStyle: {
    height: moderateScale(24),
    width: moderateScale(24),
  },
  helperContainer: {
    ...styles.mt15,
    backgroundColor: Colors.White,
  },
  helperInnerContainer: {
    ...styles.rowSpaceBetween,
    ...styles.p15,
  },
  helperDescription: {
    ...styles.p15,
  },
  textContainer: {
    ...styles.mh15,
  },
  imageStyle: {
    height: moderateScale(32),
    width: moderateScale(45),
  },
  mainContainerStyle: {
    height: moderateScale(70),
    width: '100%',
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(8),
    ...styles.ph10,
  },
});
