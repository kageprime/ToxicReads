import {
  ScrollView,
  StyleSheet,
  View,
  Image,
  SectionList,
  TouchableOpacity,
  Switch,
} from 'react-native';
import React, {useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

// custom import
import CHeader from '../../components/common/CHeader';
import String from '../../i18n/String';
import {styles} from '../../Theme';
import images from '../../assets/images';
import {moderateScale} from '../../common/constant';
import CText from '../../components/common/CText';
import {Colors} from '../../Theme/Colors';
import {ProfileCategoryData} from '../../api/constant';
import CButton from '../../components/common/CButton';
import LogOutModal from '../../components/Modals/LogOutModal';
import {useAuth} from '../../api/AuthContext';

export default function ProfileTab({navigation}) {
  const [isEnable, setIsEnable] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const {user, isAuthenticated} = useAuth();

  const toggleSwitch = value => {
    setIsEnable(value);
  };

  const onPressItem = item => {
    if (!!item.route) {
      navigation.navigate(item.route);
    }
  };
  const RenderItem = ({item, index}) => {
    return (
      <TouchableOpacity
        key={index}
        onPress={() => onPressItem(item)}
        style={localStyle.renderItemContainer}>
        <View style={styles.rowCenter}>
          {item.svgIcon}
          <CText type={'S16'} color={Colors.Black} style={styles.ml10}>
            {item.name}
          </CText>
        </View>
        {item.data ? (
          <CText type={'M12'} color={Colors.Gray80}>
            {item.data}
          </CText>
        ) : item.darkMode ? (
          <Switch
            onValueChange={toggleSwitch}
            trackColor={{false: Colors.Gray80, true: Colors.Black}}
            value={isEnable}
          />
        ) : (
          <Ionicons
            name={'chevron-forward-outline'}
            size={moderateScale(24)}
            color={Colors.GrayScale}
          />
        )}
      </TouchableOpacity>
    );
  };
  const RenderSectionHeader = ({section: {title}}) => {
    return (
      <CText type={'M12'} color={Colors.Black} style={styles.mv10}>
        {title}
      </CText>
    );
  };

  const onPressLogOut = () => {
    setIsVisible(!isVisible);
  };

  return (
    <View style={styles.mainContainerWhite}>
      <CHeader title={String.setting} />
      <ScrollView style={styles.ph20}>
        <View style={styles.flexRow}>
          <Image source={images.profileImage} style={localStyle.imageStyle} />
          <View style={localStyle.innerContainer}>
            <CText type={'S18'} color={Colors.Black}>
              {user?.name || user?.username || String.userName}
            </CText>
            <CText type={'S14'} color={Colors.Gray80}>
              {isAuthenticated ? `@${user?.username ?? ''}` : String.userEmail}
            </CText>
          </View>
        </View>
        <SectionList
          sections={ProfileCategoryData}
          keyExtractor={(item, index) => item + index}
          renderItem={RenderItem}
          renderSectionHeader={RenderSectionHeader}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
        <CButton
          title={String.logOut}
          color={Colors.Primary}
          containerStyle={localStyle.btnStyle}
          type={'M16'}
          onPress={onPressLogOut}
        />
      </ScrollView>
      <LogOutModal visible={isVisible} onPressClose={onPressLogOut} />
    </View>
  );
}

const localStyle = StyleSheet.create({
  imageStyle: {
    height: moderateScale(56),
    width: moderateScale(56),
    ...styles.mt10,
  },
  innerContainer: {
    ...styles.mt15,
    ...styles.ml10,
  },
  renderItemContainer: {
    ...styles.rowSpaceBetween,
    ...styles.pv15,
  },
  btnStyle: {
    backgroundColor: Colors.White,
    borderWidth: moderateScale(1),
    borderColor: Colors.Primary,
    ...styles.mv20,
  },
});
