import {
  StyleSheet,
  View,
  ImageBackground,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import React, {memo, useState} from 'react';
import Icons from 'react-native-vector-icons/Feather';

// custom import
import {styles} from '../../Theme';
import CHeader from '../../components/common/CHeader';
import {checkPlatform, moderateScale} from '../../common/constant';
import {Colors} from '../../Theme/Colors';
import String from '../../i18n/String';
import KeyboardAvoidingView from '../../components/common/KeyboardAvoidingView';
import {ChatData} from '../../api/constant';
import CText from '../../components/common/CText';
import CTextInput from '../../components/common/CTextInput';
import {SendIcon} from '../../assets/svg';

export default function Chat({route}) {
  const data = route?.params?.data;

  const [chatMessage, setChatMessage] = useState('');

  const onChangeMessageField = text => {
    setChatMessage(text);
  };

  const LeftIcon = () => {
    return (
      <TouchableOpacity style={localStyle.leftIconStyle}>
        <Icons
          name={'paperclip'}
          size={moderateScale(24)}
          color={Colors.Primary}
        />
      </TouchableOpacity>
    );
  };

  const RightIcon = () => {
    return (
      <TouchableOpacity style={localStyle.rightIconStyle}>
        <SendIcon />
      </TouchableOpacity>
    );
  };

  const SenderMessage = memo(({item, index}) => {
    return (
      <View
        style={[
          {
            flexDirection: item.type == 'sender' ? 'row' : 'row-reverse',
          },
        ]}>
        <ImageBackground
          source={
            item.type == 'sender' ? data.image : data.receiverProfileImage
          }
          style={[localStyle.imageStyle]}>
          {data.status === String.online && item.type == 'sender' ? (
            <View style={localStyle.dotStyle} />
          ) : null}
        </ImageBackground>
        <View>
          <View
            style={[
              localStyle.senderContainer,
              item.type == 'sender' && {
                borderBottomRightRadius: moderateScale(30),
              },
              item.type !== 'sender' && {
                borderBottomLeftRadius: moderateScale(30),
              },
              {
                borderTopLeftRadius: moderateScale(30),
                borderTopRightRadius: moderateScale(30),
                backgroundColor:
                  item.type == 'sender'
                    ? Colors.MessageContainerColor
                    : Colors.Primary,
                alignSelf: item.type == 'sender' ? 'flex-start' : 'flex-end',
              },
            ]}>
            <CText
              color={item.type == 'sender' ? Colors.Gray80 : Colors.White}
              type="M14">
              {item.message}
            </CText>
          </View>
          <CText
            color={Colors.Gray60}
            style={[
              styles.mt5,
              {alignSelf: item.type == 'sender' ? 'flex-start' : 'flex-end'},
              item.type == 'sender' ? styles.ml15 : styles.mr15,
            ]}
            type="M10">
            {item.time}
          </CText>
        </View>
      </View>
    );
  });

  return (
    <View style={localStyle.mainContainer}>
      <CHeader title={data?.userName} />

      <KeyboardAvoidingView
        keyboardVerticalOffset={
          checkPlatform() === 'ios' ? moderateScale(120) : null
        }
        contentContainerStyle={[styles.justifySpaceBetween, styles.flex]}
        behavior={checkPlatform() === 'ios' ? 'padding' : null}>
        <FlatList
          data={ChatData}
          renderItem={({item, index}) => (
            <SenderMessage item={item} index={index} />
          )}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={[styles.mh20]}
        />
        <CTextInput
          containerStyle={styles.mb10}
          placeholder={String.message}
          keyboardType={'default'}
          value={chatMessage}
          onChangeText={onChangeMessageField}
          autoCapitalize={'none'}
          LeftIcon={() => <LeftIcon />}
          RightIcon={() => <RightIcon />}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const localStyle = StyleSheet.create({
  mainContainer: {
    ...styles.mainContainerWhite,
  },
  dotStyle: {
    height: moderateScale(8),
    width: moderateScale(8),
    borderRadius: moderateScale(5),
    backgroundColor: Colors.Primary,
    borderColor: Colors.White,
    borderWidth: moderateScale(1),
    ...styles.selfEnd,
    top: moderateScale(20),
    left: moderateScale(2),
  },
  imageStyle: {
    height: moderateScale(32),
    width: moderateScale(32),
    ...styles.mt15,
    ...styles.selfCenter,
  },
  senderContainer: {
    ...styles.p15,
    ...styles.flexRow,
    maxWidth: '90%',
    ...styles.mt20,
    ...styles.mh10,
  },
  leftIconStyle: {
    backgroundColor: Colors.White,
    height: moderateScale(32),
    width: moderateScale(32),
    borderRadius: moderateScale(16),
    ...styles.ml15,
    ...styles.center,
  },
  rightIconStyle: {
    backgroundColor: Colors.Primary,
    height: moderateScale(42),
    width: moderateScale(42),
    borderRadius: moderateScale(21),
    ...styles.center,
    ...styles.mr10,
  },
  lastViewContainer: {
    ...styles.justifyEnd,
  },
});
