import {ACCESS_TOKEN, ON_BOARDING} from './Keys';
import AsyncStorage from '@react-native-async-storage/async-storage';

//get Value
const initialValueGet = async () => {
  let asyncData = await AsyncStorage.multiGet([ON_BOARDING, ACCESS_TOKEN]);

  const onBoardingValue = !!asyncData[0][1]
    ? JSON.parse(asyncData[0][1])
    : false;
  const acessTokenValue = !!asyncData[1][1]
    ? JSON.parse(asyncData[1][1])
    : false;
  return {onBoardingValue, acessTokenValue};
};

//SetOnBoarding
const setOnBoarding = async value => {
  const stringifyData = JSON.stringify(value);
  await AsyncStorage.setItem(ON_BOARDING, stringifyData);
  return;
};

//SetAccessToken
const setAuthToken = async value => {
  const stringifyData = JSON.stringify(value);
  await AsyncStorage.setItem(ACCESS_TOKEN, stringifyData);
  return;
};

export {initialValueGet, setAuthToken, setOnBoarding};
