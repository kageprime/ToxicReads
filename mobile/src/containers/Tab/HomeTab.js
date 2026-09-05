import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import React, {useMemo} from 'react';
import {useQuery} from '@tanstack/react-query';

// custom import
import {styles} from '../../Theme';
import images from '../../assets/images';
import {moderateScale} from '../../common/constant';
import {Colors} from '../../Theme/Colors';
import KeyboardAvoidingView from '../../components/common/KeyboardAvoidingView';
import CText from '../../components/common/CText';
import String from '../../i18n/String';
import {BellIcon, MessageIcon} from '../../assets/svg';
import {StackNav} from '../../Navigation/NavigationKeys';
import {trpc} from '../../api/client';
import {mapBook, withRatings, toCardItem} from '../../api/mappers';
import BookDataComponents from '../../components/Hometab/BookDataComponents';
import BookTypeComponents from '../../components/Hometab/BookTypeComponents';

export default function HomeTab(props) {
  let {navigation} = props;

  const {data: books, isLoading} = useQuery({
    queryKey: ['book.list'],
    queryFn: () => trpc.book.list.query(),
  });

  const ids = useMemo(() => (books ?? []).map(b => b.id), [books]);
  const {data: ratings} = useQuery({
    queryKey: ['book.ratings', ids.join(',')],
    queryFn: () => trpc.book.ratings.query({ids}),
    enabled: ids.length > 0,
  });

  const {data: featured} = useQuery({
    queryKey: ['book.featured'],
    queryFn: () => trpc.book.featured.query(),
  });

  const items = useMemo(
    () => withRatings((books ?? []).map(mapBook), ratings).map(toCardItem),
    [books, ratings],
  );
  const spotlight = items.length > 0 ? items[0] : null;

  const onPressBellIcon = () => {
    navigation.navigate(StackNav.NotificationScreen);
  };

  const onPressMessage = () => {
    navigation.navigate(StackNav.MessageScreen);
  };
  const onPressBook = item => {
    navigation.navigate(StackNav.BookPreviewScreen, {slug: item.slug});
  };

  const renderBookData = ({item, index}) => {
    return (
      <BookDataComponents
        item={item}
        index={index}
        onPress={() => onPressBook(item)}
      />
    );
  };

  return (
    <View style={localStyle.mainContainer}>
      <KeyboardAvoidingView containerStyle={styles.flexGrow1}>
        <View style={localStyle.topHeaderContainer}>
          <View style={styles.flexRow}>
            <Image
              source={images.profileImage}
              style={localStyle.imageStyle}></Image>
            <View style={styles.p15}>
              <CText type={'D18'} color={Colors.Black} align={'center'}>
                {' '}
                {String.helloText}
              </CText>
              <CText type={'M12'} color={Colors.Gray70} align={'center'}>
                {' '}
                {String.goodMorningText}{' '}
              </CText>
            </View>
          </View>
          <View style={styles.rowSpaceBetween}>
            <TouchableOpacity
              onPress={onPressBellIcon}
              style={localStyle.iconStyle}>
              <BellIcon />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onPressMessage}
              style={localStyle.iconStyle}>
              <MessageIcon />
            </TouchableOpacity>
          </View>
        </View>

        <View style={localStyle.headerCardContainer}>
          <ImageBackground
            imageStyle={{borderRadius: moderateScale(8)}}
            source={images.backgroundImage}
            style={localStyle.backgroundImageStyle}>
            <CText
              type={'D20'}
              color={Colors.White}
              align={'center'}
              style={localStyle.previewTextStyle}>
              {String.previewTitleText}
            </CText>
          </ImageBackground>
          <View style={localStyle.previewStyle}>
            <View style={localStyle.innerContainerStyle}>
              <CText type={'S12'} color={Colors.Gray80}>
                {String.previewText}
              </CText>
              <CText type={'B12'} color={Colors.Primary} style={styles.mv5}>
                {String.continueReading}
              </CText>
            </View>
            {spotlight ? (
              <TouchableOpacity
                style={styles.flexRow}
                onPress={() => onPressBook(spotlight)}>
                <Image
                  source={spotlight.image}
                  style={localStyle.bookImageStyle}></Image>
                <View style={[styles.p10, styles.flex]}>
                  <CText
                    type={'B12'}
                    color={Colors.Black}
                    numberOfLines={1}
                    style={[styles.mt5, styles.flex]}>
                    {spotlight.title}
                  </CText>
                  <CText type={'M10'} color={Colors.Gray70} style={styles.mt5}>
                    {spotlight.author} {'·'} {spotlight.category}
                  </CText>
                </View>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
        <BookTypeComponents
          containerStyle={styles.mt50}
          activebgColor={Colors.ItemBackgroundColor}
          activeTxtColor={Colors.Primary}
          horizontal={true}
        />
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={Colors.Primary}
            style={styles.m20}
          />
        ) : (
          <FlatList
            keyExtractor={(item, index) => index.toString()}
            data={items}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={renderBookData}
          />
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const localStyle = StyleSheet.create({
  topHeaderContainer: {
    ...styles.rowSpaceBetween,
    ...styles.pv10,
  },
  mainContainer: {
    ...styles.flex,
    ...styles.ph24,
  },
  imageStyle: {
    ...styles.mv15,
    height: moderateScale(40),
    width: moderateScale(40),
  },
  iconStyle: {
    ...styles.center,
    ...styles.m10,
  },
  headerCardContainer: {
    position: 'relative',
  },
  backgroundImageStyle: {
    width: '100%',
    height: moderateScale(220),
    resizeMode: 'contain',
    borderRadius: moderateScale(8),
  },
  previewStyle: {
    backgroundColor: Colors.White,
    width: '90%',
    position: 'absolute',
    bottom: moderateScale(-40),
    borderRadius: moderateScale(8),
    ...styles.selfCenter,
    ...styles.p10,
  },
  previewTextStyle: {
    ...styles.selfCenter,
    ...styles.m25,
  },
  innerContainerStyle: {
    backgroundColor: Colors.secondary,
    width: '100%',
    height: '60%',
    borderRadius: moderateScale(8),
    ...styles.selfCenter,
    ...styles.p10,
  },
  bookImageStyle: {
    height: moderateScale(52),
    width: moderateScale(52),
    ...styles.mt10,
    borderRadius: moderateScale(8),
  },
});
