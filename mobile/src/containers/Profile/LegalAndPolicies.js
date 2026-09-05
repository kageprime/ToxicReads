import {StyleSheet, View, ScrollView, FlatList} from 'react-native';
import React from 'react';

// custom import
import {styles} from '../../Theme';
import CHeader from '../../components/common/CHeader';
import String from '../../i18n/String';
import CText from '../../components/common/CText';
import {Colors} from '../../Theme/Colors';
import {moderateScale} from '../../common/constant';
import {LegalAndPoliciesData} from '../../api/constant';

export default function LegalAndPolicies() {
  const renderLegalAndPolicies = ({item}) => {
    return (
      <View style={localStyle.mainContainer}>
        <CText type={'B16'} color={Colors.Black}>
          {item.title}
        </CText>
        <CText type={'M14'} color={Colors.Gray60} style={localStyle.TextStyle}>
          {item.description}
        </CText>
        <CText type={'M14'} color={Colors.Gray60} style={localStyle.TextStyle}>
          {item.description1}
        </CText>
      </View>
    );
  };
  return (
    <View style={styles.mainContainerWhite}>
      <CHeader title={String.legalandPolicies} />
      <ScrollView
        showsVerticalScrollIndicator={true}
        bounces={false}
        scrollEventThrottle={16}>
        <FlatList
          data={LegalAndPoliciesData}
          renderItem={renderLegalAndPolicies}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          bounces={false}
          vertical
        />
      </ScrollView>
    </View>
  );
}

const localStyle = StyleSheet.create({
  mainContainer: {
    ...styles.ph20,
    ...styles.mt10,
  },
  TextStyle: {
    ...styles.mt5,
    lineHeight: moderateScale(22),
  },
  scrollIndicatorStyle: {
    backgroundColor: Colors.Primary,
  },
});
