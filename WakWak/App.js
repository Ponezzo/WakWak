import React, { useState, useEffect, useRef} from 'react';
import { View, StyleSheet, LogBox } from 'react-native';
import { NavigationContainer, createNavigationContainerRef, useFocusEffect } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionic from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Login from './src/screens/Login';
import Home1 from './src/screens/Home_white';
import Home2 from './src/screens/Home_blue';
import Home3 from './src/screens/Home_lightbrown';
import Home4 from './src/screens/Home_pink';
import Home5 from './src/screens/Home_purple';
import Home6 from './src/screens/Home_brown';
import Bag from './src/screens/Bag';
import Friend from './src/screens/Friend';
import Map from './src/screens/Map';
import Record from './src/screens/Record';
import Bottle from './src/screens/Bottle';
import GetBottle from './src/screens/GetBottle';
import SendBottle from './src/screens/SendBottle';
import StarHome from './src/screens/StarHome';
import StarWrite from './src/screens/StarWrite';
import StarLine from './src/screens/StarLine';
import StarPosition from './src/screens/StarPosition';
import TimeCapsule from './src/screens/TimeCapsule';
import Sound from 'react-native-sound';

LogBox.ignoreLogs(['Encountered an error loading page']);
LogBox.ignoreLogs(['The global process.env.EXPO_OS is not defined. This should be inlined by babel-preset-expo during transformation.']);
LogBox.ignoreLogs(['Only limited number of console messages can be cached.']);

const navigationRef = createNavigationContainerRef();

const RecordStack = createStackNavigator();
function RecordStackScreen() {
  return (
    <RecordStack.Navigator screenOptions={{ headerShown: false }}>
      <RecordStack.Screen name="Record" component={Record} />
      <RecordStack.Screen name="Map" component={Map} />
      <RecordStack.Screen name="Bottle" component={Bottle} />
      <RecordStack.Screen name="StarHome" component={StarHome} />
    </RecordStack.Navigator>
  );
}

// HomeComponent with props
const HomeComponent = ({ navigation, setIsLoggedIn }) => {
  const [currentHomeKey, setCurrentHomeKey] = useState('home1');
  
  const homeScreens = {
    home1: Home1,
    home2: Home2,
    home3: Home3,
    home4: Home4,
    home5: Home5,
    home6: Home6
  };

  useEffect(() => {
    const loadHomeScreen = async () => {
      try {
        const savedHome = await AsyncStorage.getItem('selectedHomeScreen');
        if (savedHome && homeScreens[savedHome]) {
          setCurrentHomeKey(savedHome);
        }
      } catch (error) {
        console.error('홈스크린 로드 실패:', error);
        setCurrentHomeKey('home1');
      }
    };
    
    loadHomeScreen();
  }, []);

  const CurrentHomeComponent = homeScreens[currentHomeKey];
  return <CurrentHomeComponent navigation={navigation} setIsLoggedIn={setIsLoggedIn} />;
};

// FriendComponent with props
const FriendComponent = ({ navigation, setIsLoggedIn }) => (
  <Friend navigation={navigation} setIsLoggedIn={setIsLoggedIn} />
);

const Tab = createBottomTabNavigator();
function BottomTabNavigator({ navigation, setIsLoggedIn }) {
  const [showTabBar, setShowTabBar] = useState(false);

  useEffect(() => {
    setShowTabBar(false);
    const timer = setTimeout(() => {
      setShowTabBar(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const getTabBarStyle = (route) => {
    const routeName = route.name;
    
    if (routeName === "HomeStack") {
      return {
        display: showTabBar ? 'flex' : 'none',
        position: 'absolute',
        borderTopWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
        shadowColor: 'transparent',
        shadowOffset: { height: 0, width: 0 },
      };
    }
    
    return {
      backgroundColor: 'white',
      borderTopWidth: 0,
      elevation: 0,
      shadowOpacity: 0,
      shadowColor: 'transparent',
      shadowOffset: { height: 0, width: 0 },
    };
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: getTabBarStyle(route),
      })}
    >
      <Tab.Screen
        name="HomeStack"
        options={{
          tabBarIcon: ({ size, color }) => (
            <Ionic name="home-outline" size={size} color={color} />
          ),
        }}
      >
        {(props) => <HomeComponent {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Tab.Screen>
      <Tab.Screen
        name="BagStack"
        component={Bag}
        options={{
          tabBarIcon: ({ size, color }) => (
            <MaterialCommunityIcons name="file-cabinet" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="RecordStack"
        component={RecordStackScreen}
        options={{
          tabBarIcon: ({ size, color }) => (
            <MaterialCommunityIcons name="book-edit-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="FriendStack"
        options={{
          tabBarIcon: ({ size, color }) => (
            <Ionic name="people-outline" size={size} color={color} />
          ),
        }}
      >
        {(props) => <FriendComponent {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const Stack = createStackNavigator();
function MainStack({ setIsLoggedIn }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BottomTabNavigator">
        {(props) => <BottomTabNavigator {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Stack.Screen>
      <Stack.Screen name="TimeCapsule" component={TimeCapsule} />
      <Stack.Screen name="SendBottle" component={SendBottle} />
      <Stack.Screen name="GetBottle" component={GetBottle} />
      <Stack.Screen name="StarWrite" component={StarWrite} />
      <Stack.Screen name="StarLine" component={StarLine} />
      <Stack.Screen name="StarPosition" component={StarPosition} />
    </Stack.Navigator>
  );
}

const RootStack = createStackNavigator();

const LoginScreen = ({ navigation, setIsLoggedIn }) => (
  <Login navigation={navigation} setIsLoggedIn={setIsLoggedIn} />
);

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentRoute, setCurrentRoute] = useState('');
  const soundRef = useRef(null);
  const songList = [
    require("./assets/sounds/music.mp3"),
  ];

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('AUTH_TOKEN');
        if (token) {
          console.log('Stored token found:', token); // 디버깅을 위한 로그
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('토큰 확인 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, []);

  useEffect(() => {
    const loadSound = () => {
      const song = new Sound(songList[0], error => {
        if (error) {
          console.log("오디오 로드 및 재생 오류:", error);
        } else {
          soundRef.current = song;
          soundRef.current.play(() => {
            if (soundRef.current) {
              soundRef.current.release();
            }
            loadSound();
          });
        }
      });
    };
    
    loadSound();

    return () => {
      if (soundRef.current) {
        soundRef.current.release();
        soundRef.current = null;
      }
    };
  }, []);

  if (isLoading) {
    return <View style={{ flex: 1 }} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer
        ref={navigationRef}
        onReady={() => {
          const route = navigationRef.getCurrentRoute();
          setCurrentRoute(route?.name || '');
        }}
        onStateChange={() => {
          const route = navigationRef.getCurrentRoute();
          setCurrentRoute(route?.name || '');
        }}
      >
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {isLoggedIn ? (
            <RootStack.Screen name="MainStack">
              {(props) => <MainStack {...props} setIsLoggedIn={setIsLoggedIn} />}
            </RootStack.Screen>
          ) : (
            <RootStack.Screen name="Login">
              {(props) => <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
            </RootStack.Screen>
          )}
        </RootStack.Navigator>
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    top: 30,
    right: 20,
    backgroundColor: 'transparent',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontFamily: 'font1'
  }
});