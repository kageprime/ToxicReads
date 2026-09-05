import {StyleSheet, View, TouchableOpacity, FlatList} from 'react-native';
import React, {useState, useEffect} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

// custom import
import {styles} from '../../Theme';
import CHeader from '../../components/common/CHeader';
import String from '../../i18n/String';
import {FilterIcon} from '../../assets/svg';
import {Colors} from '../../Theme/Colors';
import {moderateScale} from '../../common/constant';
import CText from '../../components/common/CText';
import {HelpAndSupportData} from '../../api/constant';
import HelpAndSupportComponents from '../../components/Hometab/HelpAndSupportComponents';
import KeyboardAvoidingView from '../../components/common/KeyboardAvoidingView';

export default function HelpAndSupport() {
  
  const [searchText, setSearchText] = useState('');
  const [searchData, setSearchData] = useState(HelpAndSupportData);

  const onChangeTextSearch = item => {
    setSearchText(item);
  };
  useEffect(() => {
    filterData();
  }, [searchText]);

  const filterData = () => {
    if (!!searchText) {
      const filteredData = HelpAndSupportData.filter(item =>
        item.title.toLowerCase().includes(searchText.toLowerCase()),
      );
      setSearchData(filteredData);
    } else {
      setSearchData(HelpAndSupportData);
    }
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

  const HelpAndSupportDescription = ({item}) => {
    return (
      <View style={styles.ph10}>
        <CText type={'M14'} color={Colors.GrayScale}>
          {item.description}
        </CText>
      </View>
    );
  };

  const renderIem = ({item}) => {
    return (
      <HelpAndSupportComponents
        title={String.helpAndSupportTitle}
        description={<HelpAndSupportDescription item={item} />}
      />
    );
  };

  return (
    <View style={styles.mainContainerWhite}>
      <CHeader title={String.helpandSupport} />
      <KeyboardAvoidingView containerStyle={styles.flexGrow1}>
        <CTextInput
          value={searchText}
          onChangeText={onChangeTextSearch}
          placeHolder={String.search1}
          containerStyle={localStyle.searchContainerStyle}
          RightIcon={() => <RightIcon />}
          LeftIcon={() => <LeftIcon />}
        />

        <FlatList
          data={searchData}
          renderItem={renderIem}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          vertical
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const localStyle = StyleSheet.create({
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
  helperContainer: {
    ...styles.mt15,
    backgroundColor: Colors.White,
  },
  helperInnerContainer: {
    ...styles.rowSpaceBetween,
    ...styles.p15,
  },
  helperDescription: {
    ...styles.p15,
  },
});
