import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  Modal,
  SafeAreaView,
} from 'react-native';
import React, {useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

// custom import
import KeyboardAvoidingView from '../common/KeyboardAvoidingView';
import {styles} from '../../Theme';
import CText from '../common/CText';
import {Colors} from '../../Theme/Colors';
import String from '../../i18n/String';
import {moderateScale} from '../../common/constant';
import {ChapterListData} from '../../api/constant';

export default function ReadBookChapterModal(props) {
  let {visible, onPressClose} = props;

  const [isSelected, setIsSelected] = useState(false);

  const onPressSelect = item => {
    setIsSelected(item);
  };

  const RightIcon = () => {
    return (
      <TouchableOpacity
        onPress={onPressClose}
        style={localStyle.closeIconStyle}>
        <Ionicons
          color={Colors.Black}
          size={moderateScale(24)}
          name={'close'}
        />
      </TouchableOpacity>
    );
  };

  const RenderBookChapterData = ({item}) => {
    return (
      <TouchableOpacity
        onPress={() => onPressSelect(item)}
        style={localStyle.chapterListStyle}>
        <CText
          type={'R16'}
          color={isSelected === item ? Colors.Primary : Colors.Gray80}>
          {item}
        </CText>
      </TouchableOpacity>
    );
  };

  return (
    <Modal animationType="fade" visible={visible} transparent={true}>
      <View style={localStyle.modalMainContainer}>
        <SafeAreaView style={localStyle.mainContainer}>
          <KeyboardAvoidingView containerStyle={styles.flexGrow1}>
            <View style={localStyle.headerStyle}>
              <CText type={'D18'} color={Colors.Black}>
                {String.listOfChapters}
              </CText>
              <RightIcon />
            </View>
            <FlatList
              data={ChapterListData}
              renderItem={RenderBookChapterData}
              keyExtractor={(item, index) => index.toString()}
              showsVerticalScrollIndicator={false}
              Vertical
            />
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const localStyle = StyleSheet.create({
  headerStyle: {
    ...styles.rowSpaceBetween,
    ...styles.ph15,
  },
  modalMainContainer: {
    ...styles.flex,
    backgroundColor: Colors.ModalBackgroundColor,
    ...styles.itemEnd,
  },
  mainContainer: {
    ...styles.flex,
    width: '80%',
    backgroundColor: Colors.White,
  },
  closeIconStyle: {
    backgroundColor: Colors.Gray30,
    ...styles.ml25,
    width: moderateScale(45),
    height: moderateScale(45),
    ...styles.center,
    borderRadius: moderateScale(25),
  },
  chapterListStyle: {
    ...styles.mv10,
    ...styles.ml15,
  },
});
