import Splash from '../containers/Splash';
import OnBoarding from '../containers/OnBoarding';
import SignInScreen from '../containers/Auth/SignInScreen';
import SignInEmailScreen from '../containers/Auth/SignInEmailScreen';
import CreateAccountScreen from '../containers/Auth/CreateAccountScreen';
import SignUpScreen from '../containers/Auth/SignUpScreen';
import CreatePasswordScreen from '../containers/Auth/CreatePasswordScreen';
import ForgotPasswordScreen from '../containers/Auth/ForgotPasswordScreen';
import OtpScreen from '../containers/Auth/OtpScreen';
import TabNavigation from './Type/TabNavigation';
import SelectLanguageScreen from '../containers/Auth/SelectLanguageScreen';
import PreviewScreen from '../containers/Home/PreviewScreen';
import SearchScreen from '../containers/Explore/SearchScreen';

//
import HomeTab from '../containers/Tab/HomeTab';
import ExploreTab from '../containers/Tab/ExploreTab';
import MyBookTab from '../containers/Tab/MyBookTab';
import DownloadTab from '../containers/Tab/DownloadTab';
import ProfileTab from '../containers/Tab/ProfileTab';
import BookPreviewScreen from '../containers/Home/BookPreviewScreen';
import ReviewScreen from '../containers/Home/ReviewScreen';
import PaymentDetailsScreen from '../containers/Home/PaymentDetailsScreen';
import PaymentMethodScreen from '../containers/Home/PaymentMethodScreen';
import PaymentSuccessfulScreen from '../containers/Home/PaymentSuccessfulScreen';
import NotificationScreen from '../containers/Home/NotificationScreen';
import MessageScreen from '../containers/Home/MessageScreen';
import Chat from '../containers/Home/Chat';
import EditProfileScreen from '../containers/Profile/EditProfileScreen';
import Voucher from '../containers/Profile/Voucher';
import WhishlistBook from '../containers/Profile/WhishlistBook';
import ChoosePayment from '../containers/Profile/ChoosePayment';
import AddNewCard from '../containers/Profile/AddNewCard';
import ChangePassword from '../containers/Profile/ChangePassword';
import ForgotPassword from '../containers/Profile/ForgotPassword';
import Security from '../containers/Profile/Security';
import Language from '../containers/Profile/Language';
import LegalAndPolicies from '../containers/Profile/LegalAndPolicies';
import HelpAndSupport from '../containers/Profile/HelpAndSupport';
import Notification from '../containers/Profile/Notification';

export const StackRoute = {
  Splash,
  OnBoarding,
  TabNavigation,
  BookPreviewScreen,
  PreviewScreen,
  SearchScreen,
  PaymentDetailsScreen,
  PaymentMethodScreen,
  PaymentSuccessfulScreen,
  NotificationScreen,
  MessageScreen,
  Chat,
  EditProfileScreen,
  Voucher,
  WhishlistBook,
  ChoosePayment,
  AddNewCard,
  ChangePassword,
  ForgotPassword,
  Security,
  Language,
  LegalAndPolicies,
  HelpAndSupport,
  Notification,
  ReviewScreen,
};

export const AuthRoute = {
  SignInScreen,
  SignInEmailScreen,
  CreateAccountScreen,
  SignUpScreen,
  CreatePasswordScreen,
  ForgotPasswordScreen,
  OtpScreen,
  SelectLanguageScreen,
};

export const TabRoute = {
  HomeTab,
  ExploreTab,
  MyBookTab,
  DownloadTab,
  ProfileTab,
};
