import {FlatList, StyleSheet, View, Image} from 'react-native';
import React from 'react';

// custom import
import {styles} from '../../Theme';
import CHeader from '../../components/common/CHeader';
import String from '../../i18n/String';
import {VoucherData} from '../../api/constant';
import CText from '../../components/common/CText';
import {deviceWidth, moderateScale} from '../../common/constant';
import {Colors} from '../../Theme/Colors';
import CButton from '../../components/common/CButton';
import {CalenderIcon} from '../../assets/svg';

export default function Voucher() {
  const renderVoucherData = ({item}) => {
    return (
      <View style={localStyle.mainContainer}>
        <Image style={localStyle.imageStyle} source={item.image} />
        <View
          style={{
            width: deviceWidth - moderateScale(165),
          }}>
          <CText
            type={'B12'}
            color={Colors.Black}
            numberOfLines={1}
            style={localStyle.textStyle}>
            {item.title}
          </CText>
          <View style={localStyle.dateStyle}>
            <CalenderIcon />
            <CText type={'M12'} color={Colors.Gray70} style={styles.ml10}>
              {item.date}
            </CText>
          </View>
        </View>
        <CButton
          title={String.claim}
          color={Colors.White}
          type={'M12'}
          containerStyle={localStyle.btnStyle}
        />
      </View>
    );
  };

  return (
    <View style={styles.mainContainerWhite}>
      <CHeader title={String.voucher} />
      <FlatList data={VoucherData} renderItem={renderVoucherData} />
    </View>
  );
}

const localStyle = StyleSheet.create({
  mainContainer: {
    ...styles.flex,
    ...styles.m10,
    ...styles.ph10,
    ...styles.mt10,
    ...styles.flexRow,
  },
  imageStyle: {
    height: moderateScale(60),
    width: moderateScale(60),
    borderRadius: moderateScale(8),
  },
  textStyle: {
    ...styles.mv10,
    ...styles.ph10,
  },
  dateStyle: {
    ...styles.flexRow,
    ...styles.ml10,
    ...styles.alignCenter,
  },
  btnStyle: {
    height: moderateScale(28),
    width: moderateScale(66),
    ...styles.mv10,
    borderRadius: moderateScale(8),
    ...styles.mt15,
  },
});
