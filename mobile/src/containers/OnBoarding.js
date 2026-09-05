// Library import
import {
  View,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import React, {useCallback, useRef, useState} from 'react';

// Custom import
import {AuthNav, StackNav} from '../Navigation/NavigationKeys';
import CText from '../components/common/CText';
import {Colors} from '../Theme/Colors';
import {OnBoardingData} from '../api/constant';
import {styles} from '../Theme';
import CButton from '../components/common/CButton';
import String from '../i18n/String';
import {deviceWidth, moderateScale} from '../common/constant';

export default function OnBoarding({navigation}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideRef = useRef(null);

  const _onViewableItemsChanged = useCallback(({viewableItems}) => {
    setCurrentIndex(viewableItems[0]?.index);
  }, []);

  const _viewabilityConfig = {itemVisiblePercentThreshold: 50};

  const OnPressContinue = async () => {
    if (currentIndex === 2) {
      if (String.register) {
        navigation.reset({
          index: 0,
          routes: [{name: AuthNav.SignInScreen}],
        });
      }
      // await SetOnBoarding(true);
      else {
        navigation.reset({
          index: 0,
          routes: [{name: AuthNav.SignInScreen}],
        });
      }
    } else {
      slideRef.current._listRef._scrollRef.scrollTo({
        x: deviceWidth * (currentIndex + 1),
      });
    }
  };

  const RenderItemData = useCallback(
    ({item, index}) => {
      return (
        <View style={localStyle.Container}>
          <Image
            source={item.image}
            resizeMode="contain"
            style={localStyle.ImageStyle}></Image>
        </View>
      );
    },
    [OnBoardingData],
  );

  return (
    <View style={styles.mainContainerSurface}>
      <FlatList
        data={OnBoardingData}
        ref={slideRef}
        renderItem={({item, index}) => (
          <RenderItemData item={item} index={index} />
        )}
        keyExtractor={(item, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        bounces={false}
        horizontal
        onViewableItemsChanged={_onViewableItemsChanged}
        viewabilityConfig={_viewabilityConfig}
        pagingEnabled
      />

      <View style={localStyle.BottomView}>
        <View style={styles.rowCenter}>
          {OnBoardingData.map((_, index) => (
            <View
              key={index.toString()}
              style={[
                localStyle.topIndicatorStyle,
                {
                  width:
                    index !== currentIndex
                      ? moderateScale(10)
                      : moderateScale(25),
                  backgroundColor:
                    index !== currentIndex ? Colors.Gray40 : Colors.Primary,
                },
              ]}
            />
          ))}
        </View>
        <View style={localStyle.TextStyle}>
          <CText
            numberOfLines={2}
            type={'D24'}
            align={'center'}
            color={Colors.Black}>
            {String.title}
          </CText>
          <CText
            type={'R14'}
            align={'center'}
            numberOfLines={3}
            color={Colors.Gray70}
            style={styles.mt10}>
            {currentIndex === 2 ? String.description1 : String.description}
          </CText>
        </View>
        <View
          style={
            currentIndex === 2
              ? localStyle.lastSlideBtnStyle
              : localStyle.BtnStyle
          }>
          <CButton onPress={OnPressContinue}>
            <CText type={'S16'} color={Colors.White}>
              {currentIndex === 2 ? String.getStarted : String.continue}
            </CText>
          </CButton>
          <View style={localStyle.bottomTextView}>
            <CText type={'S16'} color={Colors.Black} align={'center'}>
              {currentIndex === 2 ? String.dontHaveAccount : null}
            </CText>
            <TouchableOpacity onPress={OnPressContinue}>
              <CText type={'S16'} color={Colors.Primary} align={'center'}>
                {currentIndex === 2 ? String.register : null}
              </CText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
const localStyle = StyleSheet.create({
  Container: {
    width: deviceWidth,
    ...styles.alignCenter,
    ...styles.justifySpaceBetween,
  },
  ImageStyle: {
    width: deviceWidth - moderateScale(40),
    height: '55%',
    top: moderateScale(50),
  },
  BottomView: {
    height: '40%',
    width: moderateScale(332),
    backgroundColor: Colors.White,
    borderRadius: moderateScale(20),
    position: 'absolute',
    ...styles.selfCenter,
    ...styles.justifySpaceBetween,
    bottom: moderateScale(30),
  },
  topIndicatorStyle: {
    height: moderateScale(10),
    borderRadius: moderateScale(10),
    ...styles.m5,
    top: moderateScale(10),
  },
  TextStyle: {
    ...styles.ph30,
  },
  BtnStyle: {
    ...styles.selfCenter,
    width: moderateScale(200),
  },
  lastSlideBtnStyle: {
    ...styles.selfCenter,
    width: moderateScale(287),
  },
  bottomTextView: {
    ...styles.flexRow,
    ...styles.selfCenter,
    ...styles.mv10,
  },
});
