import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, 
  ImageBackground, TouchableOpacity   } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import GetBottle from './GetBottle';
import SendBottle from './SendBottle';

const Stack = createStackNavigator();

const BottleMain = ({ navigation }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: 20,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          })
        ])
      ).start();
    };

    animate();
  }, []);

  return (
    <ImageBackground
      source={require('../../assets/images/sea.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <Animated.Image
        source={require('../../assets/images/bottle.png')}
        style={[
          styles.bottle,
          {
            transform: [{ translateY: floatAnim }]
          }
        ]}
      />

      {/* 카드 영역: 화면 하단 60%를 차지 */}
      <View style={styles.cardContainer}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('GetBottle')}
        >
          <Text style={styles.cardText}>편지 줍기</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('SendBottle')}
        >
          <Text style={styles.cardText}>편지 보내기</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const Bottle = () => {
  return (
    <Stack.Navigator 
      initialRouteName="BottleMain"
      screenOptions={{
        headerStyle: { backgroundColor: '#87A7C0' },
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="BottleMain" 
        component={BottleMain} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="GetBottle" 
        component={GetBottle} 
        options={{
          title: '편지 줍기',
          headerBackTitleVisible: false,
          headerTintColor: '#ffffff',
        }}
      />
      <Stack.Screen 
        name="SendBottle" 
        component={SendBottle}
        options={{
          title: '편지 보내기',
          headerBackTitleVisible: false,
          headerTintColor: '#ffffff',
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardContainer: {
    position: 'absolute',
    bottom: 0,
    height: '60%', // 하단 60% 차지
    width: '100%',
    // backgroundColor: 'white',
    borderTopLeftRadius: 30,   // 상단 왼쪽 모서리 둥글게
    borderTopRightRadius: 30,  // 상단 오른쪽 모서리 둥글게
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  card: {
    width: '80%',
    backgroundColor: '#fff',
    paddingVertical: 25,
    borderRadius: 10,
    alignItems: 'flex-start',
    paddingLeft: '10%',
    alignSelf: 'center',
    marginBottom: 15,
    borderColor: '#182f57',
    borderWidth: 1,
  },
  cardText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#87A7C0',
  },
  bottle: {
    width: 150,
    height: 150,
    position: 'absolute',
    top: '40%',
    left: '50%',
    marginLeft: -75,
    marginTop: -75,
    zIndex: 1,
  },
});

export default Bottle;
