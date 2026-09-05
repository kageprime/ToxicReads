import {StyleSheet, View, TouchableOpacity, FlatList} from 'react-native';
import React, {useState, useEffect, useMemo} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';

// custom import
import {styles} from '../../Theme';
import CHeader from '../../components/common/CHeader';
import String from '../../i18n/String';
import CTextInput from '../../components/common/CTextInput';
import {Colors} from '../../Theme/Colors';
import {moderateScale} from '../../common/constant';
import {FilterIcon} from '../../assets/svg';
import {StackNav} from '../../Navigation/NavigationKeys';
import {trpc} from '../../api/client';
import {mapBook, withRatings, toCardItem} from '../../api/mappers';
import BookTypeComponents from '../../components/Hometab/BookTypeComponents';
import RecommendationBookComponents from '../../components/Hometab/RecommendationBookComponents';
import KeyboardAvoidingView from '../../components/common/KeyboardAvoidingView';

export default function SearchScreen() {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(searchText.trim()), 400);
    return () => clearTimeout(t);
  }, [searchText]);

  const searching = debouncedQ.length > 0;
  const {data: browseBooks} = useQuery({
    queryKey: ['book.list'],
    queryFn: () => trpc.book.list.query(),
    enabled: !searching,
  });
  const {data: foundBooks} = useQuery({
    queryKey: ['book.search', debouncedQ],
    queryFn: () => trpc.book.search.query({q: debouncedQ}),
    enabled: searching,
  });

  const rawBooks = searching ? foundBooks : browseBooks;
  const ids = useMemo(() => (rawBooks ?? []).map(b => b.id), [rawBooks]);
  const {data: ratings} = useQuery({
    queryKey: ['book.ratings', ids.join(',')],
    queryFn: () => trpc.book.ratings.query({ids}),
    enabled: ids.length > 0,
  });

  const searchData = useMemo(
    () => withRatings((rawBooks ?? []).map(mapBook), ratings).map(toCardItem),
    [rawBooks, ratings],
  );

  const onChangeTextSearch = item => {
    setSearchText(item);
  };

  const onpressClose = () => {
    setSearchText('');
  };

  const onPressBook = item => {
    navigation.navigate(StackNav.BookPreviewScreen, {slug: item.slug});
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
        <TouchableOpacity onPress={onpressClose}>
          <Ionicons
            name={'close'}
            color={Colors.Black}
            size={moderateScale(18)}
            style={styles.m5}
          />
        </TouchableOpacity>
        <View style={localStyle.lineStyle} />
        <TouchableOpacity style={localStyle.inputRightIcnStyle}>
          <FilterIcon />
        </TouchableOpacity>
      </View>
    );
  };

  const renderRecommendationBookData = ({item}) => (
    <RecommendationBookComponents item={item} onPress={() => onPressBook(item)} />
  );

  return (
    <View style={localStyle.mainContainer}>
      <KeyboardAvoidingView containerStyle={styles.flexGrow1}>
        <CHeader title={String.search} />
        <CTextInput
          value={searchText}
          onChangeText={onChangeTextSearch}
          placeHolder={String.search1}
          containerStyle={localStyle.searchContainerStyle}
          RightIcon={() => <RightIcon />}
          LeftIcon={() => <LeftIcon />}
        />
        <View style={localStyle.bookTypeContainer}>
          <BookTypeComponents
            activebgColor={Colors.ItemBackgroundColor}
            activeTxtColor={Colors.Primary}
            horizontal={true}
          />
        </View>
        <View style={localStyle.bookTypeContainer}>
          <FlatList
            keyExtractor={(item, index) => index.toString()}
            data={searchData}
            vertical
            showsVerticalScrollIndicator={false}
            renderItem={renderRecommendationBookData}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const localStyle = StyleSheet.create({
  mainContainer: {
    ...styles.flex,
    backgroundColor: Colors.White,
  },
  searchContainerStyle: {
    backgroundColor: Colors.White,
    borderWidth: moderateScale(1),
    borderColor: Colors.Primary,
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
  bookTypeContainer: {
    ...styles.ph20,
  },
});
