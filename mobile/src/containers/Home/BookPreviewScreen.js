import {
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import React, {useMemo} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';

// custom import
import {moderateScale} from '../../common/constant';
import String from '../../i18n/String';
import {Colors} from '../../Theme/Colors';
import {styles} from '../../Theme';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import {StackNav} from '../../Navigation/NavigationKeys';
import {trpc} from '../../api/client';
import {mapBook, withRatings} from '../../api/mappers';
import {useAuth} from '../../api/AuthContext';

export default function BookPreviewScreen({route}) {
  const slug = route?.params?.slug;
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const {isAuthenticated} = useAuth();

  const {data: rawBook, isLoading} = useQuery({
    queryKey: ['book.bySlug', slug],
    queryFn: () => trpc.book.bySlug.query({slug}),
    enabled: !!slug,
  });

  const bookId = rawBook?.id;
  const {data: ratingRows} = useQuery({
    queryKey: ['book.ratings', String(bookId ?? '')],
    queryFn: () => trpc.book.ratings.query({ids: [bookId]}),
    enabled: !!bookId,
  });

  const item = useMemo(() => {
    if (!rawBook) return null;
    const [mapped] = withRatings([mapBook(rawBook)], ratingRows);
    return {
      ...mapped,
      msg: mapped.author,
      originalPrice: mapped.priceLabel,
      withoutDiscountPrice: null,
      ratingStar: null,
      rating: mapped.rating ? Number(mapped.rating).toFixed(1) : 'New',
    };
  }, [rawBook, ratingRows]);

  const {data: wishlisted} = useQuery({
    queryKey: ['wishlist.check', bookId],
    queryFn: () => trpc.wishlistItems.check.query({bookId}),
    enabled: isAuthenticated && !!bookId,
  });

  const toggleWishlist = useMutation({
    mutationFn: () =>
      wishlisted
        ? trpc.wishlistItems.remove.mutate({bookId})
        : trpc.wishlistItems.add.mutate({bookId}),
    onSuccess: () =>
      queryClient.invalidateQueries({queryKey: ['wishlist.check', bookId]}),
  });

  const onPressLikeButton = () => {
    if (!isAuthenticated || !bookId) return;
    toggleWishlist.mutate();
  };

  const onPressButton = () => {
    navigation.navigate(StackNav.PaymentDetailsScreen, {slug});
  };

  const onPressPreviewButton = () => {
    navigation.navigate(StackNav.PreviewScreen, {slug});
  };
  const OnPressBack = () => {
    navigation.goBack();
  };

  const RightIcon = () => {
    return (
      <TouchableOpacity
        onPress={onPressLikeButton}
        style={localStyle.likeBtnStyle}>
        <Ionicons
          name={wishlisted ? 'heart' : 'heart-outline'}
          size={moderateScale(24)}
          color={Colors.LikeColor}
        />
      </TouchableOpacity>
    );
  };

  const LeftIcon = () => {
    return (
      <TouchableOpacity
        onPress={OnPressBack}
        style={[localStyle.backIconStyle]}>
        <Ionicons
          name="arrow-back-outline"
          size={moderateScale(24)}
          style={styles.m5}
          color={Colors.Black}></Ionicons>
      </TouchableOpacity>
    );
  };

  if (isLoading || !item) {
    return (
      <View style={[styles.flex, styles.center]}>
        <ActivityIndicator size="large" color={Colors.Primary} />
      </View>
    );
  }

  return (
    <ImageBackground
      source={item.image}
      style={localStyle.backgroundImageStyle}>
      <View style={localStyle.mainContainer}>
        <LeftIcon />
        <CText type={'D18'} style={localStyle.container} color={Colors.White}>
          {String.Preview}
        </CText>
        <RightIcon />
      </View>
      <View style={localStyle.bottomContainer}>
        <CText type={'B18'} color={Colors.Black} numberOfLines={2}>
          {item.title}
        </CText>
        <CText type={'M14'} color={Colors.Gray80} style={styles.mt10}>
          {item.msg}
        </CText>
        <View style={[styles.rowSpaceBetween, styles.mt10]}>
          <View style={styles.rowSpaceBetween}>
            <CText type={'B16'} color={Colors.Black}>
              {item.originalPrice}
            </CText>
            {item.withoutDiscountPrice ? (
              <CText type={'R12'} color={Colors.Red} style={styles.ml10}>
                {item.withoutDiscountPrice}
              </CText>
            ) : null}
          </View>

          <View style={styles.rowSpaceBetween}>
            {item.ratingStar}
            <CText type={'B16'} color={Colors.Black} style={styles.ml5}>
              {item.rating}
            </CText>
          </View>
        </View>
        <View style={localStyle.bottomLineStyle} />
        <View style={styles.rowSpaceBetween}>
          <CButton
            title={String.readPreviews}
            color={Colors.White}
            onPress={onPressPreviewButton}
            type={'M14'}
            containerStyle={[
              localStyle.btnStyle,
              {
                backgroundColor: Colors.White,
                borderColor: Colors.Primary,
              },
            ]}
            style={{color: Colors.Primary}}
          />
          <CButton
            title={[String.buy, item.originalPrice]}
            color={Colors.White}
            type={'M14'}
            onPress={() => onPressButton()}
            containerStyle={[
              localStyle.btnStyle,
              {
                backgroundColor: Colors.Primary,
                borderColor: Colors.Primary,
              },
            ]}
            style={{color: Colors.White}}
          />
        </View>
      </View>
    </ImageBackground>
  );
}

const localStyle = StyleSheet.create({
  backgroundImageStyle: {
    resizeMode: 'cover',
    ...styles.flex,
    ...styles.justifySpaceBetween,
  },
  mainContainer: {
    ...styles.mv10,
    ...styles.rowSpaceBetween,
  },
  backIconStyle: {
    backgroundColor: Colors.White,
    borderRadius: moderateScale(24),
    height: moderateScale(45),
    width: moderateScale(45),
    ...styles.center,
    ...styles.ml20,
    ...styles.mv10,
  },
  likeBtnStyle: {
    backgroundColor: Colors.White,
    borderRadius: moderateScale(24),
    height: moderateScale(45),
    width: moderateScale(45),
    ...styles.center,
    ...styles.mr20,
    ...styles.mv10,
  },
  bottomContainer: {
    height: moderateScale(247),
    width: '90%',
    backgroundColor: Colors.White,
    ...styles.selfCenter,
    borderRadius: moderateScale(8),
    ...styles.ph20,
    ...styles.pv20,
    bottom: moderateScale(20),
  },
  bottomLineStyle: {
    backgroundColor: Colors.Borderline,
    height: moderateScale(2),
    ...styles.mv15,
  },
  btnStyle: {
    width: '47%',
    height: moderateScale(46),
    ...styles.mv10,
    borderWidth: moderateScale(1),
  },
});
