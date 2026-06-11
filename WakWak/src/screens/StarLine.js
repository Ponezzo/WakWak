// screens/StarLine.js
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
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal, // 기본 Modal 임포트
  TouchableWithoutFeedback,
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

const StarLine = ({ navigation, route }) => {
  // 전달받은 별 배열의 데이터는 { starId, latitude, longitude } 형태임
  const { skyId, starArray: passedStarArray, constellationData: passedConstellationData } = route.params || {};

  // 기존 별자리 데이터 (필요시 추후 활용)
  const [existingConstellation, setExistingConstellation] = useState(passedConstellationData || []);

  const [currentSkyId] = useState(skyId || 1);
  const [starArray] = useState(passedStarArray || []);

  // pendingStar는 본 예제에서는 사용하지 않음 (추후 필요하면 유지)
  const [pendingStar, setPendingStar] = useState(null);

  // constellation 배열에는 사용자가 새로 선택한 별(순서대로)이 저장됩니다.
  const [constellation, setConstellation] = useState([]);
  const [lines, setLines] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [interactionsDisabled, setInteractionsDisabled] = useState(false);
  const [name, setName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  // 삭제 금지 – 하늘 이미지 관련 상태
  const [selectedModalSkyId, setSelectedModalSkyId] = useState(currentSkyId);

  // 인증 토큰: AsyncStorage에서 동적으로 불러오기
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

  // currentSkyImage 및 스케일 계산
  const currentSkyImage = getSkyImage(currentSkyId);
  const { width: originalWidth, height: originalHeight } = Image.resolveAssetSource(currentSkyImage);
  const IMAGE_HEIGHT = deviceHeight;
  const IMAGE_WIDTH = (deviceHeight / originalHeight) * originalWidth;
  const scaleX = IMAGE_WIDTH / originalWidth;
  const scaleY = IMAGE_HEIGHT / originalHeight;

  // 모달 상태 최신값 ref
  const modalVisibleRef = useRef(modalVisible);
  useEffect(() => {
    modalVisibleRef.current = modalVisible;
    console.log("modalVisible changed:", modalVisible);
  }, [modalVisible]);

  // PanResponder – 기존 코드 유지
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
      onPanResponderRelease: () => {
        offsetX.stopAnimation();
      },
    })
  ).current;

  // 헬퍼 함수: 기존 별자리에 속한 별 판별
  const isStarInExistingConstellation = (star) => {
    return existingConstellation.some(constel =>
      (constel.stars || []).some(cs => cs.starId === star.starId || cs.starId === star.id)
    );
  };

  // handleStarPress: 별 터치 시 constellation 배열에 추가
  const handleStarPress = (star) => {
    console.log("Star pressed:", star);
    if (interactionsDisabled) return;
    if (constellation.find(item => item.id === star.starId)) return;
    if (isStarInExistingConstellation(star)) return;
    const starX = star.longitude * scaleX;
    const starY = star.latitude * scaleY;
    setConstellation([...constellation, { id: star.starId, order: constellation.length + 1, x: starX, y: starY }]);
  };

  // COMPLETE 버튼: 선택된 별들을 잇는 선 생성 및 애니메이션 후 모달 표시
  const handleComplete = () => {
    console.log("handleComplete called, constellation:", constellation, "name:", name);
    if (constellation.length < 2 || name.trim() === '') {
      console.log('완료 조건 미충족');
      return;
    }
    setInteractionsDisabled(true);
    const computedLines = [];
    for (let i = 0; i < constellation.length - 1; i++) {
      const start = constellation[i];
      const end = constellation[i + 1];
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      computedLines.push({
        start,
        end,
        length,
        angle,
        animatedValue: new Animated.Value(0),
      });
    }
    console.log("Computed Lines:", computedLines);
    setLines(computedLines);

    if (computedLines.length === 0) {
      console.log("No lines to animate.");
      setInteractionsDisabled(false);
      return;
    }

    const animations = computedLines.map(line => {
      console.log("Starting animation for line with length:", line.length);
      return Animated.timing(line.animatedValue, {
        toValue: line.length,
        duration: 700,
        useNativeDriver: false,
      });
    });
    console.log("Animations array:", animations);
    Animated.sequence(animations).start(() => {
      console.log("Animation sequence completed");
      setCompleted(true);
      setInteractionsDisabled(false);
      setModalVisible(true);
      console.log("모달 상태 변경: true");
    });
  };

  // RESET 버튼: 선택한 별자리 초기화
  const handleReset = () => {
    setConstellation([]);
    setLines([]);
    setCompleted(false);
    setInteractionsDisabled(false);
  };

  // renderStars: 단일 star.png를 사용하여 별 렌더링
  const renderStars = () => {
    return starArray.map((star) => {
      const key = `star-${star.starId}`;
      const starSize = 20;
      const starX = star.longitude * scaleX;
      const starY = star.latitude * scaleY;
      if (isStarInExistingConstellation(star)) return null;
      const selected = constellation.some(item => item.id === star.starId);

      if (selected && !completed) {
        // 선택된 별은 회색으로 렌더링
        return (
          <React.Fragment key={key}>
            <TouchableOpacity
              style={{ position: 'absolute', left: starX - 10, top: starY - 10, width: starSize, height: starSize }}
              disabled={true}
            >
              <Image
                source={starImage}
                style={{ width: starSize, height: starSize, tintColor: 'gray' }}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ position: 'absolute', left: starX + IMAGE_WIDTH - 10, top: starY - 10, width: starSize, height: starSize }}
              disabled={true}
            >
              <Image
                source={starImage}
                style={{ width: starSize, height: starSize, tintColor: 'gray' }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </React.Fragment>
        );
      } else {
        return (
          <React.Fragment key={key}>
            <TouchableOpacity
              style={{ position: 'absolute', left: starX - 10, top: starY - 10, width: starSize, height: starSize }}
              onPress={() => handleStarPress(star)}
              disabled={selected && !completed}
            >
              <Image
                source={starImage}
                style={{ width: starSize, height: starSize }}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ position: 'absolute', left: starX + IMAGE_WIDTH - 10, top: starY - 10, width: starSize, height: starSize }}
              onPress={() => handleStarPress(star)}
              disabled={selected && !completed}
            >
              <Image
                source={starImage}
                style={{ width: starSize, height: starSize }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </React.Fragment>
        );
      }
    });
  };

  // renderExistingConstellationsCopy: 기존 별자리 렌더링 (두 복사본)
  const renderExistingConstellationsCopy = (copyOffset) => {
    if (!existingConstellation || existingConstellation.length === 0) return null;
    const starSize = 20;
    return existingConstellation.map((constel) => {
      const sortedStars = [...(constel.stars || [])].sort((a, b) => a.order - b.order);
      const positions = sortedStars
        .map((cs) => {
          const globalStar = starArray.find(s => s.starId === cs.starId || s.id === cs.starId);
          if (globalStar) {
            const renderedX = globalStar.longitude * scaleX + copyOffset;
            const renderedY = globalStar.latitude * scaleY;
            return { x: renderedX + starSize / 2, y: renderedY + starSize / 2 };
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
              backgroundColor: 'black', // 미리보기 선 색상: 검은색
              transform: [{ rotate: `${angle}deg` }],
            }}
          />
        );
      }
      const avgX = positions.reduce((sum, pos) => sum + pos.x, 0) / positions.length;
      const avgY = positions.reduce((sum, pos) => sum + pos.y, 0) / positions.length;
      return (
        <React.Fragment key={`constellation-existing-${constel.constellationId}-${copyOffset}`}>
          {lineViews}
          <Text
            style={{
              position: 'absolute',
              left: avgX - 30,
              top: avgY - 10,
              color: 'black',
              fontSize: 16,
              fontWeight: 'bold',
            }}
          >
            {constel.constellationName}
          </Text>
          {positions.map((pos, index) => (
            <View
              key={`constellation-star-existing-${constel.constellationId}-${index}-${copyOffset}`}
              style={{
                position: 'absolute',
                left: pos.x - starSize / 2,
                top: pos.y - starSize / 2,
                width: starSize,
                height: starSize,
                borderRadius: starSize / 2,
                backgroundColor: 'black',
              }}
            />
          ))}
        </React.Fragment>
      );
    });
  };

  const submitConstellation = async () => {
    const constellationName = name.trim() ? name.trim() + '자리' : '자리';
    const constellationData = constellation.map(item => ({
      starId: item.id,
      starOrder: item.order
    }));

    if (!authToken) {
      console.error("인증 토큰이 없습니다.");
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/constellations`,
        { constellationName, constellationData },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken,
          },
          validateStatus: () => true,
        }
      );

      if ((response.status === 200 || response.status === 201) && response.data.code === "SUCCESS") {
        console.log("성공:", response.data.message);
        navigation.navigate('StarHomeMain');
      } else {
        console.error("오류:", response.status, response.data);
      }
    } catch (error) {
      console.error("별자리 생성 요청 중 오류 발생:", error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* 배경 및 별, 별자리 렌더링 */}
      <View style={styles.backgroundContainer} {...panResponder.panHandlers}>
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
              onLayout={({ nativeEvent }) => console.log('StarLine - rendered sky image height:', nativeEvent.layout.height)}
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
          {renderExistingConstellationsCopy(0)}
          {renderExistingConstellationsCopy(IMAGE_WIDTH)}
          {/* 새로운 별자리 선들 */}
          {lines && lines.length > 0 && (
            <>
              {lines.map((line, index) => (
                <Animated.View
                  key={`new-line-${index}-0`}
                  style={{
                    position: 'absolute',
                    left: line.start.x,
                    top: line.start.y - 1.5,
                    width: line.animatedValue,
                    height: 3,
                    backgroundColor: 'white',
                    transform: [
                      { translateX: Animated.divide(line.animatedValue, -2) },
                      { rotate: `${line.angle}deg` },
                      { translateX: Animated.divide(line.animatedValue, 2) },
                    ],
                  }}
                />
              ))}
              {lines.map((line, index) => (
                <Animated.View
                  key={`new-line-${index}-${IMAGE_WIDTH}`}
                  style={{
                    position: 'absolute',
                    left: line.start.x + IMAGE_WIDTH,
                    top: line.start.y - 1.5,
                    width: line.animatedValue,
                    height: 3,
                    backgroundColor: 'white',
                    transform: [
                      { translateX: Animated.divide(line.animatedValue, -2) },
                      { rotate: `${line.angle}deg` },
                      { translateX: Animated.divide(line.animatedValue, 2) },
                    ],
                  }}
                />
              ))}
            </>
          )}
          {renderStars()}
        </Animated.View>
      </View>

      {/* 이름 입력 칸 (키보드와 함께 이동) */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.nameInputContainer}
      >
        <TextInput
          style={styles.nameInput}
          placeholder="별자리 이름을 입력하세요"
          value={name}
          onChangeText={setName}
        />
      </KeyboardAvoidingView>

      {/* 하단 고정 버튼 (RESET, 완료) - 키보드와 무관하게 고정 */}
      <View style={styles.fixedButtonContainer}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.modalButtonEqui} onPress={handleReset}>
            <Text style={styles.modalButtonEquiText}>RESET</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalButtonClose} onPress={handleComplete}>
            <Text style={styles.modalButtonCloseText}>완료</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
  visible={modalVisible}
  transparent={true}
  animationType="slide"
  onRequestClose={() => setModalVisible(false)}
>
  <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
    <View style={styles.modalBackground}>
      <TouchableWithoutFeedback onPress={() => {}}>
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {name.trim() ? name.trim() + '자리' : '자리'}
            </Text>
          </View>
          {/* Modal Inner Container */}
          <View style={styles.modalInnerContainer}>
            <View style={styles.centeredPreviewContainer}>
              {(() => {
                if (constellation.length === 0) return null;
                const starSize = 30;
                const xs = constellation.map(item => item.x);
                const ys = constellation.map(item => item.y);
                const minX = Math.min(...xs);
                const minY = Math.min(...ys);
                const maxX = Math.max(...xs);
                const maxY = Math.max(...ys);
                const previewWidth = maxX - minX;
                const previewHeight = maxY - minY;
                const maxAllowedHeight = deviceHeight * 0.4;
                let scaleFactor = 1;
                if (previewHeight > maxAllowedHeight) {
                  scaleFactor = maxAllowedHeight / previewHeight;
                }
                return (
                  <View style={[styles.previewContainer, { width: previewWidth * scaleFactor, height: previewHeight * scaleFactor }]}>
                    {lines.map((line, index) => {
                      const adjustedLeft = (line.start.x - minX) * scaleFactor;
                      const adjustedTop = (line.start.y - minY) * scaleFactor;
                      const scaledLength = line.length * scaleFactor;
                      return (
                        <View
                          key={`line-modal-${index}`}
                          style={{
                            position: 'absolute',
                            left: adjustedLeft,
                            top: adjustedTop,
                            width: scaledLength,
                            height: 3 * scaleFactor,
                            backgroundColor: '#87A7C0',
                            transform: [
                              { translateX: -scaledLength / 2 },
                              { rotate: `${line.angle}deg` },
                              { translateX: scaledLength / 2 },
                            ],
                          }}
                        />
                      );
                    })}
                    {constellation.map(star => (
                      <Image
                        key={`star-modal-${star.id}`}
                        source={starImage}
                        style={{
                          position: 'absolute',
                          left: (star.x - minX - starSize / 2) * scaleFactor,
                          top: (star.y - minY - starSize / 2) * scaleFactor,
                          width: starSize * scaleFactor,
                          height: starSize * scaleFactor,
                          tintColor: '#87A7C0',
                        }}
                        resizeMode="contain"
                      />
                    ))}
                  </View>
                );
              })()}
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.modalButtonEqui} onPress={submitConstellation}>
                <Text style={styles.modalButtonEquiText}>생성하기</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonClose} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonCloseText}>취소</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  </TouchableWithoutFeedback>
</Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  nameInputContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 2,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    padding: 10,
    backgroundColor: 'white',
    width: '100%',
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonEqui: {
    backgroundColor: '#ffffff',
    borderColor: '#d4d4d4',
    borderWidth: 1,
    borderRadius: 10,
    width: '47%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonEquiText: {
    color: 'black',
    fontSize: 15,
    fontWeight: 'bold',
  },
  modalButtonClose: {
    backgroundColor: '#87A7C0',
    borderColor: '#87A7C0',
    borderWidth: 1,
    borderRadius: 10,
    width: '47%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonCloseText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    // zIndex 추가하여 최상위에 렌더링되도록 함
    zIndex: 9999,
  },
  modalContainer: {
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: '#87A7C0',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    height: 80,
  },
  modalTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  modalInnerContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  centeredPreviewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    alignSelf: 'center',
  },
});

export default StarLine;