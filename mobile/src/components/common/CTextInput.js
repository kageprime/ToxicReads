import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import React, {useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {Colors} from '../../Theme/Colors';
import CText from './CText';
import {moderateScale} from '../../common/constant';
import typography from '../../Theme/Typography';
import {styles} from '../../Theme';
import flex from '../../Theme/flex';


export default  CTextInput = (props) =>{
  let {
    value,
    label,
    containerStyle,
    inputBoxStyle,
    onChangeText,
    placeHolder,
    keyBoardType,
    onFocus,
    onBlur,
    errorText,
    isSecure,
    maxLength,
    editable = true,
    labelStyle,
    multiline,
    errorStyle,
    showError = true,
    LeftIcon,
    color,
    RightIcon,
  } = props;

  const [isSecurePass, setIsSecurePass] = useState(isSecure);

  const onPressSecureIcon = () => {
    setIsSecurePass(!isSecurePass);
  };

  return (
    <View style={styles.mt15}>
      {!!label && (
        <View style={[localStyle.labelContainer, labelStyle]}>
          <CText type={'M14'} color={ color ? color : Colors.Gray80}>
            {label}
          </CText>
        </View>
      )}
      <View
        style={[
          localStyle.inputStyle,
          {
            borderColor: !!errorText ? Colors.ErrorAlert : Colors.secondary,
            height: !!multiline ? moderateScale(75) : moderateScale(50),
          },
          containerStyle,
        ]}>
        {!!LeftIcon && <LeftIcon />}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          maxLength={maxLength}
          placeholder={placeHolder}
          keyboardType={keyBoardType}
          onFocus={onFocus}
          onBlur={onBlur}
          multiline={multiline}
          editable={editable}
          placeholderTextColor={Colors.Gray60}
          secureTextEntry={isSecurePass}
          autoCorrect={false}
          defaultValue={value}
          style={[
            localStyle.InputBoxStyle,
            {color: Colors.Black},
            {height: !!multiline ? moderateScale(75) : moderateScale(50)},
            inputBoxStyle,
            editable === false && {color: Colors.secondary},
          ]}
          {...props}/>

        {!!RightIcon && <RightIcon />}
        {!!isSecure && (
          <TouchableOpacity onPress={onPressSecureIcon}>
            <Ionicons
              name={!isSecurePass ? 'eye-outline' : 'eye-off-outline'}
              size={moderateScale(24)}
              color={Colors.GrayScale}
              style={styles.mr10}></Ionicons>
          </TouchableOpacity>
        )}
      </View>
      {errorText && errorText != '' ? (
        <CText
          style={{
            ...localStyle.errorText,
            ...errorStyle,
            color: Colors.ErrorAlert,
          }}>
          {errorText}
        </CText>
      ) : null}
      {maxLength && showError && value?.length > maxLength ? (
        <CText style={{...localStyle.errorText, ...errorStyle}}>
          {`It should be maximum ${maxLength} character`}
        </CText>
      ) : null}
    </View>
  );
}

const localStyle = StyleSheet.create({
  labelContainer: {
    ...styles.ml25,
    ...styles.mb5,
  },
  inputStyle: {
    borderRadius: moderateScale(24),
    ...styles.rowStart,
    borderWidth: moderateScale(1),
    width: moderateScale(330),
    backgroundColor: Colors.secondary,
    ...styles.mh25,
    ...styles.justifySpaceBetween,
  },
  InputBoxStyle: {
    ...typography.fontSize.f16,
    ...typography.fontWeights.Medium,
    ...styles.mh15,
    ...flex.flex,
  },

  errorText: {
    textAlign: 'left',
    ...typography.fontSize.f12,
    ...styles.mt5,
    ...styles.ml30,
  },
});
