import {StyleSheet, View, TouchableOpacity} from 'react-native';
import React, {memo} from 'react';
import Icons from 'react-native-vector-icons/AntDesign';

// custom import
import {Colors} from '../../Theme/Colors';
import {FlatList} from 'react-native';
import {moderateScale} from '../../common/constant';
import {styles} from '../../Theme';

const RatingComponents = ({count, onPressStar, containerStyle}) => {

  const renderStar = () => {
    return (
      <View style={styles.center}>
        {!!count ? (
          <Icons
            name="star"
            color={Colors.WarningAlert}
            size={moderateScale(16)}
            style={styles.mr5}
          />
        ) : null}
      </View>
    );
  };
  return (
    <TouchableOpacity
      style={[localStyle.reviewContainer, containerStyle]}
      onPress={onPressStar}>
      <FlatList
        data={Array(count)
          .fill()
          .map((_, count) => count + 1)}
        renderItem={renderStar}
        keyExtractor={(item, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        bounces={false}
        horizontal
      />
    </TouchableOpacity>
  );
};

export default memo(RatingComponents);

const localStyle = StyleSheet.create({
  reviewContainer: {
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(24),
    height: moderateScale(32),
    ...styles.ph20,
    ...styles.mr20,
    ...styles.mv5,
  },
});
