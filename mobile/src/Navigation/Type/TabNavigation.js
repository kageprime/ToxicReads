import {StyleSheet, View} from 'react-native';
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Octicons from 'react-native-vector-icons/Octicons';

// custom import
import {isAndroid, moderateScale} from '../../common/constant';
import {Colors} from '../../Theme/Colors';
import {styles} from '../../Theme';
import {TabNav} from '../NavigationKeys';
import {TabRoute} from '../NavigationRoutes';
import {
  DownloadIcon,
  ExploreIcon,
  FocusedDownloadIcon,
  FocusedExploreIcon,
  FocusedMyBookIcon,
  FocusedProfileIcon,
  MyBookIcon,
  ProfileIcon,
} from '../../assets/svg';

export default function TabNavigation() {
  const Tab = createBottomTabNavigator();

  const RenderTabView = ({name, focused, IconType}) => (
    <View style={styles.center}>
      <IconType
        name={name}
        solid={focused}
        size={moderateScale(24)}
        color={!!focused ? Colors.Primary : Colors.Gray60}
      />
  </View>
  );

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarHideOnKeyboard: isAndroid ? true : false,
        headerShown: false,
        tabBarStyle: localStyle.tabBarStyle,
        tabBarShowLabel: false,
      }}
      initialRouteName={TabNav.HomeTab}>
      <Tab.Screen
        name={TabNav.HomeTab}
        component={TabRoute.HomeTab}
        options={{
          tabBarIcon: ({focused}) => (
            <RenderTabView
              IconType={Octicons}
              name={'home'}
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name={TabNav.ExploreTab}
        component={TabRoute.ExploreTab}
        options={{
          tabBarIcon: ({focused}) =>
            focused ? <FocusedExploreIcon /> : <ExploreIcon />,
        }}
      />
      <Tab.Screen
        name={TabNav.DownloadTab}
        component={TabRoute.DownloadTab}
        options={{
          tabBarIcon: ({focused}) =>
            focused ? <FocusedDownloadIcon /> : <DownloadIcon />,
        }}
      />
      <Tab.Screen
        name={TabNav.MyBookTab}
        component={TabRoute.MyBookTab}
        options={{
          tabBarIcon: ({focused}) =>
            focused ? <FocusedMyBookIcon /> : <MyBookIcon />,
        }}
      />
      <Tab.Screen
        name={TabNav.ProfileTab}
        component={TabRoute.ProfileTab}
        options={{
          tabBarIcon: ({focused}) =>
            focused ? <FocusedProfileIcon /> : <ProfileIcon />,
        }}
      />
    </Tab.Navigator>
  );
}

const localStyle = StyleSheet.create({});
