import {StyleSheet, TouchableOpacity, FlatList} from 'react-native';
import React, {memo, useState} from 'react';

// custom import
import {styles} from '../../Theme';
import {Colors} from '../../Theme/Colors';
import {moderateScale} from '../../common/constant';
import CText from '../common/CText';
import {HomeTabData} from '../../api/constant';

const BookTypeComponents = props => {
  let {
    containerStyle,
    activebgColor,
    activeTxtColor,
    horizontal = false,
    numColumns,
  } = props;
  const [selectedCategory, setSelectedCategory] = useState([]);

  const onPressCategory = item => {
    setSelectedCategory(item);
  };

  const RenderBookTypeData = ({item}) => {
    return (
      <TouchableOpacity
        onPress={() => onPressCategory(item.name)}
        style={[
          localStyle.itemContainer,
          containerStyle,
          {
            backgroundColor: selectedCategory.includes(item.name)
              ? activebgColor
              : Colors.White,
            borderColor: selectedCategory.includes(item.name)
              ? activebgColor
              : Colors.Gray40,
          },
        ]}>
        <CText
          type={'M14'}
          align={'center'}
          color={
            selectedCategory.includes(item.name) ? activeTxtColor : Colors.Black
          }
          style={styles.mh15}>
          {item.name}
        </CText>
      </TouchableOpacity>
    );
  };
  return (
    <FlatList
      data={HomeTabData}
      renderItem={RenderBookTypeData}
      keyExtractor={(item, index) => index.toString()}
      showsHorizontalScrollIndicator={false}
      horizontal={horizontal}
      numColumns={numColumns}
    />
  );
};

export default memo(BookTypeComponents);

const localStyle = StyleSheet.create({
  itemContainer: {
    ...styles.center,
    borderRadius: moderateScale(16),
    height: moderateScale(38),
    ...styles.mr10,
    ...styles.mv10,
    borderWidth: moderateScale(1),
  },
});
