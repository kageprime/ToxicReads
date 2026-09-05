import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import React from 'react';
import Icons from 'react-native-vector-icons/Feather';

// custom import
import {styles} from '../../Theme';
import CHeader from '../../components/common/CHeader';
import String from '../../i18n/String';
import {Colors} from '../../Theme/Colors';
import {moderateScale} from '../../common/constant';
import {PaymentCardData} from '../../api/constant';
import CText from '../../components/common/CText';
import {EditSquareIcon} from '../../assets/svg';
import CButton from '../../components/common/CButton';
import {StackNav} from '../../Navigation/NavigationKeys';

export default function ChoosePayment({navigation}) {
  const OnPressAddCard = () => {
    navigation.navigate(StackNav.AddNewCard);
  };

  const RightIcon = () => {
    return (
      <TouchableOpacity onPress={OnPressAddCard}>
        <Icons name={'plus'} color={Colors.Black} size={moderateScale(24)} />
      </TouchableOpacity>
    );
  };

  const renderItems = ({item}) => {
    return (
      <TouchableOpacity style={localStyle.mainContainer}>
        <View style={styles.flexRow}>
          <Image style={localStyle.imageStyle} source={item.image} />
          <View>
            <CText type={'S14'} color={Colors.Black} style={styles.ml10}>
              {item.cardName}
            </CText>
            <CText
              type={'R12'}
              color={Colors.Gray80}
              style={localStyle.TextStyle}>
              {item.cardNumber}
            </CText>
          </View>
        </View>
        <EditSquareIcon />
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.mainContainerWhite}>
      <CHeader title={String.paymentMethod} rightIcon={<RightIcon />} />
      <FlatList
        data={PaymentCardData}
        renderItem={renderItems}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        vertical
      />

      <CButton
        title={String.selectPayment}
        type={'S16'}
        color={Colors.White}
        containerStyle={localStyle.btnStyle}
      />
    </View>
  );
}

const localStyle = StyleSheet.create({
  imageStyle: {
    borderColor: Colors.Borderline,
    height: moderateScale(48),
    width: moderateScale(48),
    borderRadius: moderateScale(16),
  },
  mainContainer: {
    ...styles.rowSpaceBetween,
    ...styles.ph20,
    ...styles.mv10,
  },
  TextStyle: {
    ...styles.ml10,
    ...styles.mt5,
  },
  btnStyle: {
    width: '90%',
    ...styles.selfCenter,
    ...styles.mb10,
  },
});
