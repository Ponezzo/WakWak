import React, { useState, useEffect, useRef } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  TouchableWithoutFeedback, 
  Image, 
  ScrollView, 
  Dimensions, 
  Alert 
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width: deviceWidth } = Dimensions.get('window');
const modalWidth = deviceWidth * 0.9;
const slideWidth = modalWidth - 40;

const BASE_URL = 'https://i12e207.p.ssafy.io';

const StarDetail = ({ visible, starId, constellationData, onClose }) => {
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoadStatus, setImageLoadStatus] = useState({});
  const [allImagesFailed, setAllImagesFailed] = useState(false);
  const scrollViewRef = useRef(null);
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

  useEffect(() => {
    if (visible && starId && authToken) {
      setIsLoading(true);
      const fetchStarDiaryDetail = async () => {
        try {
          const response = await axios.post(
            `${BASE_URL}/star-diary/detail`,
            { starId },
            {
              headers: {
                Authorization: authToken,
                "Content-Type": "application/json",
              },
              validateStatus: () => true,
            }
          );
          console.log("GET /star-diary/detail response:", response.data);
          if (response.data.code === "SU") {
            setDetail(response.data);
          } else {
            console.warn("별 일기 상세 조회 실패:", response.data);
          }
          setIsLoading(false);
          setImageLoadStatus({});
          setAllImagesFailed(false);
        } catch (error) {
          console.error("별 일기 상세 조회 중 오류 발생:", error);
          setIsLoading(false);
        }
      };
      fetchStarDiaryDetail();
    }
  }, [visible, starId, authToken]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / slideWidth);
    setCurrentIndex(index);
  };

  const handleNextSlide = () => {
    if (detail && detail.mediaUrls && currentIndex < detail.mediaUrls.length - 1) {
      const nextIndex = currentIndex + 1;
      scrollViewRef.current?.scrollTo({ x: nextIndex * slideWidth, animated: true });
      setCurrentIndex(nextIndex);
    }
  };

  const handlePrevSlide = () => {
    if (detail && detail.mediaUrls && currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      scrollViewRef.current?.scrollTo({ x: prevIndex * slideWidth, animated: true });
      setCurrentIndex(prevIndex);
    }
  };

  useEffect(() => {
    if (detail && detail.mediaUrls && detail.mediaUrls.length > 0) {
      const timer = setTimeout(() => {
        const hasLoaded = Object.values(imageLoadStatus).some(status => status === true);
        if (!hasLoaded) {
          setAllImagesFailed(true);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [detail, imageLoadStatus]);

  const handleDelete = async () => {
    if (!authToken) {
      console.error("인증 토큰이 없습니다.");
      return;
    }
    try {
      const res1 = await axios.post(
        `${BASE_URL}/star-diary/delete`,
        { starId },
        {
          headers: {
            Authorization: authToken,
            "Content-Type": "application/json",
          },
          validateStatus: () => true,
        }
      );
      if (res1.status !== 200) {
        console.error("별 일기 삭제 실패:", res1.status);
        return;
      }
      if (constellationData && Array.isArray(constellationData)) {
        for (const constellation of constellationData) {
          const exists = constellation.stars.some(cs => cs.starId === starId);
          if (exists) {
            const res2 = await axios.post(
              `${BASE_URL}/constellations/delete`,
              { constellationId: constellation.constellationId },
              {
                headers: {
                  Authorization: authToken,
                  "Content-Type": "application/json",
                },
                validateStatus: () => true,
              }
            );
            if (res2.status !== 200) {
              console.error("별자리 삭제 실패:", res2.status);
            }
          }
        }
      }
      onClose();
    } catch (error) {
      console.error("삭제 중 오류 발생:", error);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "경고",
      "별을 삭제하면 별을 포함한 별자리도 삭제 돼요. 정말 삭제하시겠어요?",
      [
        { text: "취소", style: "cancel" },
        { text: "삭제", style: "destructive", onPress: handleDelete }
      ],
      { cancelable: true }
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalBackground}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <View style={styles.headerTitleContainer}>
                  <Text style={styles.modalTitle}>
                    {detail ? detail.title : ""}
                  </Text>
                </View>
                <Text style={styles.dateText}>
                  {detail ? formatDate(detail.createdAt) : ""}
                </Text>
              </View>
              <View style={styles.modalInnerContainer}>
                {detail && detail.mediaUrls && detail.mediaUrls.length > 0 && (
                  allImagesFailed ? (
                    <View style={styles.fallbackIconContainer}>
                      <Ionicons name="images-outline" size={30} color="black" />
                    </View>
                  ) : (
                    <View style={styles.imageContainer}>
                      <ScrollView
                        ref={scrollViewRef}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                      >
                        {detail.mediaUrls.map((url, index) => (
                          <View
                            key={index}
                            style={{
                              width: slideWidth,
                              height: 200,
                              justifyContent: 'center',
                              alignItems: 'center'
                            }}
                          >
                            {url ? (
                              <Image
                                source={{ uri: url }}
                                style={styles.mediaImage}
                                resizeMode="contain"
                                onLoad={() =>
                                  setImageLoadStatus(prev => ({ ...prev, [index]: true }))
                                }
                                onError={() =>
                                  setImageLoadStatus(prev => ({ ...prev, [index]: false }))
                                }
                              />
                            ) : null}
                          </View>
                        ))}
                      </ScrollView>
                      <View style={styles.dotContainer}>
                        {detail.mediaUrls.map((_, index) => (
                          <View
                            key={index}
                            style={[
                              styles.dot,
                              currentIndex === index && styles.activeDot,
                            ]}
                          />
                        ))}
                      </View>
                      {detail.mediaUrls.length > 1 && currentIndex > 0 && (
                        <TouchableOpacity style={styles.leftArrowButton} onPress={handlePrevSlide}>
                          <Text style={styles.arrowText}>&lt;</Text>
                        </TouchableOpacity>
                      )}
                      {detail.mediaUrls.length > 1 && currentIndex < detail.mediaUrls.length - 1 && (
                        <TouchableOpacity style={styles.rightArrowButton} onPress={handleNextSlide}>
                          <Text style={styles.arrowText}>&gt;</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )
                )}
                <View style={styles.textContainer}>
                  <ScrollView style={styles.contentContainer}>
                    {detail ? (
                      <Text style={styles.content}>{detail.content}</Text>
                    ) : (
                      <Text style={styles.content}>.</Text>
                    )}
                  </ScrollView>
                </View>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.modalButtonEqui}
                  onPress={confirmDelete}
                >
                  <Text style={styles.modalButtonEquiText}>삭제</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButtonClose}
                  onPress={onClose}
                >
                  <Text style={styles.modalButtonCloseText}>닫기</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: modalWidth,
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: '#87A7C0',
    height: 80,
    flexDirection: 'column',
  },
  headerTitleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  dateText: {
    height: 20,
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  modalInnerContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  fallbackIconContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dotContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  leftArrowButton: {
    position: 'absolute',
    left: 10,
    top: '50%',
    transform: [{ translateY: -15 }],
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightArrowButton: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -15 }],
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  textContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    flex: 1,
  },
  content: {
    fontSize: 16,
    color: '#001f3f',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
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
});

export default StarDetail;
