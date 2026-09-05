import {
  StyleSheet,
  View,
  TouchableOpacity,
  ImageBackground,
  FlatList,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icons from 'react-native-vector-icons/Entypo';
import Swipeable from 'react-native-gesture-handler/Swipeable';

// custom import
import {styles} from '../../Theme';
import CHeader from '../../components/common/CHeader';
import String from '../../i18n/String';
import {Colors} from '../../Theme/Colors';
import {moderateScale} from '../../common/constant';
import CTextInput from '../../components/common/CTextInput';
import CText from '../../components/common/CText';
import {DeleteIcon, FilterIcon} from '../../assets/svg';
import {MessageData} from '../../api/constant';
import {StackNav} from '../../Navigation/NavigationKeys';

export default function MessageScreen({navigation}) {
  const [searchText, setSearchText] = useState('');
  const [searchData, setSearchData] = useState(MessageData);

  let row = [];

  const onChangeTextSearch = item => {
    setSearchText(item);
  };

  useEffect(() => {
    filterData();
  }, [searchText]);

  const filterData = () => {
    if (!!searchText) {
      const filteredData = MessageData.filter(item =>
        item.userName.toLowerCase().includes(searchText.toLowerCase()),
      );
      setSearchData(filteredData);
    } else {
      setSearchData(MessageData);
    }
  };

  const onPressMessage = item => {
    navigation.navigate(StackNav.Chat, {data: item});
  };

  const LeftIcon = () => {
    return (
      <TouchableOpacity>
        <Ionicons
          name={'search-outline'}
          size={moderateScale(20)}
          color={Colors.Gray60}
          style={styles.ml15}
        />
      </TouchableOpacity>
    );
  };
  const RightIcon = () => {
    return (
      <View style={styles.flexRow}>
        <View style={localStyle.lineStyle} />
        <TouchableOpacity style={localStyle.inputRightIcnStyle}>
          <FilterIcon />
        </TouchableOpacity>
      </View>
    );
  };
  const closeRow = index => {
    if (prevOpenRow && prevOpenRow !== row[index]) {
      prevOpenRow.close();
    }
    prevOpenRow = row[index];
  };

  const onPressDelete = val => {
    setSearchData(searchData.filter(item => item.id !== val));
  };

  const renderRightView = item => {
    return (
      <TouchableOpacity
        onPress={() => onPressDelete(item.id)}
        style={[
          localStyle.rightAction,
          {backgroundColor: Colors.RemoveBackgroundColor},
        ]}>
        <DeleteIcon />
      </TouchableOpacity>
    );
  };

  const RenderMessageData = ({item, index}) => {
    return (
      <TouchableOpacity
        style={localStyle.mainContainerStyle}
        onPress={() => onPressMessage(item)}>
        <Swipeable
          renderRightActions={() => renderRightView(item)}
          onSwipableOpen={() => closeRow(index)}
          ref={ref => (row[index] = ref)}>
          <View style={styles.flexRow}>
            <ImageBackground source={item.image} style={localStyle.imageStyle}>
              {item.status === String.online ? (
                <View style={localStyle.dotStyle}></View>
              ) : null}
            </ImageBackground>
            <View style={styles.flex}>
              <View style={localStyle.innerViewStyle}>
                <CText type={'S18'} color={Colors.Black}>
                  {item.userName}
                </CText>
                <CText type={'S12'} color={Colors.Gray80}>
                  {item.time}
                </CText>
              </View>
              <View style={localStyle.innerViewStyle}>
                <CText type={'M14'} color={Colors.Gray80} numberOfLines={1}>
                  {item.msg}
                </CText>
                {item.msgPending ? (
                  <View style={localStyle.pendingMessageStyle}>
                    <CText color={Colors.White} type={'S10'}>
                      {item.msgPending}
                    </CText>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        </Swipeable>
      </TouchableOpacity>
    );
  };

  return (
    <View style={localStyle.mainContainer}>
      <CHeader title={String.message} />
      <CTextInput
        value={searchText}
        onChangeText={onChangeTextSearch}
        placeHolder={String.search1}
        RightIcon={() => <RightIcon />}
        LeftIcon={() => <LeftIcon />}
      />
      <FlatList
        data={searchData}
        renderItem={item => RenderMessageData(item)}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        vertical
      />

      <View style={styles.selfEnd}>
        <TouchableOpacity style={localStyle.iconStyle}>
          <Icons name="plus" color={Colors.White} size={moderateScale(24)} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const localStyle = StyleSheet.create({
  mainContainer: {
    ...styles.mainContainerWhite,
    ...styles.ph20,
    ...styles.selfCenter,
  },
  lineStyle: {
    backgroundColor: Colors.Borderline,
    width: moderateScale(1),
    ...styles.mr5,
    ...styles.selfCenter,
    height: moderateScale(18),
  },
  inputRightIcnStyle: {
    ...styles.mr10,
    ...styles.p5,
  },
  dotStyle: {
    height: moderateScale(16),
    width: moderateScale(16),
    borderRadius: moderateScale(10),
    backgroundColor: Colors.SuccessAlert,
    borderColor: Colors.White,
    borderWidth: moderateScale(1),
    ...styles.selfEnd,
    top: moderateScale(35),
    left: moderateScale(3),
  },
  imageStyle: {
    height: moderateScale(56),
    width: moderateScale(56),
  },
  mainContainerStyle: {
    ...styles.m20,
    borderRadius: moderateScale(23),
  },
  innerViewStyle: {
    ...styles.rowSpaceBetween,
    ...styles.mb5,
    ...styles.ph10,
  },
  pendingMessageStyle: {
    height: moderateScale(24),
    width: moderateScale(24),
    borderRadius: moderateScale(12),
    backgroundColor: Colors.Primary,
    ...styles.center,
  },
  iconStyle: {
    ...styles.center,
    backgroundColor: Colors.Primary,
    height: moderateScale(50),
    width: moderateScale(50),
    borderRadius: moderateScale(24),
    ...styles.mr25,
    ...styles.mb30,
  },
  rightAction: {
    ...styles.alignCenter,
    height: moderateScale(88),
    width: '20%',
    ...styles.pv20,
  },
});
