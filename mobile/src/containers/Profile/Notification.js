import {StyleSheet, View, Switch, FlatList} from 'react-native';
import React, {useState} from 'react';

// custom import
import {styles} from '../../Theme';
import CHeader from '../../components/common/CHeader';
import String from '../../i18n/String';
import {Colors} from '../../Theme/Colors';
import {deviceWidth, moderateScale} from '../../common/constant';
import CText from '../../components/common/CText';

export default function Notification() {
  const [isEnable, setIsEnable] = useState({
    isEnablePayment: true,
    isEnableBook: true,
    isEnableMessage: true,
    isEnableUpdateChapter: true,
  });

  const NotificationsData = [
    {
      id: 1,
      title: String.payment,
      value: isEnable.isEnablePayment,
      onPress: () =>
        setIsEnable({
          ...isEnable,
          isEnablePayment: isEnable.isEnablePayment ? false : true,
        }),
    },
    {
      id: 2,
      title: String.newBook,
      value: isEnable.isEnableBook,
      onPress: () =>
        setIsEnable({
          ...isEnable,
          isEnableBook: isEnable.isEnableBook ? false : true,
        }),
    },
    {
      id: 3,
      title: String.message,
      value: isEnable.isEnableMessage,
      onPress: () =>
        setIsEnable({
          ...isEnable,
          isEnableMessage: isEnable.isEnableMessage ? false : true,
        }),
    },
    {
      id: 4,
      title: String.updateChapter,
      value: isEnable.isEnableUpdateChapter,
      onPress: () =>
        setIsEnable({
          ...isEnable,
          isEnableUpdateChapter: isEnable.isEnableUpdateChapter ? false : true,
        }),
    },
  ];

  const renderSecurityItem = ({item}) => {
    return (
      <View>
        <View style={localStyle.innerViewContainer}>
          <CText type={'M16'} color={Colors.Black}>
            {item.title}
          </CText>
          <Switch
            onValueChange={item.onPress}
            trackColor={{false: Colors.Gray80, true: Colors.Primary}}
            value={item.value}
          />
        </View>
        {item.id === 4 ? null : <View style={localStyle.lineStyle} />}
      </View>
    );
  };
  return (
    <View style={styles.mainContainerWhite}>
      <CHeader title={String.notification} />
      <View style={localStyle.mainContainer}>
        <CText type={'M12'} color={Colors.Gray80} style={localStyle.textStyle}>
          {String.messagesNotifications}
        </CText>
        <FlatList
          data={NotificationsData}
          bounces={false}
          renderItem={renderSecurityItem}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          vertical
        />
      </View>
    </View>
  );
}

const localStyle = StyleSheet.create({
  mainContainer: {
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(12),
    borderColor: Colors.Gray30,
    ...styles.mt20,
    width: deviceWidth - moderateScale(40),
    ...styles.selfCenter,
  },
  innerViewContainer: {
    ...styles.rowSpaceBetween,
    ...styles.p10,
    ...styles.m10,
  },
  textStyle: {
    ...styles.ml10,
    ...styles.mt10,
  },
  lineStyle: {
    width: deviceWidth - moderateScale(60),
    borderColor: Colors.Gray30,
    borderWidth: moderateScale(1),
    ...styles.ph10,
    ...styles.selfCenter,
  },
});
