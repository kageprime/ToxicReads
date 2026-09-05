import {StyleSheet, View, Image, ActivityIndicator} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';

//custom import
import {styles} from '../../Theme';
import KeyboardAvoidingView from '../../components/common/KeyboardAvoidingView';
import CHeader from '../../components/common/CHeader';
import String from '../../i18n/String';
import images from '../../assets/images';
import {moderateScale} from '../../common/constant';
import CText from '../../components/common/CText';
import {Colors} from '../../Theme/Colors';
import CButton from '../../components/common/CButton';
import {StackNav, TabNav} from '../../Navigation/NavigationKeys';
import {trpc} from '../../api/client';
import {mapBook} from '../../api/mappers';

// Verifies a Paystack reference by polling (user returns from the browser).
const POLL_MS = 4000;
const MAX_TRIES = 40;

export default function PaymentSuccessfulScreen({route}) {
  const reference = route?.params?.reference;
  const slug = route?.params?.slug;
  const navigation = useNavigation();
  const tries = useRef(0);
  const [failed, setFailed] = useState(null);
  const [confirmed, setConfirmed] = useState(null);

  const {data: rawBook} = useQuery({
    queryKey: ['book.bySlug', slug],
    queryFn: () => trpc.book.bySlug.query({slug}),
    enabled: !!slug,
  });
  const book = rawBook ? mapBook(rawBook) : null;

  useEffect(() => {
    if (!reference) {
      setFailed('Missing payment reference.');
      return;
    }
    let alive = true;
    const tick = async () => {
      try {
        const res = await trpc.purchase.paystackVerify.mutate({reference});
        if (!alive) return;
        setConfirmed(res);
      } catch (e) {
        if (!alive) return;
        tries.current += 1;
        const msg = e?.message || '';
        // Terminal backend verdicts stop polling; "not completed yet" retries.
        if (
          tries.current >= MAX_TRIES ||
          /does not belong|does not match|configured/i.test(msg)
        ) {
          setFailed(msg || 'Payment could not be confirmed.');
        } else {
          setTimeout(tick, POLL_MS);
        }
      }
    };
    const t = setTimeout(tick, 2500);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [reference]);

  const onPressContinue = () => {
    navigation.navigate(TabNav.HomeTab);
  };
  const onPressRead = () => {
    if (slug) navigation.navigate(StackNav.PreviewScreen, {slug});
    else navigation.navigate(TabNav.HomeTab);
  };
  const onPressLibrary = () => {
    navigation.navigate(TabNav.MyBookTab);
  };

  const SubTextContainer = ({
    title,
    value,
    type = 'M14',
    type1 = 'B14',
    color = Colors.Black,
    style,
  }) => {
    return (
      <View style={[localStyle.innerViewContainer, style]}>
        <CText type={type} color={Colors.Black}>
          {title}
        </CText>
        <CText type={type1} color={color}>
          {value}
        </CText>
      </View>
    );
  };

  return (
    <View style={styles.mainContainerWhite}>
      <KeyboardAvoidingView containerStyle={styles.flexGrow1}>
        <CHeader title={String.paymentDetail} />
        <View style={styles.ph20}>
          <View style={localStyle.container}>
            <Image
              source={images.paymentSuccessfulImage}
              style={localStyle.imageStyle}
            />
            <CText
              type={'D28'}
              color={Colors.Black}
              align={'center'}
              style={styles.mt20}>
              {failed
                ? 'Payment not confirmed'
                : confirmed
                  ? String.paymentSuccess
                  : 'Confirming payment…'}
            </CText>
            {!confirmed && !failed ? (
              <ActivityIndicator
                size="large"
                color={Colors.Primary}
                style={styles.mt20}
              />
            ) : null}
          </View>

          <View>
            <CText type={'S16'} color={Colors.Black} style={styles.mv20}>
              {String.orderDetail}
            </CText>
            <View style={localStyle.bottomContainer}>
              <SubTextContainer
                title={String.invoiceNumber}
                color={Colors.Primary}
                value={reference ?? '—'}
              />
              <SubTextContainer
                title={String.price}
                value={book ? book.priceLabel : '—'}
              />
              <View style={localStyle.lineStyle} />
              <SubTextContainer
                title={String.total}
                value={book ? book.priceLabel : '—'}
                color={Colors.Primary}
                type={'S16'}
                type1="S20"
                style={styles.mb20}
              />
            </View>
            {failed ? (
              <CText type={'M14'} color={Colors.ErrorAlert} align={'center'}>
                {failed} If you were charged, your book appears in My Books
                automatically.
              </CText>
            ) : null}
          </View>
        </View>
      </KeyboardAvoidingView>
      {confirmed ? (
        <View style={localStyle.btnRow}>
          <CButton
            title={'Read now'}
            onPress={onPressRead}
            color={Colors.White}
            type={'S16'}
            containerStyle={localStyle.halfBtn}
          />
          <CButton
            title={String.continue}
            onPress={onPressContinue}
            color={Colors.White}
            type={'S16'}
            containerStyle={localStyle.halfBtn}
          />
        </View>
      ) : (
        <CButton
          title={failed ? 'Check my library' : String.continue}
          onPress={failed ? onPressLibrary : onPressContinue}
          color={Colors.White}
          type={'S16'}
          containerStyle={localStyle.btnStyle}
        />
      )}
    </View>
  );
}

const localStyle = StyleSheet.create({
  container: {
    ...styles.center,
    ...styles.mt20,
    ...styles.ph20,
  },
  imageStyle: {
    height: moderateScale(150),
    width: moderateScale(150),
  },
  bottomContainer: {
    backgroundColor: Colors.White,
    borderRadius: moderateScale(12),
    borderColor: Colors.White,
    ...styles.justifyCenter,
    ...styles.ph10,
    shadowColor: Colors.TextColor,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
    ...styles.mb10,
  },
  innerViewContainer: {
    ...styles.rowSpaceBetween,
    ...styles.mt15,
  },
  lineStyle: {
    ...styles.mb5,
    ...styles.mv20,
    height: moderateScale(1),
    backgroundColor: Colors.Borderline,
  },
  btnStyle: {
    ...styles.mb10,
    width: '90%',
    ...styles.selfCenter,
  },
  btnRow: {
    ...styles.rowSpaceBetween,
    ...styles.ph20,
    ...styles.mb10,
  },
  halfBtn: {
    width: '47%',
  },
});
