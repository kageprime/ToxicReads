import {Image, StyleSheet, View, Linking, ActivityIndicator} from 'react-native';
import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useQuery, useMutation} from '@tanstack/react-query';

// Custom Imports
import CHeader from '../../components/common/CHeader';
import String from '../../i18n/String';
import KeyboardAvoidingView from '../../components/common/KeyboardAvoidingView';
import {styles} from '../../Theme';
import {Colors} from '../../Theme/Colors';
import {moderateScale} from '../../common/constant';
import CText from '../../components/common/CText';
import CTextInput from '../../components/common/CTextInput';
import CButton from '../../components/common/CButton';
import {StackNav} from '../../Navigation/NavigationKeys';
import {trpc} from '../../api/client';
import {mapBook} from '../../api/mappers';
import {useAuth} from '../../api/AuthContext';

// Fallback if the user abandons the browser tab mid-payment.
const CALLBACK_ORIGIN = 'https://toxic-reads.vercel.app';

export default function PaymentDetailsScreen({route}) {
  const slug = route?.params?.slug;
  const navigation = useNavigation();
  const {isAuthenticated} = useAuth();

  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');

  const {data: rawBook} = useQuery({
    queryKey: ['book.bySlug', slug],
    queryFn: () => trpc.book.bySlug.query({slug}),
    enabled: !!slug,
  });
  const book = rawBook ? mapBook(rawBook) : null;

  const initPayment = useMutation({
    mutationFn: ({bookId, email: em}) =>
      trpc.purchase.paystackInit.mutate({
        bookId,
        email: em,
        callbackBase: CALLBACK_ORIGIN,
      }),
    onSuccess: async data => {
      if (data.free) {
        navigation.navigate(StackNav.PreviewScreen, {slug});
        return;
      }
      await Linking.openURL(data.authorizationUrl);
      navigation.navigate(StackNav.PaymentSuccessfulScreen, {
        reference: data.reference,
        slug,
      });
    },
    onError: e => setFormError(e?.message || 'Could not start checkout.'),
  });

  const onPressPayNow = () => {
    if (!isAuthenticated || !book) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError('Enter a valid email for your receipt');
      return;
    }
    setFormError('');
    initPayment.mutate({bookId: book.id, email: email.trim()});
  };

  const SubTextContainer = ({
    title,
    value,
    type = 'M14',
    type1 = 'B14',
    color,
    style,
  }) => {
    return (
      <View style={[styles.rowSpaceBetween, styles.mt15, style]}>
        <CText type={type} color={!!color ? color : Colors.Gray70}>
          {title}
        </CText>
        <CText type={type1} color={Colors.Black}>
          {value}
        </CText>
      </View>
    );
  };

  return (
    <View style={localStyle.mainContainer}>
      <CHeader title={String.paymentDetail} />
      <KeyboardAvoidingView containerStyle={[styles.flexGrow1, styles.ph20]}>
        {book ? (
          <>
            <Image source={book.image} style={localStyle.imageStyle} />
            <View style={[styles.flexRow, styles.flexCenter]}>
              <Image source={book.image} style={localStyle.bookImageStyle} />
              <View style={styles.flex}>
                <CText type={'D16'} color={Colors.Black} numberOfLines={1}>
                  {book.title}
                </CText>
                <CText type={'M12'} color={Colors.Gray60}>
                  {book.author}
                </CText>
              </View>
            </View>
            <CText type={'B14'} color={Colors.Black} style={styles.m10}>
              {String.priceDetail}
            </CText>
            <View style={localStyle.priceDetailsStyle}>
              <SubTextContainer
                title={String.price}
                value={book.priceLabel}
                style={styles.mt0}
              />
              <View style={localStyle.lineStyle} />
              <SubTextContainer
                title={String.total}
                value={book.priceLabel}
                color={Colors.Black}
                type={'S16'}
                type1="S20"
                style={styles.mt0}
              />
            </View>
            <CText type={'B14'} color={Colors.Black} style={styles.mt10}>
              Email for receipt
            </CText>
            <CTextInput
              value={email}
              onChangeText={setEmail}
              placeholder={'you@example.com'}
              keyBoardType={'email-address'}
              autoCapitalize={'none'}
            />
            {formError ? (
              <CText type={'M14'} color={Colors.ErrorAlert} align={'center'}>
                {formError}
              </CText>
            ) : null}
            <CButton
              title={initPayment.isLoading ? 'Starting…' : `Pay ${book.priceLabel}`}
              color={Colors.White}
              type={'S16'}
              containerStyle={localStyle.lastBtnStyle}
              onPress={onPressPayNow}
            />
            <CText type={'M12'} color={Colors.Gray70} align={'center'}>
              Cards, transfer & USSD — secured by Paystack
            </CText>
          </>
        ) : (
          <ActivityIndicator
            size="large"
            color={Colors.Primary}
            style={styles.m20}
          />
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const localStyle = StyleSheet.create({
  mainContainer: {
    ...styles.mainContainerWhite,
  },
  imageStyle: {
    width: '100%',
    height: moderateScale(184),
    borderRadius: moderateScale(8),
  },
  bookImageStyle: {
    height: moderateScale(40),
    width: moderateScale(40),
    borderRadius: moderateScale(8),
    ...styles.m10,
  },
  priceDetailsStyle: {
    backgroundColor: Colors.secondary,
    width: '100%',
    borderRadius: moderateScale(8),
    ...styles.ph20,
    ...styles.pv15,
    ...styles.justifyCenter,
  },
  lineStyle: {
    ...styles.mv20,
    height: moderateScale(1),
    backgroundColor: Colors.Borderline,
  },
  lastBtnStyle: {
    ...styles.mt20,
    ...styles.mb10,
  },
});
