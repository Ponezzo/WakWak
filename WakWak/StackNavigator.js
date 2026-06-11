// // StackNavigator.js
// import React from 'react';
// import { createStackNavigator } from '@react-navigation/stack';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import Ionic from 'react-native-vector-icons/Ionicons';

// // 개별 페이지 (src/screens 폴더 내)
// import Home from './src/screens/Home';
// import Bag from './src/screens/Bag';
// import Friend from './src/screens/Friend';
// import Map from './src/screens/Map';
// import Record from './src/screens/Record';
// import Bottle from './src/screens/Bottle';
// import GetBottle from './src/screens/GetBottle';
// import SendBottle from './src/screens/SendBottle';
// import StarHome from './src/screens/StarHome';
// import StarWrite from './src/screens/StarWrite';
// import StarLine from './src/screens/StarLine';
// import StarPosition from './src/screens/StarPosition';
// import TimeCapsule from './src/screens/TimeCapsule';

// // Record 탭: Record.js → (내부) Map, Bottle, StarHome
// const RecordStack = createStackNavigator();
// function RecordStackScreen() {
//   return (
//     <RecordStack.Navigator screenOptions={{ headerShown: false }}>
//       <RecordStack.Screen name="Record" component={Record} />
//       <RecordStack.Screen name="Map" component={Map} />
//       <RecordStack.Screen name="Bottle" component={Bottle} />
//       <RecordStack.Screen name="StarHome" component={StarHome} />
//     </RecordStack.Navigator>
//   );
// }


// // 2. Bottom Tab Navigator (하단 탭)

// const Tab = createBottomTabNavigator();
// function BottomTabNavigator() {
//   return (
//     <Tab.Navigator
//       screenOptions={{
//         tabBarShowLabel: false,
//         headerShown: false,
//       }}
//     >
//       <Tab.Screen
//         name="HomeStack"
//         component={Home}
//         options={{
//           tabBarIcon: ({ size, color }) => (
//             <Ionic name="home-outline" size={size} color={color} />
//           ),
//         }}
//       />
//       <Tab.Screen
//         name="BagStack"
//         component={Bag}
//         options={{
//           tabBarIcon: ({ size, color }) => (
//             <Ionic name="book-outline" size={size} color={color} />
//           ),
//         }}
//       />
//       <Tab.Screen
//         name="RecordStack"
//         component={RecordStackScreen}
//         options={{
//           tabBarIcon: ({ size, color }) => (
//             <Ionic name="time-outline" size={size} color={color} />
//           ),
//         }}
//       />
//       <Tab.Screen
//         name="FriendStack"
//         component={Friend}
//         options={{
//           tabBarIcon: ({ size, color }) => (
//             <Ionic name="people-outline" size={size} color={color} />
//           ),
//         }}
//       />
//     </Tab.Navigator>
//   );
// }

// //
// // 3. Root Stack Navigator (하단 탭 유지/숨김 제어)
// //    - BottomTabNavigator 내에서는 하단 탭이 보임
// //    - 하단 탭이 없어야 하는 화면들은 RootStack에 별도로 추가
// //
// const Stack = createStackNavigator();
// export default function StackNavigator() {
//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//       {/* 하단 탭이 보이는 화면 */}
//       <Stack.Screen name="BottomTabNavigator" component={BottomTabNavigator} />
//       {/* 아래 화면들은 하단 탭이 없는 풀스크린 화면 */}
//       <Stack.Screen name="TimeCapsule" component={TimeCapsule} />
//       <Stack.Screen name="SendBottle" component={SendBottle} />
//       <Stack.Screen name="GetBottle" component={GetBottle} />
//       <Stack.Screen name="StarWrite" component={StarWrite} />
//       <Stack.Screen name="StarLine" component={StarLine} />
//       <Stack.Screen name="StarPosition" component={StarPosition} />
//     </Stack.Navigator>
//   );
// }
