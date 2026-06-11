import React, { useRef, useEffect, useState } from 'react';
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
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import starImage from '../../assets/images/star.png'; // 단일 star.png 사용

const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');

// BASE_URL 상수 – 앞으로 모든 API 호출에 사용됩니다.
const BASE_URL = 'https://i12e207.p.ssafy.io'; 

// 동적 require 함수: currentSkyId에 따른 하늘 이미지 선택
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

const OCCUPIED_THRESHOLD = 30; // 터치 시 별이 존재하는 것으로 간주할 반경 (픽셀 기준)

const StarPosition = ({ navigation, route }) => {
  const {
    skyId,
    title,
    content,
    mediaFiles,
    starArray: passedStarArray,
    constellationData: passedConstellationData,
  } = route.params || {};

  // 기존 별자리 데이터 (필요 시 추후 활용)
  const [existingConstellation, setExistingConstellation] = useState(
    passedConstellationData || []
  );

  const [currentSkyId] = useState(skyId || 1);
  const [starArray] = useState(passedStarArray || []);

  // 새로 심은 별 (API 전송 시 pendingStar로 사용) – 단 1개만 저장됨.
  const [pendingStar, setPendingStar] = useState(null);

  // 모달 (필요 시 사용)
  const [modalVisible, setModalVisible] = useState(false);
  // 하늘 이미지 관련 상태 (삭제 금지)
  const [selectedModalSkyId, setSelectedModalSkyId] = useState(currentSkyId);

  // 인증 토큰: AsyncStorage에서 불러오기
  const [authToken, setAuthToken] = useState(null);
  const getStoredToken = async () => {
    try {
      const token = await AsyncStorage.getItem('AUTH_TOKEN');
      if (token) {
        setAuthToken(`Bearer ${token}`);
      } else {
        console.warn('No auth token found in storage');
      }
    } catch (error) {
      console.error('Error retrieving auth token:', error);
    }
  };
  useEffect(() => {
    getStoredToken();
  }, []);

  // 메시지 상태 ("이미 별이 있어요."를 2초간 보여줌)
  const [message, setMessage] = useState(null);
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage(null);
    }, 2000);
  };

  // currentSkyImage 및 스케일 계산
  const currentSkyImage = getSkyImage(currentSkyId);
  const { width: originalWidth, height: originalHeight } = Image.resolveAssetSource(
    currentSkyImage
  );
  const IMAGE_HEIGHT = deviceHeight;
  const IMAGE_WIDTH = (deviceHeight / originalHeight) * originalWidth;
  const scaleX = IMAGE_WIDTH / originalWidth;
  const scaleY = IMAGE_HEIGHT / originalHeight;

  // 컨테이너 레이아웃 (절대 좌표) 저장 – 터치 좌표 계산에 사용
  const [containerLayout, setContainerLayout] = useState({ x: 0, y: 0 });

  // 모달 상태 최신값 ref
  const modalVisibleRef = useRef(modalVisible);
  useEffect(() => {
    modalVisibleRef.current = modalVisible;
  }, [modalVisible]);

  

  // PanResponder – 스와이프와 탭 인식
  const offsetX = useRef(new Animated.Value(0)).current;
  const offsetValue = useRef(0);
  useEffect(() => {
    const id = offsetX.addListener(({ value }) => {
      offsetValue.current = value;
    });
    return () => offsetX.removeListener(id);
  }, [offsetX]);
  const panStartX = useRef(0);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        panStartX.current = offsetValue.current;
        offsetX.stopAnimation();
      },
      onPanResponderMove: (evt, gestureState) => {
        let newVal = panStartX.current + gestureState.dx;
        if (newVal > 0) {
          newVal = newVal - IMAGE_WIDTH;
        } else if (newVal < -IMAGE_WIDTH) {
          newVal = newVal + IMAGE_WIDTH;
        }
        offsetX.setValue(newVal);
      },
      onPanResponderRelease: (evt, gestureState) => {
        offsetX.stopAnimation();
        // 터치 이동량이 아주 작으면 tap으로 간주하여 container의 절대 좌표(pageX/Y) 기준으로 계산
        if (Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5) {
          const { pageX, pageY } = evt.nativeEvent;
          const tapX = pageX - containerLayout.x;
          const tapY = pageY - containerLayout.y;
          handleBackgroundTap({ x: tapX, y: tapY });
        }
      },
    })
  ).current;

  // 빈 공간 탭 시 호출되는 함수: 새로운 별 생성 혹은 이미 별이 있는 경우 메시지 표시  
  // (tapPoint: {x, y} — container 기준 좌표)
  const handleBackgroundTap = (tapPoint) => {
    const { x, y } = tapPoint;
    // 이미지 내 실제 좌표 계산 (wrap-around 고려)
    let adjustedX = x - offsetValue.current;
    if (adjustedX < 0) {
      adjustedX += IMAGE_WIDTH;
    }
    if (adjustedX > IMAGE_WIDTH) {
      adjustedX = adjustedX % IMAGE_WIDTH;
    }
    // 해당 위치에 이미 별이 있는지 확인 (scaled 좌표 기준)
    if (isAreaOccupied(adjustedX, y)) {
      showMessage('이미 별이 있어요.');
      return;
    }
    // 새 별의 좌표: 원본 이미지 기준 좌표로 변환
    const newStar = {
      x: adjustedX / scaleX,
      y: y / scaleY,
    };
    setPendingStar(newStar);
  };

  // 해당 영역에 이미 별(또는 pending 별)이 있는지 확인 (반경 OCCUPIED_THRESHOLD 이내)
  const isAreaOccupied = (scaledX, scaledY) => {
    // starArray에 있는 별들 확인
    for (const star of starArray) {
      const starX = star.longitude * scaleX;
      const starY = star.latitude * scaleY;
      const distance = Math.hypot(scaledX - starX, scaledY - starY);
      if (distance < OCCUPIED_THRESHOLD) return true;
    }
    // 기존에 pendingStar가 있다면 체크
    if (pendingStar) {
      const pendingX = pendingStar.x * scaleX;
      const pendingY = pendingStar.y * scaleY;
      const distance = Math.hypot(scaledX - pendingX, scaledY - pendingY);
      if (distance < OCCUPIED_THRESHOLD) return true;
    }
    return false;
  };

  // 별이 이미 있는 곳을 누를 경우 처리 (기존 별 터치 시)
  const handleStarPress = (star) => {
    showMessage('이미 별이 있어요.');
  };

  // "다음" 버튼 클릭 시 실행되는 함수 (API 요청)
  const handleNext = async () => {
    if (!pendingStar) {
      console.error('별 위치가 선택되지 않았습니다.');
      return;
    }
    if (!authToken) {
      console.error('인증 토큰이 없습니다.');
      return;
    }
    const confirmedSkyId = String(currentSkyId);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('latitude', pendingStar.y);
    formData.append('longitude', pendingStar.x);
    formData.append('skyId', confirmedSkyId);
    if (mediaFiles && mediaFiles.length > 0) {
      mediaFiles.forEach((file, index) => {
        formData.append('mediaFiles', {
          uri: file.uri,
          name: file.name || `file_${index}.jpg`,
          type: file.type || 'image/jpeg',
        });
      });
    }
    try {
      const response = await axios.post(`${BASE_URL}/star-diary`, formData, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.status >= 200 && response.status < 300) {
        // 네비게이션: 내부 스택을 이용해 StarHomeMain으로 돌아감
        navigation.navigate('StarHomeMain');
      } else {
        console.error('Failed to save star diary', response.status);
      }
    } catch (error) {
      console.error('Error saving star diary:', error);
    }
  };

  // 기존 별 렌더링 (단일 이미지 복사본 2개로 처리)
  const renderStars = () => {
    return starArray.map((star) => {
      const key = `star-${star.starId}`;
      const starSize = 20;
      const starX = star.longitude * scaleX;
      const starY = star.latitude * scaleY;
      return (
        <React.Fragment key={key}>
          <TouchableOpacity
            style={{
              position: 'absolute',
              left: starX - starSize / 2,
              top: starY - starSize / 2,
              width: starSize,
              height: starSize,
            }}
            onPress={() => handleStarPress(star)}
          >
            <Image
              source={starImage}
              style={{ width: starSize, height: starSize }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              position: 'absolute',
              left: starX + IMAGE_WIDTH - starSize / 2,
              top: starY - starSize / 2,
              width: starSize,
              height: starSize,
            }}
            onPress={() => handleStarPress(star)}
          >
            <Image
              source={starImage}
              style={{ width: starSize, height: starSize }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </React.Fragment>
      );
    });
  };

  // 기존 별자리 렌더링 – 별자리 연결선과 별자리 이름은 흰색으로 표시하고, 별자리 내 별(원 모양)은 그리지 않음.
  const renderExistingConstellationsCopy = (copyOffset) => {
    if (!existingConstellation || existingConstellation.length === 0) return null;
    return existingConstellation.map((constel) => {
      // 별자리 내 별의 순서를 기준으로 정렬
      const sortedStars = [...(constel.stars || [])].sort((a, b) => a.order - b.order);
      // 기존 별 좌표 계산 방식: 별의 center = globalStar.longitude * scaleX, globalStar.latitude * scaleY
      const positions = sortedStars
        .map((cs) => {
          const globalStar = starArray.find(
            (s) => s.starId === cs.starId || s.id === cs.starId
          );
          if (globalStar) {
            const renderedX = globalStar.longitude * scaleX + copyOffset;
            const renderedY = globalStar.latitude * scaleY;
            return { x: renderedX, y: renderedY };
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
            key={`line-existing-${constel.constellationId}-${i}-${copyOffset}`}
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
      const avgX =
        positions.reduce((sum, pos) => sum + pos.x, 0) / positions.length;
      const avgY =
        positions.reduce((sum, pos) => sum + pos.y, 0) / positions.length;
      return (
        <React.Fragment key={`constellation-existing-${constel.constellationId}-${copyOffset}`}>
          {lineViews}
          <Text
            style={{
              position: 'absolute',
              left: avgX - 30,
              top: avgY - 10,
              color: 'white',
              fontSize: 16,
              fontWeight: 'bold',
            }}
          >
            {constel.constellationName}
          </Text>
        </React.Fragment>
      );
    });
  };

  // 새로 심은 별 (pendingStar) 렌더링 – 색상은 흰색, 크기는 30 (중심 정렬)
  const renderPendingStar = () => {
    if (!pendingStar) return null;
    const starSize = 30;
    const starX = pendingStar.x * scaleX;
    const starY = pendingStar.y * scaleY;
    return (
      <React.Fragment>
        <TouchableOpacity
          style={{
            position: 'absolute',
            left: starX - starSize / 2,
            top: starY - starSize / 2,
            width: starSize,
            height: starSize,
          }}
          disabled={true}
        >
          <Image
            source={starImage}
            style={{ width: starSize, height: starSize }}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            position: 'absolute',
            left: starX + IMAGE_WIDTH - starSize / 2,
            top: starY - starSize / 2,
            width: starSize,
            height: starSize,
          }}
          disabled={true}
        >
          <Image
            source={starImage}
            style={{ width: starSize, height: starSize }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </React.Fragment>
    );
  };

  return (
    <View style={styles.container}>
      {/* 배경 및 별, 별자리 렌더링 */}
      <View
        style={styles.backgroundContainer}
        {...panResponder.panHandlers}
        onLayout={(e) => {
          // container의 절대 좌표를 저장 (터치 좌표 계산용)
          setContainerLayout({
            x: e.nativeEvent.layout.x,
            y: e.nativeEvent.layout.y,
          });
        }}
      >
        <Animated.View
          style={[
            {
              flexDirection: 'row',
              position: 'absolute',
              top: 0,
              left: 0,
              width: IMAGE_WIDTH * 2,
              height: IMAGE_HEIGHT,
              transform: [{ translateX: offsetX }],
            },
          ]}
        >
          {/* 첫 번째 하늘 이미지 복사본 */}
          <View style={{ width: IMAGE_WIDTH, height: IMAGE_HEIGHT }}>
            <Image
              source={currentSkyImage}
              style={{ width: IMAGE_WIDTH, height: IMAGE_HEIGHT }}
              resizeMode="stretch"
              onLayout={({ nativeEvent }) =>
                console.log(
                  'StarPosition - rendered sky image height:',
                  nativeEvent.layout.height
                )
              }
            />
          </View>
          {/* 두 번째 하늘 이미지 복사본 */}
          <View style={{ width: IMAGE_WIDTH, height: IMAGE_HEIGHT }}>
            <Image
              source={currentSkyImage}
              style={{ width: IMAGE_WIDTH, height: IMAGE_HEIGHT }}
              resizeMode="stretch"
            />
          </View>
          {/* 기존 별자리 (두 복사본) */}
          {renderExistingConstellationsCopy(0)}
          {renderExistingConstellationsCopy(IMAGE_WIDTH)}
          {/* 기존 별들 */}
          {renderStars()}
          {/* 새로 심은 별 (pendingStar) */}
          {renderPendingStar()}
        </Animated.View>
        {/* 메시지 노출 */}
        {message && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        )}
      </View>
      {/* 다음 버튼 */}
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>다음</Text>
      </TouchableOpacity>
    </View>
  );
};

export default StarPosition;

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
    flexDirection: 'row',
  },
  starIcon: {
    position: 'absolute',
  },
  nextButton: {
    backgroundColor: '#87A7C0',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: '10%',
    borderRadius: 5,
    width: deviceWidth * 0.9,
    alignSelf: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  messageContainer: {
    position: 'absolute',
    bottom: '10%',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  messageText: {
    color: 'white',
    fontSize: 16,
  },
});

