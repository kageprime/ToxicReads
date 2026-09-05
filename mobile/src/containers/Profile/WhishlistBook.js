import {StyleSheet, View, FlatList} from 'react-native';
import React, {useMemo} from 'react';
import {useQuery} from '@tanstack/react-query';

// custom import
import CHeader from '../../components/common/CHeader';
import String from '../../i18n/String';
import {styles} from '../../Theme';
import CText from '../../components/common/CText';
import {Colors} from '../../Theme/Colors';
import BookDataComponents from '../../components/Hometab/BookDataComponents';
import {StackNav} from '../../Navigation/NavigationKeys';
import {trpc} from '../../api/client';
import {useAuth} from '../../api/AuthContext';
import {mapBook, withRatings, toCardItem} from '../../api/mappers';

export default function WhishlistBook({navigation}) {
  const {isAuthenticated} = useAuth();
  const {data: items} = useQuery({
    queryKey: ['wishlist.list'],
    queryFn: () => trpc.wishlistItems.list.query(),
    enabled: isAuthenticated,
  });

  const rawBooks = useMemo(
    () => (items ?? []).map(i => i.book).filter(Boolean),
    [items],
  );
  const ids = useMemo(() => rawBooks.map(b => b.id), [rawBooks]);
  const {data: ratings} = useQuery({
    queryKey: ['book.ratings', ids.join(',')],
    queryFn: () => trpc.book.ratings.query({ids}),
    enabled: ids.length > 0,
  });
  const data = useMemo(
    () => withRatings(rawBooks.map(mapBook), ratings).map(toCardItem),
    [rawBooks, ratings],
  );

  const renderBookData = ({item, index}) => {
    return (
      <BookDataComponents
        item={item}
        index={index}
        onPress={() => onPressBook(item)}
      />
    );
  };
  const onPressBook = item => {
    navigation.navigate(StackNav.BookPreviewScreen, {slug: item.slug});
  };
  return (
    <View style={styles.mainContainerWhite}>
      <CHeader title={String.wishlistBook} />
      <FlatList
        keyExtractor={(item, index) => index.toString()}
        data={data}
        numColumns={2}
        showsHorizontalScrollIndicator={false}
        renderItem={renderBookData}
        contentContainerStyle={styles.ph20}
        ListEmptyComponent={
          <CText type={'M14'} color={Colors.Gray70} align={'center'}>
            {isAuthenticated
              ? 'Nothing saved yet — tap the heart on any book.'
              : 'Log in to see your wishlist.'}
          </CText>
        }
      />
    </View>
  );
}

const localStyle = StyleSheet.create({
  mainContainerWhite: {
    ...styles.ph20,
    ...styles.mt10,
  },
});
