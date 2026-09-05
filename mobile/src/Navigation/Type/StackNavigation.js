import React from 'react';
import {AuthRoute, StackRoute} from '../NavigationRoutes';
import {AuthNav, StackNav} from '../NavigationKeys';
import {createStackNavigator} from '@react-navigation/stack';

const Stack = createStackNavigator();

export default function StackNavigation() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={StackNav.Splash}>
      <Stack.Screen name={StackNav.Splash} component={StackRoute.Splash} />
      <Stack.Screen
        name={StackNav.OnBoarding}
        component={StackRoute.OnBoarding}
      />
      <Stack.Screen
        name={AuthNav.SignInScreen}
        component={AuthRoute.SignInScreen}
      />
      <Stack.Screen
        name={AuthNav.SignInEmailScreen}
        component={AuthRoute.SignInEmailScreen}
      />
      <Stack.Screen
        name={AuthNav.CreateAccountScreen}
        component={AuthRoute.CreateAccountScreen}
      />
      <Stack.Screen
        name={AuthNav.SignUpScreen}
        component={AuthRoute.SignUpScreen}
      />
      <Stack.Screen
        name={AuthNav.CreatePasswordScreen}
        component={AuthRoute.CreatePasswordScreen}
      />
      <Stack.Screen
        name={AuthNav.ForgotPasswordScreen}
        component={AuthRoute.ForgotPasswordScreen}
      />
      <Stack.Screen name={AuthNav.OtpScreen} component={AuthRoute.OtpScreen} />
      <Stack.Screen
        name={AuthNav.SelectLanguageScreen}
        component={AuthRoute.SelectLanguageScreen}
      />
      <Stack.Screen
        name={StackNav.TabNavigation}
        component={StackRoute.TabNavigation}
      />
      <Stack.Screen
        name={StackNav.NotificationScreen}
        component={StackRoute.NotificationScreen}
      />
      <Stack.Screen
        name={StackNav.MessageScreen}
        component={StackRoute.MessageScreen}
      />
      <Stack.Screen name={StackNav.Chat} component={StackRoute.Chat} />
      <Stack.Screen
        name={StackNav.BookPreviewScreen}
        component={StackRoute.BookPreviewScreen}
      />
      <Stack.Screen
        name={StackNav.PreviewScreen}
        component={StackRoute.PreviewScreen}
      />
      <Stack.Screen
        name={StackNav.ReviewScreen}
        component={StackRoute.ReviewScreen}
      />
      <Stack.Screen
        name={StackNav.PaymentDetailsScreen}
        component={StackRoute.PaymentDetailsScreen}
      />
      <Stack.Screen
        name={StackNav.PaymentMethodScreen}
        component={StackRoute.PaymentMethodScreen}
      />
      <Stack.Screen
        name={StackNav.PaymentSuccessfulScreen}
        component={StackRoute.PaymentSuccessfulScreen}
      />
      <Stack.Screen
        name={StackNav.SearchScreen}
        component={StackRoute.SearchScreen}
      />
      <Stack.Screen
        name={StackNav.EditProfileScreen}
        component={StackRoute.EditProfileScreen}
      />
      <Stack.Screen name={StackNav.Voucher} component={StackRoute.Voucher} />
      <Stack.Screen
        name={StackNav.WhishlistBook}
        component={StackRoute.WhishlistBook}
      />
      <Stack.Screen
        name={StackNav.ChoosePayment}
        component={StackRoute.ChoosePayment}
      />
      <Stack.Screen
        name={StackNav.AddNewCard}
        component={StackRoute.AddNewCard}
      />
      <Stack.Screen
        name={StackNav.ChangePassword}
        component={StackRoute.ChangePassword}
      />
      <Stack.Screen
        name={StackNav.ForgotPassword}
        component={StackRoute.ForgotPassword}
      />
      <Stack.Screen name={StackNav.Security} component={StackRoute.Security} />
      <Stack.Screen name={StackNav.Language} component={StackRoute.Language} />
      <Stack.Screen
        name={StackNav.LegalAndPolicies}
        component={StackRoute.LegalAndPolicies}
      />
      <Stack.Screen
        name={StackNav.HelpAndSupport}
        component={StackRoute.HelpAndSupport}
      />
      <Stack.Screen
        name={StackNav.Notification}
        component={StackRoute.Notification}
      />
    </Stack.Navigator>
  );
}
