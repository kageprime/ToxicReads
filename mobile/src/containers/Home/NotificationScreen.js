import {
  SectionList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useMemo} from 'react';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';

// custom import
import {styles} from '../../Theme';
import CHeader from '../../components/common/CHeader';
import String from '../../i18n/String';
import CText from '../../components/common/CText';
import {Colors} from '../../Theme/Colors';
import {moderateScale} from '../../common/constant';
import {BellIcon} from '../../assets/svg';
import {StackNav} from '../../Navigation/NavigationKeys';
import {trpc} from '../../api/client';
import {useAuth} from '../../api/AuthContext';

export default function NotificationScreen({navigation}) {
  const {isAuthenticated} = useAuth();
  const queryClient = useQueryClient();

  const {data: notifications} = useQuery({
    queryKey: ['notifications.list'],
    queryFn: () => trpc.notifications.list.query(),
    enabled: isAuthenticated,
  });

  const markRead = useMutation({
    mutationFn: id => trpc.notifications.markRead.mutate({id}),
    onSuccess: () =>
      queryClient.invalidateQueries({queryKey: ['notifications.list']}),
  });

  const sections = useMemo(
    () => [{title: 'Latest', data: notifications ?? []}],
    [notifications],
  );

  const onPressItem = item => {
    if (!item.read) markRead.mutate(item.id);
    const match = /^\/book\/([^/]+)/.exec(item.link || '');
    if (match) {
      navigation.navigate(StackNav.BookPreviewScreen, {slug: match[1]});
    }
  };

  const RenderNotificationData = ({item}) => {
    return (
      <TouchableOpacity
        style={localStyle.innerContainer}
        onPress={() => onPressItem(item)}>
        <View style={localStyle.iconStyle}>
          <BellIcon />
        </View>

        <View style={[styles.flex, styles.mh15, styles.mt5]}>
          <View style={styles.rowSpaceBetween}>
            <View style={styles.flex}>
              <CText
                type={item.read ? 'M14' : 'S14'}
                color={Colors.Black}
                style={styles.mt5}>
                {item.message}
              </CText>
              <CText
                type={'M12'}
                color={Colors.Gray60}
                style={styles.mt5}
                numberOfLines={1}>
                {item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString()
                  : ''}
              </CText>
            </View>
          </View>
          <View>
            <View style={localStyle.lineView} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const RenderSectionHeader = ({section: {title}}) => {
    return (
      <CText
        type={'B14'}
        color={Colors.Gray70}
        numberOfLines={1}
        style={styles.mt15}>
        {title}
      </CText>
    );
  };

  return (
    <View style={styles.mainContainerWhite}>
      <CHeader title={String.notification} />
      <View style={styles.ph20}>
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => item + index}
          renderItem={RenderNotificationData}
          renderSectionHeader={RenderSectionHeader}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          bounces={false}
          ListEmptyComponent={
            <CText type={'M14'} color={Colors.Gray70} align={'center'}>
              {isAuthenticated
                ? 'You are all caught up.'
                : 'Log in to see your notifications.'}
            </CText>
          }
        />
      </View>
    </View>
  );
}

const localStyle = StyleSheet.create({
  innerContainer: {
    ...styles.rowSpaceBetween,
    ...styles.alignCenter,
  },
  renderContainer: {
    ...styles.p15,
    ...styles.pb20,
    ...styles.mb5,
  },
  lineView: {
    ...styles.mv15,
    borderRadius: moderateScale(10),
    borderBottomWidth: moderateScale(1),
    borderBottomColor: Colors.Borderline,
  },
  iconStyle: {
    height: moderateScale(40),
    width: moderateScale(40),
    bottom: moderateScale(17),
  },
});
