import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useRef, useState, useEffect, useMemo} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useQuery} from '@tanstack/react-query';

// custom import
import CText from '../../components/common/CText';
import CHeader from '../../components/common/CHeader';
import String from '../../i18n/String';
import {styles} from '../../Theme';
import {Colors} from '../../Theme/Colors';
import {moderateScale} from '../../common/constant';
import CTextInput from '../../components/common/CTextInput';
import BookTypeComponents from '../../components/Hometab/BookTypeComponents';
import BookDataComponents from '../../components/Hometab/BookDataComponents';
import RecommendationBookComponents from '../../components/Hometab/RecommendationBookComponents';
import KeyboardAvoidingView from '../../components/common/KeyboardAvoidingView';
import {FilterIcon} from '../../assets/svg';
import {StackNav} from '../../Navigation/NavigationKeys';
import FilterModal from '../../components/Modals/FilterModal';
import {trpc} from '../../api/client';
import {mapBook, withRatings, toCardItem} from '../../api/mappers';

export default function ExploreTab(props) {
  let {navigation} = props;
  const categoryRef = useRef(null);

  const [searchText, setSearchText] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');

  const {data: books} = useQuery({
    queryKey: ['book.list'],
    queryFn: () => trpc.book.list.query(),
  });
  const ids = useMemo(() => (books ?? []).map(b => b.id), [books]);
  const {data: ratings} = useQuery({
    queryKey: ['book.ratings', ids.join(',')],
    queryFn: () => trpc.book.ratings.query({ids}),
    enabled: ids.length > 0,
  });
  const items = useMemo(
    () => withRatings((books ?? []).map(mapBook), ratings).map(toCardItem),
    [books, ratings],
  );

  const searching = debouncedQ.length > 0;
  const {data: foundBooks} = useQuery({
    queryKey: ['book.search', debouncedQ],
    queryFn: () => trpc.book.search.query({q: debouncedQ}),
    enabled: searching,
  });
  const {data: foundRatings} = useQuery({
    queryKey: ['book.ratings', `s:${debouncedQ}`],
    queryFn: () =>
      trpc.book.ratings.query({ids: (foundBooks ?? []).map(b => b.id)}),
    enabled: searching && (foundBooks ?? []).length > 0,
  });
  const searchData = useMemo(
    () =>
      withRatings((foundBooks ?? []).map(mapBook), foundRatings).map(
        toCardItem,
      ),
    [foundBooks, foundRatings],
  );

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(searchText.trim()), 400);
    return () => clearTimeout(t);
  }, [searchText]);

  const onChangeSearchField = text => {
    setSearchText(text);
  };

  const onPressBook = item => {
    navigation.navigate(StackNav.BookPreviewScreen, {slug: item.slug});
  };
  const onPressSearch = () => {
    navigation.navigate(StackNav.SearchScreen);
  };
  const onPressFilter = () => {
    categoryRef?.current?.show();
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
  const LeftIcon = () => {
    return (
      <TouchableOpacity onPress={onPressSearch}>
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
        <TouchableOpacity
          style={localStyle.inputRightIcnStyle}
          onPress={() => onPressFilter()}>
          <FilterIcon />
        </TouchableOpacity>
      </View>
    );
  };

  const renderRecommendationBookData = ({item}) => (
    <RecommendationBookComponents
      item={item}
      onPress={() => onPressBook(item)}
    />
  );

  return (
    <View style={localStyle.mainContainer}>
      <CHeader isHideBack title={String.explore} />
      <KeyboardAvoidingView containerStyle={styles.flexGrow1}>
        <View style={localStyle.topContainer}>
          <CTextInput
            value={searchText}
            onChangeText={onChangeSearchField}
            placeHolder={String.search1}
            containerStyle={localStyle.ipContainerStyle}
            LeftIcon={() => <LeftIcon />}
            RightIcon={() => <RightIcon />}
          />
        </View>

        <BookTypeComponents
          activebgColor={Colors.ItemBackgroundColor}
          activeTxtColor={Colors.Primary}
          horizontal={true}
        />

        <FlatList
          keyExtractor={(item, index) => index.toString()}
          data={items}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderBookData}
        />

        <View style={localStyle.middleContainerStyle}>
          <CText type={'S16'} color={Colors.Black}>
            {searching ? `Results for "${debouncedQ}"` : String.recommendation}
          </CText>
          <TouchableOpacity>
            <CText type={'S14'} color={Colors.Primary}>
              {String.seeAll}
            </CText>
          </TouchableOpacity>
        </View>

        <FlatList
          keyExtractor={(item, index) => index.toString()}
          data={searching ? searchData : items}
          vertical
          showsVerticalScrollIndicator={false}
          renderItem={renderRecommendationBookData}
        />
      </KeyboardAvoidingView>
      <FilterModal SheetRef={categoryRef} />
    </View>
  );
}

const localStyle = StyleSheet.create({
  mainContainer: {
    ...styles.flex,
    backgroundColor: Colors.White,
    ...styles.ph20,
  },
  lineStyle: {
    backgroundColor: Colors.Borderline,
    width: moderateScale(1),
    ...styles.mr5,
    ...styles.selfCenter,
    height: moderateScale(18),
  },
  topContainer: {
    ...styles.selfCenter,
  },
  ipContainerStyle: {
    backgroundColor: Colors.secondary,
    borderRadius: moderateScale(24),
  },
  inputRightIcnStyle: {
    ...styles.mr10,
    ...styles.p5,
  },
  middleContainerStyle: {
    ...styles.rowSpaceBetween,
    ...styles.mb10,
  },
});
