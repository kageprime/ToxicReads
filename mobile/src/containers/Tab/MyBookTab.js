import {
  FlatList,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, {useMemo} from 'react';
import {useQuery} from '@tanstack/react-query';

// custom import
import CHeader from '../../components/common/CHeader';
import {styles} from '../../Theme';
import {Colors} from '../../Theme/Colors';
import CText from '../../components/common/CText';
import {moderateScale} from '../../common/constant';
import String from '../../i18n/String';
import {StackNav} from '../../Navigation/NavigationKeys';
import {trpc} from '../../api/client';
import {useAuth} from '../../api/AuthContext';
import {mapBook} from '../../api/mappers';

export default function MyBookTab({navigation}) {
  const {isAuthenticated} = useAuth();
  const {data: purchases} = useQuery({
    queryKey: ['purchase.myPurchases'],
    queryFn: () => trpc.purchase.myPurchases.query(),
    enabled: isAuthenticated,
  });

  const books = useMemo(
    () =>
      (purchases ?? [])
        .map(p => p.book)
        .filter(Boolean)
        .map(b => ({...mapBook(b), subTitle: b.author})),
    [purchases],
  );

  const onPressBook = item => {
    navigation.navigate(StackNav.BookPreviewScreen, {slug: item.slug});
  };
  const renderMyBookData = ({item}) => {
    return (
      <TouchableOpacity
        style={localStyle.mainViewContainer}
        onPress={() => onPressBook(item)}>
        <View style={localStyle.imageBackgroundStyle}>
          <Image source={item.image} style={localStyle.bookImageStyle}></Image>
        </View>
        <View style={localStyle.bookTextContainer}>
          <CText type={'D14'} color={Colors.Black} numberOfLines={1}>
            {item.title}
          </CText>
          <CText
            type={'R10'}
            color={Colors.Gray70}
            numberOfLines={1}
            style={styles.mt5}>
            {item.subTitle}
          </CText>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.mainContainerWhite}>
      <CHeader isHideBack title={String.myBook} />

      <FlatList
        data={books}
        renderItem={item => renderMyBookData(item)}
        numColumns={2}
        key={2}
        ListEmptyComponent={
          <CText type={'M14'} color={Colors.Gray70} align={'center'}>
            {isAuthenticated
              ? 'No books yet — your purchases live here.'
              : 'Log in to see your books.'}
          </CText>
        }
      />
    </View>
  );
}

const localStyle = StyleSheet.create({
  mainViewContainer: {
    ...styles.mainContainerWhite,
    ...styles.ph20,
  },
  imageBackgroundStyle: {
    backgroundColor: Colors.secondary,
    borderRadius: moderateScale(4),
    height: moderateScale(221),
    width: '105%',
    ...styles.mv10,
  },
  bookImageStyle: {
    height: '90%',
    width: '83%',
    ...styles.selfCenter,
    ...styles.mv10,
    borderRadius: moderateScale(4),
  },
  bookTextContainer: {
    bottom: moderateScale(5),
  },
});
