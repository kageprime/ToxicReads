import {FlatList, ScrollView, StyleSheet, View, Image} from 'react-native';
import React, {useState} from 'react';
import ProgressBar from 'react-native-progress/Bar';

// custom import
import {styles} from '../../Theme';
import CHeader from '../../components/common/CHeader';
import String from '../../i18n/String';
import CButton from '../../components/common/CButton';
import {Colors} from '../../Theme/Colors';
import CText from '../../components/common/CText';
import {moderateScale} from '../../common/constant';
import {FillStarIcon, UnFillStarIcon} from '../../assets/svg';
import {ReviewData} from '../../api/constant';
import WriteReview from '../../components/Modals/WriteReview';

export default function ReviewScreen({route}) {
  const item = route?.params?.item;

  const reviewSheerRef = React.useRef('');

  const onPressReview = () => reviewSheerRef.current?.show();

  const [rating, setRating] = useState(item.rating);

  const RenderProgressBar = ({count, rating}) => {
    return (
      <View style={localStyle.progressStyle}>
        <CText type={'S10'} color={Colors.Gray80} style={styles.mr10}>
          {count}
        </CText>
        <ProgressBar
          progress={rating}
          width={moderateScale(93)}
          color={Colors.Primary}
          style={localStyle.progressBar}
        />
      </View>
    );
  };

  const renderReviewData = ({item}) => {
    return (
      <View style={localStyle.containerStyle}>
        <Image source={item.image} style={localStyle.imageStyle} />
        <View style={styles.ml10}>
          <View style={styles.rowSpaceBetween}>
            <CText type={'S18'} color={Colors.Black}>
              {item.name}
            </CText>
            <CText type={'R14'} color={Colors.Gray80} style={styles.mt5}>
              {item.date}
            </CText>
          </View>
          <View style={localStyle.ratingStarStyle}>
            {[1, 2, 3, 4, 5].map(() => (
              <FillStarIcon />
            ))}
          </View>
          <CText type={'R14'} color={Colors.Black} numberOfLines={4}>
            {item.reviewText}
          </CText>
        </View>
      </View>
    );
  };

  const RenderData = () => {
    return <FlatList data={ReviewData} renderItem={renderReviewData} />;
  };

  return (
    <View style={styles.mainContainerWhite}>
      <CHeader title={String.review} />
      <ScrollView
        style={styles.ph20}
        bounces={false}
        showsVerticalScrollIndicator={false}>
        <View style={localStyle.ratingContainer}>
          <View>
            <CText type={'B32'} color={Colors.Black}>
              {item.rating}
            </CText>
            <View style={localStyle.ratingStarStyle}>
              {[1, 2, 3, 4, 5].map(index => (
                <View key={index}>
                  {index <= rating ? <FillStarIcon /> : <UnFillStarIcon />}
                </View>
              ))}
            </View>
            <CText type={'S10'} color={Colors.Gray80}>
              {String.basedOnReview}
            </CText>
          </View>
          <View>
            <RenderProgressBar count={1} rating={0.1} />
            <RenderProgressBar count={2} rating={0.3} />
            <RenderProgressBar count={3} rating={0.5} />
            <RenderProgressBar count={4} rating={0.7} />
            <RenderProgressBar count={5} rating={0.9} />
          </View>
        </View>
        <RenderData />
      </ScrollView>
      <CButton
        title={String.writeReview}
        color={Colors.White}
        type={'M14'}
        containerStyle={localStyle.btnStyle}
        onPress={onPressReview}
      />
      <WriteReview SheetRef={reviewSheerRef} />
    </View>
  );
}

const localStyle = StyleSheet.create({
  btnStyle: {
    ...styles.selfCenter,
    width: '60%',
    ...styles.mb10,
  },
  ratingContainer: {
    ...styles.flexRow,
    ...styles.justifySpaceBetween,
    ...styles.p20,
  },
  ratingStarStyle: {
    ...styles.flexRow,
    ...styles.mt5,
    ...styles.mb10,
  },
  containerStyle: {
    ...styles.flexRow,
    ...styles.mv10,
    width: '87%',
  },
  progressBar: {
    height: moderateScale(6),
    backgroundColor: Colors.secondary,
    borderRadius: moderateScale(8),
    color: Colors.Primary,
    borderColor: Colors.secondary,
  },
  progressStyle: {
    ...styles.flexRow,
    ...styles.mt5,
  },
  starContainer: {
    height: moderateScale(30),
    width: moderateScale(30),
    ...styles.mb10,
  },
  imageStyle: {
    height: moderateScale(45),
    width: moderateScale(45),
  },
});
