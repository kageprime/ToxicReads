import {
  FlatList,
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, {useCallback, useState} from 'react';
import ProgressBar from 'react-native-progress/Bar';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Ionicons from 'react-native-vector-icons/Ionicons';

// custom import
import {styles} from '../../Theme';
import {Colors} from '../../Theme/Colors';
import CHeader from '../../components/common/CHeader';
import String from '../../i18n/String';
import CText from '../../components/common/CText';
import {CompletedBookData, DownloadingBookData} from '../../api/constant';
import {deviceWidth, moderateScale} from '../../common/constant';
import {RemoveIcon} from '../../assets/svg';
import {ScrollView} from 'react-native';

export default function DownloadTab() {
  let row = [];
  let prevOpenRow;

  const [data, setData] = useState(CompletedBookData);
  const [downloadData, setDownloadData] = useState(DownloadingBookData);

  const RenderDownloadingBookData = useCallback(
    ({item, index}) => {
      const [pause, setPause] = useState(false);
      const onPressPauseBtn = () => setPause(!pause);

      const onPressClose = val => {
        setDownloadData(downloadData.filter(item => item.id != val));
      };
      return (
        <View style={styles.flexRow}>
          <Image source={item.image} style={localStyle.imageStyle} />
          <View style={[styles.mt10, styles.flex]}>
            <CText
              type={'S16'}
              style={styles.flex}
              color={Colors.Black}
              numberOfLines={1}>
              {item.title}
            </CText>
            <CText type={'M12'} color={Colors.Gray60}>
              {String.downloading}
              {'...'}
            </CText>
            <View
              style={[
                styles.rowSpaceBetween,
                {
                  width: deviceWidth - moderateScale(125),
                },
              ]}>
              <ProgressBar
                progress={item.downloadProgress}
                width={deviceWidth - moderateScale(200)}
                color={Colors.Primary}
                style={localStyle.progressBar}
              />
              <View style={styles.rowSpaceBetween}>
                <TouchableOpacity
                  style={localStyle.pauseAndPlayBtnStyle}
                  onPress={onPressPauseBtn}>
                  <Ionicons
                    name={pause ? 'pause-outline' : 'play'}
                    size={moderateScale(16)}
                    color={Colors.Black}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={localStyle.pauseAndPlayBtnStyle}
                  onPress={() => onPressClose(item.id)}>
                  <Ionicons
                    name={'close'}
                    size={moderateScale(16)}
                    color={Colors.Black}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.flexRow}>
              <CText type={'M12'} color={Colors.Gray60} style={styles.mr20}>
                {item.data}
              </CText>
              <CText type={'M12'} color={Colors.Gray60} style={styles.mh20}>
                {item.speed}
              </CText>
            </View>
          </View>
        </View>
      );
    },
    [downloadData],
  );

  const closeRow = index => {
    if (prevOpenRow && prevOpenRow !== row[index]) {
      prevOpenRow.close();
    }
    prevOpenRow = row[index];
  };

  const onPressDelete = val => {
    setData(data.filter(item => item.id !== val));
  };

  const renderRightView = item => {
    return (
      <TouchableOpacity
        onPress={() => onPressDelete(item.id)}
        style={[
          localStyle.rightAction,
          {backgroundColor: Colors.RemoveBackgroundColor},
        ]}>
        <RemoveIcon />
        <CText type={'M10'} color={Colors.ErrorAlert}>
          {String.remove}
        </CText>
      </TouchableOpacity>
    );
  };
  const renderCompletedBookData = ({item, index}) => {
    return (
      <Swipeable
        renderRightActions={() => renderRightView(item)}
        onSwipableOpen={() => closeRow(index)}
        ref={ref => (row[index] = ref)}>
        <View style={styles.flexRow}>
          <Image source={item.image} style={localStyle.imageStyle} />
          <View style={localStyle.mainViewStyle}>
            <View style={{width: '60%'}}>
              <CText type={'S16'} color={Colors.Black} numberOfLines={1}>
                {item.title}
              </CText>
              <CText
                type={'S12'}
                color={Colors.Gray60}
                style={styles.mt5}
                numberOfLines={1}>
                {item.complete}
              </CText>
            </View>
            <TouchableOpacity style={localStyle.readBookBtnStyle}>
              <CText type={'M12'} color={Colors.Primary} align={'center'}>
                {String.readBook}
              </CText>
            </TouchableOpacity>
          </View>
        </View>
      </Swipeable>
    );
  };

  return (
    <View style={localStyle.mainContainer}>
      <CHeader isHideBack title={String.download} type={'B18'} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <CText type={'B14'} color={Colors.Gray60}>
          {String.downloading}
        </CText>
        <FlatList
          data={downloadData}
          renderItem={({item, index}) => (
            <RenderDownloadingBookData item={item} index={index} />
          )}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          vertical
        />
        <CText type={'S14'} color={Colors.Gray60} style={styles.mt20}>
          {String.completed}
        </CText>
        <FlatList
          data={data}
          renderItem={(item, index) => renderCompletedBookData(item)}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          vertical
        />
      </ScrollView>
    </View>
  );
}

const localStyle = StyleSheet.create({
  mainContainer: {
    ...styles.flex,
    backgroundColor: Colors.White,
    ...styles.ph20,
  },
  imageStyle: {
    height: moderateScale(64),
    width: moderateScale(64),
    ...styles.m10,
    borderRadius: moderateScale(12),
  },
  rightAction: {
    ...styles.center,
    height: moderateScale(60),
    ...styles.mv10,
    width: '20%',
  },
  mainViewStyle: {
    ...styles.rowSpaceBetween,
    ...styles.flex,
  },
  readBookBtnStyle: {
    height: moderateScale(28),
    width: '35%',
    borderRadius: moderateScale(8),
    borderWidth: moderateScale(1),
    borderColor: Colors.Primary,
    ...styles.center,
  },
  imageStyle: {
    height: moderateScale(64),
    width: moderateScale(64),
    ...styles.m10,
    borderRadius: moderateScale(12),
  },
  progressBar: {
    height: moderateScale(6),
    backgroundColor: Colors.secondary,
    borderRadius: moderateScale(8),
    color: Colors.Primary,
    borderColor: Colors.secondary,
  },
  pauseAndPlayBtnStyle: {
    backgroundColor: Colors.White,
    borderRadius: moderateScale(12),
    height: moderateScale(24),
    width: moderateScale(24),
    ...styles.center,
    borderColor: Colors.Gray30,
    borderWidth: moderateScale(2),
    ...styles.ml10,
  },
});
