import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Custom Imports
import CText from '../common/CText';
import {styles} from '../../Theme';
import {moderateScale} from '../../common/constant';
import {Colors} from '../../Theme/Colors';

const HelpAndSupportComponents = ({title, description}) => {
  const [isDescShow, setIsDescShow] = useState(false);

  const onPressShow = () => setIsDescShow(!isDescShow);

  return (
    <View style={styles.ph10}>
      <TouchableOpacity
        style={localStyle.helperContainer}
        onPress={onPressShow}>
        <View style={localStyle.helperInnerContainer}>
          <CText type={'S16'} color={Colors.Black}>
            {title}
          </CText>
          <Ionicons
            name={!isDescShow ? 'chevron-down-outline' : 'chevron-up-outline'}
            size={moderateScale(24)}
            color={Colors.Black}
            style={styles.mr5}
          />
        </View>
      </TouchableOpacity>
      {!!isDescShow && (
        <View style={localStyle.textContainer}>
          {!!description && description}
        </View>
      )}
    </View>
  );
};
export default HelpAndSupportComponents;

const localStyle = StyleSheet.create({
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
  textContainer: {
    borderTopWidth: moderateScale(1),
    ...styles.pv15,
    ...styles.ph15,
  },
  textContainer: {
    ...styles.mh15,
  },
});
