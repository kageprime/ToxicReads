import React from 'react';
import typography from '../../Theme/Typography';
import {Text} from 'react-native';
import {Colors} from '../../Theme/Colors';

const CText = ({type, style, align, color, children, ...props}) => {
  const fontWeights = () => {
    switch (type.charAt(0).toUpperCase()) {
      case 'R':
        return typography.fontWeights.Regular;
      case 'B':
        return typography.fontWeights.Bold;
      case 'M':
        return typography.fontWeights.Medium;
      case 'S':
        return typography.fontWeights.SemiBold;
      case 'I':
        return typography.fontWeights.ItalicBold;
      case 'D':
        return typography.fontWeights.Display;
      default:
        return typography.fontWeights.Regular;
    }
  };

  const fontSize = () => {
    switch (type.slice(1)) {
      case '10':
        return typography.fontSize.f10;
      case '12':
        return typography.fontSize.f12;
      case '14':
        return typography.fontSize.f14;
      case '16':
        return typography.fontSize.f16;
      case '18':
        return typography.fontSize.f18;
      case '20':
        return typography.fontSize.f20;
      case '22':
        return typography.fontSize.f22;
      case '24':
        return typography.fontSize.f24;
      case '26':
        return typography.fontSize.f26;
      case '28':
        return typography.fontSize.f28;
      case '30':
        return typography.fontSize.f30;
      case '32':
        return typography.fontSize.f32;
      case '34':
        return typography.fontSize.f34;
      case '36':
        return typography.fontSize.f36;
      case '38':
        return typography.fontSize.f38;
      case '40':
        return typography.fontSize.f40;
      case '48':
        return typography.fontSize.f48;
    }
  };

  return (
    <Text
      style={[
        type && {...fontWeights(), ...fontSize()},
        {color: color ? color : Colors.TextColor},
        align && {textAlign: align},
        style,
      ]}
      {...props}>
      {children}
    </Text>
  );
};
export default React.memo(CText);
