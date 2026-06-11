
// screens/StarHome.js
import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Image,
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import Ionic from 'react-native-vector-icons/Ionicons';
import SelectStarSky from '../components/SelectStarSky';
import StarDetail from '../components/StarDetail';
import ConstellationDetail from '../components/ConstellationDetail';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 하위 화면들은 각각 별도 파일로 관리하거나 아래에 정의할 수 있습니다.
import StarWrite from './StarWrite';
import StarLine from './StarLine';
import StarPosition from './StarPosition';

const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');
const BASE_URL = 'https://i12e207.p.ssafy.io';

// sky id에 따라 하늘 이미지를 동적으로 선택하는 함수
const getSkyImage = (id) => {
  const numId = Number(id);
  const remainder = numId % 4;
  if (remainder === 1) {
    return require('../../assets/images/sky1.png');
  } else if (remainder === 2) {
    return require('../../assets/images/sky2.png');
  } else if (remainder === 3) {
    return require('../../assets/images/sky3.png');
  } else if (remainder === 0) {
    return require('../../assets/images/sky4.png');
  } else {
    return require('../../assets/images/sky1.png');
  }
};

// StarHomeMain: 별 관련 메인 화면 (하늘 배경, 별/별자리 렌더링, 버튼 영역 등)
const StarHomeMain = ({ navigation }) => {
  // 인증 토큰 상태
  const [authToken, setAuthToken] = useState(null);
  useEffect(() => {
    const getStoredToken = async () => {
      try {
        const AUTH_TOKEN = await AsyncStorage.getItem('AUTH_TOKEN');
        if (AUTH_TOKEN) {
          setAuthToken(`Bearer ${AUTH_TOKEN}`);
        }
      } catch (error) {
        console.error('토큰 가져오기 실패:', error);
      }
    };
    getStoredToken();
  }, []);

  // 기본 상태들
  const [currentSkyId, setCurrentSkyId] = useState(null);
  const [selectedModalSkyId, setSelectedModalSkyId] = useState(null);
  const [skyList, setSkyList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [stars, setStars] = useState([]); // 서버에서 받아온 별 데이터
  const [constellations, setConstellations] = useState([]); // 서버에서 받아온 별자리 데이터
  const [starDetailVisible, setStarDetailVisible] = useState(false);
  const [selectedStarId, setSelectedStarId] = useState(null);
  const [selectedConstellation, setSelectedConstellation] = useState(null);
  const [constellationDetailVisible, setConstellationDetailVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 하늘 이미지 및 스케일 계산
  const currentSkyImage = currentSkyId ? getSkyImage(currentSkyId) : null;
  const { width: originalWidth, height: originalHeight } = currentSkyImage
    ? Image.resolveAssetSource(currentSkyImage)
    : { width: deviceWidth, height: deviceHeight };
  const IMAGE_HEIGHT = deviceHeight;
  const IMAGE_WIDTH = (deviceHeight / originalHeight) * originalWidth;
  const scaleX = IMAGE_WIDTH / originalWidth;
  const scaleY = IMAGE_HEIGHT / originalHeight;

  // 서버 호출 함수들
  const fetchSkyList = async () => {
    if (!authToken) return;
    try {
      const response = await axios.get(`${BASE_URL}/star-sky`, {
        headers: { 'Authorization': authToken },
      });
      const json = response.data;
      if (json.code === "SUCCESS" && typeof json.skyId === "number" && json.skyId > 0) {
        setSkyList([json.skyId]);
        setSelectedModalSkyId(json.skyId);
        setCurrentSkyId(json.skyId);
        return json.skyId;
      }
    } catch (error) {
      console.error("Error in fetchSkyList:", error);
    }
  };

  const fetchStarList = async (skyIdParam) => {
    if (!authToken) return;
    const skyIdToUse = skyIdParam || currentSkyId;
    try {
      const response = await axios.post(
        `${BASE_URL}/star-sky/star`,
        { skyId: skyIdToUse },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken,
          },
        }
      );
      const json = response.data;
      if (json.code === "SUCCESS" && json.data) {
        const convertedStars = json.data.map((star) => ({
          ...star,
          x: star.longitude,
          y: star.latitude,
        }));
        setStars(convertedStars);
      }
    } catch (error) {
      console.error("Error in fetchStarList:", error);
    }
  };

  const fetchConstellations = async (skyIdParam) => {
    if (!authToken) return;
    const skyIdToUse = skyIdParam || currentSkyId;
    try {
      const response = await axios.post(
        `${BASE_URL}/star-sky/constellations`,
        { skyId: skyIdToUse },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken,
          },
        }
      );
      const json = response.data;
      if (json.code === "SUCCESS" && json.data && json.data.constellations) {
        setConstellations(json.data.constellations);
      }
    } catch (error) {
      console.error("Error in fetchConstellations:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (currentSkyId === null && authToken) {
        fetchSkyList();
      }
    }, [currentSkyId, authToken])
  );

  useEffect(() => {
    if (currentSkyId && authToken) {
      fetchStarList(currentSkyId);
      fetchConstellations(currentSkyId);
      setIsLoading(false);
      offsetX.setValue(0);
    }
  }, [currentSkyId, authToken]);

  // 하늘 무한 스크롤 구현
  const offsetX = useRef(new Animated.Value(0)).current;
  const panStartX = useRef(0);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        offsetX.stopAnimation((val) => {
          panStartX.current = val;
        });
      },
      onPanResponderMove: (evt, gestureState) => {
        const newVal = panStartX.current + gestureState.dx;
        offsetX.setValue(newVal);
      },
      onPanResponderRelease: () => {
        offsetX.stopAnimation();
      },
    })
  ).current;

  const [displayOffset, setDisplayOffset] = useState(0);
  useEffect(() => {
    const id = offsetX.addListener(({ value }) => {
      const effective = ((value % IMAGE_WIDTH) + IMAGE_WIDTH) % IMAGE_WIDTH;
      setDisplayOffset(effective);
    });
    return () => offsetX.removeListener(id);
  }, [offsetX, IMAGE_WIDTH]);

  // 별 렌더링
  const starImage = require('../../assets/images/star.png');
  const renderStarsSync = (copyOffset) => {
    return stars.map((star) => {
      const key = star.starId || star.id;
      const starSize = 20;
      const posX = star.x * scaleX + copyOffset;
      const posY = star.y * scaleY;
      return (
        <TouchableOpacity
          key={`${key}-${copyOffset}`}
          style={{
            position: 'absolute',
            left: posX - starSize / 2,
            top: posY - starSize / 2,
            width: starSize,
            height: starSize,
          }}
          onPress={() => {
            setSelectedStarId(key);
            setStarDetailVisible(true);
          }}
        >
          <Image
            source={starImage}
            style={{ width: starSize, height: starSize }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      );
    });
  };

  const renderConstellationsSync = (copyOffset) => {
    return constellations.map((constellation) => {
      const sortedStars = [...(constellation.stars || [])].sort((a, b) => a.order - b.order);
      const positions = sortedStars
        .map((cs) => {
          const globalStar = stars.find(s => s.starId === cs.starId || s.id === cs.starId);
          if (globalStar) {
            return {
              x: globalStar.x * scaleX + copyOffset,
              y: globalStar.y * scaleY,
            };
          }
          return null;
        })
        .filter((p) => p !== null);
      if (positions.length < 2) return null;
      const lineViews = [];
      for (let i = 0; i < positions.length - 1; i++) {
        const { x: x1, y: y1 } = positions[i];
        const { x: x2, y: y2 } = positions[i + 1];
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        lineViews.push(
          <View
            key={`line-${constellation.constellationId}-${i}-${copyOffset}`}
            style={{
              position: 'absolute',
              left: midX - length / 2,
              top: midY - 1,
              width: length,
              height: 2,
              backgroundColor: 'white',
              transform: [{ rotate: `${angle}deg` }],
            }}
          />
        );
      }
      const avgX = positions.reduce((sum, pos) => sum + pos.x, 0) / positions.length;
      const avgY = positions.reduce((sum, pos) => sum + pos.y, 0) / positions.length;
      return (
        <React.Fragment key={`constellation-${constellation.constellationId}-${copyOffset}`}>
          {lineViews}
          <TouchableOpacity
            style={{
              position: 'absolute',
              left: avgX - 30,
              top: avgY - 10,
            }}
            onPress={() => {
              setSelectedConstellation(constellation);
              setConstellationDetailVisible(true);
            }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
              {constellation.constellationName}
            </Text>
          </TouchableOpacity>
        </React.Fragment>
      );
    });
  };

  return (
    <View style={styles.container}>
      {/* 하늘 배경 무한 스크롤 */}
      <View style={styles.backgroundContainer} {...panResponder.panHandlers}>
        <Animated.View
          style={[
            styles.animatedContainer,
            {
              width: IMAGE_WIDTH * 2,
              height: IMAGE_HEIGHT,
              transform: [{ translateX: displayOffset - IMAGE_WIDTH }],
            },
          ]}
        >
          <Animated.View style={{ position: 'absolute', width: IMAGE_WIDTH, height: IMAGE_HEIGHT, left: 0 }}>
            <Image
              source={currentSkyImage}
              style={{ width: IMAGE_WIDTH, height: IMAGE_HEIGHT }}
              resizeMode="stretch"
            />
          </Animated.View>
          <Animated.View style={{ position: 'absolute', width: IMAGE_WIDTH, height: IMAGE_HEIGHT, left: IMAGE_WIDTH }}>
            <Image
              source={currentSkyImage}
              style={{ width: IMAGE_WIDTH, height: IMAGE_HEIGHT }}
              resizeMode="stretch"
            />
          </Animated.View>
          {renderStarsSync(0)}
          {renderStarsSync(IMAGE_WIDTH)}
          {renderConstellationsSync(0)}
          {renderConstellationsSync(IMAGE_WIDTH)}
        </Animated.View>
      </View>

      {/* 버튼 영역 */}
      <TouchableOpacity
        style={styles.selectSkyButton}
        onPress={() =>
          navigation.navigate('StarWrite', {
            skyId: currentSkyId,
            starArray: stars,
            constellationData: constellations,
          })
        }
      >
        <Text style={styles.buttonText}>작성하기</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.starWriteButton} onPress={() => setModalVisible(true)}>
        <Ionic name="images-outline" size={30} color="black" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.starLineButton}
        onPress={() =>
          navigation.navigate('StarLine', {
            skyId: currentSkyId,
            starArray: stars,
            constellationData: constellations,
          })
        }
      >
        <Ionic name="analytics-outline" size={30} color="black" />
      </TouchableOpacity>
      <SelectStarSky
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={(selectedId) => {
          setCurrentSkyId(selectedId);
          setModalVisible(false);
        }}
        selectedSkyId={selectedModalSkyId}
      />
      {starDetailVisible && (
        <StarDetail
          visible={starDetailVisible}
          starId={selectedStarId}
          onClose={() => {
            setStarDetailVisible(false);
            fetchStarList(currentSkyId);
            fetchConstellations(currentSkyId);
          }}
        />
      )}
      {selectedConstellation && (
        <ConstellationDetail
          visible={constellationDetailVisible}
          constellation={selectedConstellation}
          stars={stars}
          onClose={() => {
            setConstellationDetailVisible(false);
            fetchStarList(currentSkyId);
            fetchConstellations(currentSkyId);
          }}
          refreshData={() => fetchConstellations(currentSkyId)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: deviceWidth,
    height: deviceHeight,
    overflow: 'hidden',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  animatedContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    flexDirection: 'row',
  },
  selectSkyButton: {
    position: 'absolute',
    bottom: '15%',
    left: '30%',
    width: '40%',
    height: 50,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d4d4d4',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  starWriteButton: {
    position: 'absolute',
    bottom: '15%',
    left: '10%',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d4d4d4',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  starLineButton: {
    position: 'absolute',
    bottom: '15%',
    right: '10%',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d4d4d4',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  buttonText: {
    fontSize: 18,
    color: '#001f3f',
    fontWeight: 'bold',
    fontFamily: 'font1'
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: deviceWidth,
    height: deviceHeight,
    backgroundColor: 'black',
    zIndex: 100,
  },
});

// 내부 스택 내비게이터 구성 (Bottle.js와 유사한 구조)
const Stack = createStackNavigator();

const StarHome = () => {
  return (
    <Stack.Navigator
      initialRouteName="StarHomeMain"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="StarHomeMain"
        component={StarHomeMain}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="StarWrite"
        component={StarWrite}
        options={{ title: '일기 쓰기' }}
      />
      <Stack.Screen
        name="StarLine"
        component={StarLine}
        options={{ title: 'Star Line' }}
      />
      <Stack.Screen
        name="StarPosition"
        component={StarPosition}
        options={{ title: 'Star Position' }}
      />
    </Stack.Navigator>
  );
};

export default StarHome;
