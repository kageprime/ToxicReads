import {StyleSheet, Switch, View, FlatList} from 'react-native';
import React, {useState} from 'react';

// custom import
import {styles} from '../../Theme';
import CHeader from '../../components/common/CHeader';
import String from '../../i18n/String';
import {deviceWidth, moderateScale} from '../../common/constant';
import {Colors} from '../../Theme/Colors';
import CText from '../../components/common/CText';

export default function Security() {
  const [isEnable, setIsEnable] = useState({
    isEnableFaceId: true,
    isEnablePassword: true,
    isEnableTouchId: true,
  });

  const SecurityData = [
    {
      id: 1,
      title: String.faceID,
      value: isEnable.isEnableFaceId,
      onPress: () =>
        setIsEnable({
          ...isEnable,
          isEnableFaceId: isEnable.isEnableFaceId ? false : true,
        }),
    },
    {
      id: 2,
      title: String.rememberPassword,
      value: isEnable.isEnablePassword,
      onPress: () =>
        setIsEnable({
          ...isEnable,
          isEnablePassword: isEnable.isEnablePassword ? false : true,
        }),
    },
    {
      id: 3,
      title: String.touchID,
      value: isEnable.isEnableTouchId,
      onPress: () =>
        setIsEnable({
          ...isEnable,
          isEnableTouchId: isEnable.isEnableTouchId ? false : true,
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
        <View style={localStyle.lineStyle} />
      </View>
    );
  };
  return (
    <View style={styles.mainContainerWhite}>
      <CHeader title={String.security} />

      <FlatList
        data={SecurityData}
        renderItem={renderSecurityItem}
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={localStyle.mainContainer}
        vertical
      />
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
  lineStyle: {
    width: deviceWidth - moderateScale(60),
    borderColor: Colors.Gray30,
    borderWidth: moderateScale(1),
    ...styles.ph10,
    ...styles.selfCenter,
  },
});
