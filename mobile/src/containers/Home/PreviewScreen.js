import {StyleSheet, TouchableOpacity, View, ActivityIndicator, ScrollView} from 'react-native';
import React, {useState, useMemo} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {useQuery, useMutation} from '@tanstack/react-query';

// custom import
import CText from '../../components/common/CText';
import {styles} from '../../Theme';
import {Colors} from '../../Theme/Colors';
import {getHeight, moderateScale} from '../../common/constant';
import KeyboardAvoidingView from '../../components/common/KeyboardAvoidingView';
import CHeader from '../../components/common/CHeader';
import {MenuBarIcon} from '../../assets/svg';
import String from '../../i18n/String';
import ReadBookChapterModal from '../../components/Modals/ReadBookChapterModal';
import {StackNav, AuthNav} from '../../Navigation/NavigationKeys';
import {trpc} from '../../api/client';
import {useAuth} from '../../api/AuthContext';

export default function PreviewScreen({route}) {
  const slug = route?.params?.slug;
  const navigation = useNavigation();
  const {isAuthenticated} = useAuth();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [chunks, setChunks] = useState({});
  const [token, setToken] = useState(null);
  const [totalChunks, setTotalChunks] = useState(0);

  const {data: meta} = useQuery({
    queryKey: ['book.bySlug', slug],
    queryFn: () => trpc.book.bySlug.query({slug}),
    enabled: !!slug,
  });
  const bookId = meta?.id;

  const {data: readData, isLoading} = useQuery({
    queryKey: ['book.read', bookId],
    queryFn: () => trpc.book.read.query({id: bookId}),
    enabled: !!bookId && isAuthenticated,
    onSuccess: res => {
      setChunks({0: res.chunk});
      setToken(res.token);
      setTotalChunks(res.chunks);
    },
  });

  const {data: purchased} = useQuery({
    queryKey: ['book.hasPurchased', bookId],
    queryFn: () => trpc.book.hasPurchased.query({id: bookId}),
    enabled: isAuthenticated && !!bookId,
  });

  const readChunk = useMutation({
    mutationFn: ({tok, chunk}) =>
      trpc.book.readChunk.mutate({token: tok, chunk}),
    onSuccess: (res, vars) => {
      setChunks(prev => ({...prev, [vars.chunk]: res.chunk}));
      setChapterIndex(vars.chunk);
    },
  });

  const saveProgress = useMutation({
    mutationFn: ({bookId: bid, chunk, scrollPercent}) =>
      trpc.book.saveProgress.mutate({bookId: bid, chunk, scrollPercent}),
  });

  const isFree = meta?.price === '0' || meta?.price === '0.00';
  const fullAccess = isFree || !!purchased;

  // Free sample for visitors who haven't bought (public, no login needed).
  const {data: sample} = useQuery({
    queryKey: ['book.preview', slug],
    queryFn: () => trpc.book.preview.query({slug}),
    enabled: !!slug && !!meta && !isFree && !purchased,
  });

  const goToChapter = (next: number) => {
    if (next < 0 || (totalChunks > 0 && next >= totalChunks)) return;
    if (chunks[next] !== undefined) {
      setChapterIndex(next);
    } else if (token) {
      readChunk.mutate({tok: token, chunk: next});
    }
    if (bookId) saveProgress.mutate({bookId, chunk: next, scrollPercent: 0});
  };

  const paragraphs = useMemo(() => {
    const text = fullAccess
      ? (chunks[chapterIndex] ?? '')
      : (sample?.preview ?? '');
    return text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  }, [chunks, chapterIndex, fullAccess, sample]);

  const onPressRightIcon = () => {
    setIsModalVisible(true);
  };

  const onpressCloseModal = () => {
    setIsModalVisible(false);
  };

  if (isLoading) {
    return (
      <View style={[styles.flex, styles.center]}>
        <ActivityIndicator size="large" color={Colors.Primary} />
      </View>
    );
  }

  return (
    <View style={localStyle.mainContainer}>
      <KeyboardAvoidingView containerStyle={styles.flexGrow1}>
        <CHeader
          title={meta?.title}
          textStyle={localStyle.headerStyle}
          rightIcon={<RightIcon onPress={onPressRightIcon} />}
        />
        <ScrollView showsVerticalScrollIndicator={false}>
          <CText
            type={'S18'}
            align={'center'}
            color={Colors.ErrorAlert}
            style={styles.mt10}>
            {String.partOne}
          </CText>
          <CText
            type={'D32'}
            color={Colors.Black}
            align={'center'}
            numberOfLines={2}
            style={localStyle.chapterTextStyle}>
            {fullAccess ? `${String.chapter} ${chapterIndex + 1}` : 'Free sample'}
          </CText>
          <View style={localStyle.dotContainerStyle}>
            <View style={localStyle.dotStyle} />
            <View style={localStyle.dotStyle} />
            <View style={localStyle.dotStyle} />
          </View>
          {paragraphs.map((p, i) => (
            <CText
              key={`${fullAccess ? chapterIndex : 'sample'}-${i}`}
              type={'R14'}
              color={Colors.Black}
              style={localStyle.paragraphTextStyle}>
              {p}
            </CText>
          ))}
          {!fullAccess && meta ? (
            <View style={localStyle.buyCta}>
              <CText type={'S16'} color={Colors.Black} align={'center'}>
                End of free sample
              </CText>
              <CText
                type={'M14'}
                color={Colors.Gray70}
                align={'center'}
                style={styles.mt5}>
                {`Buy ${meta.title} for ₦${meta.price} to keep reading.`}
              </CText>
              <TouchableOpacity
                style={localStyle.buyCtaBtn}
                onPress={() =>
                  isAuthenticated
                    ? navigation.navigate(StackNav.PaymentDetailsScreen, {
                        slug,
                      })
                    : navigation.navigate(AuthNav.SignInScreen)
                }>
                <CText type={'S16'} color={Colors.White} align={'center'}>
                  {isAuthenticated ? `Buy — ₦${meta.price}` : 'Log in to buy'}
                </CText>
              </TouchableOpacity>
            </View>
          ) : null}
          {readChunk.isLoading && (
            <ActivityIndicator
              size="small"
              color={Colors.Primary}
              style={styles.mv10}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      {fullAccess ? (
      <View style={localStyle.pageHandleContainer}>
        <TouchableOpacity onPress={() => goToChapter(chapterIndex - 1)}>
          <Ionicons name="arrow-back" size={moderateScale(30)} />
        </TouchableOpacity>
        <CText type={'M12'} color={Colors.Gray70}>
          {String.chapter}
          <CText type={'B16'} color={Colors.Black}>
            {'  '}
            {chapterIndex + 1}
          </CText>
        </CText>
        <View style={localStyle.lineStyle} />
        <CText type={'M12'} color={Colors.Gray70}>
          {String.total}
          <CText type={'B16'} color={Colors.Black}>
            {'  '} {totalChunks || readData?.chunks || 0}
          </CText>
        </CText>
        <TouchableOpacity onPress={() => goToChapter(chapterIndex + 1)}>
          <Ionicons name="arrow-forward" size={moderateScale(30)} />
        </TouchableOpacity>
      </View>
      ) : null}
      <ReadBookChapterModal
        visible={isModalVisible}
        onPressClose={onpressCloseModal}
      />
    </View>
  );
}

function RightIcon({onPress}) {
  return (
    <TouchableOpacity style={localStyle.rightIconStyle} onPress={onPress}>
      <MenuBarIcon />
    </TouchableOpacity>
  );
}

const localStyle = StyleSheet.create({
  mainContainer: {
    ...styles.flex,
    ...styles.ph15,
    backgroundColor: Colors.White,
  },
  headerStyle: {
    ...styles.ml30,
  },
  rightIconStyle: {
    backgroundColor: Colors.Gray30,
    borderRadius: moderateScale(24),
    height: moderateScale(45),
    width: moderateScale(45),
    ...styles.center,
  },
  chapterTextStyle: {
    ...styles.mt10,
    ...styles.mh30,
    ...styles.mb10,
  },
  dotContainerStyle: {
    ...styles.flexRow,
    ...styles.center,
  },
  dotStyle: {
    height: moderateScale(5),
    backgroundColor: Colors.Gray50,
    borderRadius: moderateScale(8),
    width: moderateScale(5),
    ...styles.m10,
  },
  paragraphTextStyle: {
    ...styles.mb15,
    lineHeight: getHeight(26),
  },
  buyCta: {
    ...styles.mt20,
    backgroundColor: Colors.secondary,
    borderRadius: moderateScale(8),
    ...styles.p15,
    ...styles.center,
  },
  buyCtaBtn: {
    backgroundColor: Colors.Primary,
    borderRadius: moderateScale(8),
    ...styles.ph20,
    ...styles.pv10,
    ...styles.mt10,
    minWidth: '70%',
    ...styles.selfCenter,
  },
  pageHandleContainer: {
    ...styles.flex0,
    ...styles.rowSpaceBetween,
    ...styles.m10,
  },
  lineStyle: {
    width: moderateScale(12),
    backgroundColor: Colors.Black,
    height: moderateScale(1),
  },
});
