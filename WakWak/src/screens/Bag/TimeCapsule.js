import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Dimensions, 
  ScrollView, 
  Modal, 
  Alert 
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Swiper from 'react-native-swiper';

const { width: screenWidth } = Dimensions.get('window');
const DEFAULT_IMAGE = require('../../../assets/images/capsule.png');
const ITEMS_PER_PAGE = 9;

// BASE_URL 상수 – 앞으로 모든 API 호출에 사용됩니다.
const BASE_URL = 'https://i12e207.p.ssafy.io'; 

const TimeCapsule = () => {
  const [timeCapsules, setTimeCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCapsule, setSelectedCapsule] = useState(null);
  const scrollViewRef = useRef(null);

  // AUTH_TOKEN를 불러오는 함수
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

  // 컴포넌트 마운트 시 토큰 불러오기
  useEffect(() => {
    getStoredToken();
  }, []);

  const fetchTimeCapsules = async () => {
    try {
      if (!authToken) {
        await getStoredToken();
      }
      const response = await axios.get(
        `${BASE_URL}/inventory/time-capsules`,
        {
          headers: { Authorization: authToken },
        }
      );

      if (response.data && response.data.code === "SUCCESS") {
        const capsules = response.data.data;
        setTimeCapsules(capsules);
        setErrorMessage(null);
      } else {
        setErrorMessage("타임캡슐을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error('Error fetching time capsules:', error);
      setErrorMessage("타임캡슐 정보를 가져오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchTimeCapsules();
    }
  }, [authToken]);

  const handleDeleteCapsule = async (capsuleId) => {
    Alert.alert(
      "타임캡슐 삭제",
      "정말로 이 타임캡슐을 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await axios.post(
                `${BASE_URL}/time-capsules/delete`,
                { capsuleId },
                { headers: { Authorization: authToken } }
              );

              if (response.data && response.data.code === "SUCCESS") {
                setModalVisible(false);
                fetchTimeCapsules();
                Alert.alert("성공", "타임캡슐이 삭제되었습니다.");
              } else {
                Alert.alert("오류", "타임캡슐 삭제에 실패했습니다.");
              }
            } catch (error) {
              console.error('Error deleting time capsule:', error);
              Alert.alert("오류", "타임캡슐 삭제 중 오류가 발생했습니다.");
            }
          }
        }
      ]
    );
  };

  const handleTimeCapsulePress = async (capsuleId) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/time-capsules?capsuleId=${capsuleId}`,
        { headers: { Authorization: authToken } }
      );
      
      if (response.data && response.data.code === "SUCCESS") {
        setSelectedCapsule(response.data.data);
        setModalVisible(true);
      }
    } catch (error) {
      console.error('Error fetching time capsule details:', error);
    }
  };

  const formatDateCompact = (dateString) => {
    if (!dateString) return "날짜 정보가 없습니다!";
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: '2-digit',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePageChange = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newPage = Math.round(offsetX / screenWidth);
    setCurrentPage(newPage);
  };

  // ============= 모달 화면 =============
  const renderModal = () => {
    if (!selectedCapsule) return null;

    const sharedUsers = selectedCapsule.sharedUsers?.filter(
      user => user.userId !== selectedCapsule.author.userId
    ) || [];

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedCapsule.title || "제목이 없습니다!"}
              </Text>
            </View>
            {/* 헤더 아래 영역 */}
            <View style={styles.modalInnerContainer}>
              <ScrollView style={styles.modalContentScroll}>
                {/* 미디어 영역 (미디어 파일이 있을 경우에만, 타이틀 제거 및 내부 중앙 정렬) */}
                {selectedCapsule.mediaUrls && selectedCapsule.mediaUrls.length > 0 && (
                  <View style={styles.sectionContainer}>
                    <View style={styles.mediaContainer}>
                      <Swiper
                        showsButtons={false}
                        autoplay={false}
                        dotColor="gray"
                        activeDotColor="white"
                        style={{ height: screenWidth }}
                      >
                        {selectedCapsule.mediaUrls.map((url, index) => (
                          <View key={index} style={styles.swiperSlide}>
                            <Image
                              source={{ uri: url }}
                              style={styles.mediaImage}
                              resizeMode="contain"
                            />
                          </View>
                        ))}
                      </Swiper>
                    </View>
                  </View>
                )}
                {/* 내용 영역 (타이틀 제거) */}
                <View style={styles.sectionContainer}>
                  <Text style={styles.content}>
                    {selectedCapsule.content || "내용이 없습니다!"}
                  </Text>
                </View>
                {/* 구분선: 내용과 함께한 친구 사이 */}
                {sharedUsers.length > 0 && (
                  <View style={styles.separator} />
                )}
                {/* 함께한 친구 영역 (이미지 제거, 이름만 2열 그리드 및 가로 스크롤) */}
                {sharedUsers.length > 0 && (
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>함께한 친구</Text>
                    {(() => {
                      const rows = [];
                      for (let i = 0; i < sharedUsers.length; i += 2) {
                        rows.push(
                          <View key={i} style={styles.sharedUserRow}>
                            <View style={styles.sharedUserCell}>
                              <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                                <Text style={styles.sharedUserName} numberOfLines={1} ellipsizeMode="tail">
                                  {sharedUsers[i].nickname}
                                </Text>
                              </ScrollView>
                            </View>
                            {sharedUsers[i + 1] ? (
                              <View style={styles.sharedUserCell}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                                  <Text style={styles.sharedUserName} numberOfLines={1} ellipsizeMode="tail">
                                    {sharedUsers[i + 1].nickname}
                                  </Text>
                                </ScrollView>
                              </View>
                            ) : (
                              <View style={styles.sharedUserCell} />
                            )}
                          </View>
                        );
                      }
                      return rows;
                    })()}
                  </View>
                )}
                {/* 구분선: 함께한 친구와 작성/열람일 영역 사이 */}
                {sharedUsers.length > 0 && (
                  <View style={styles.separator} />
                )}
                {/* 작성일/열람일 영역을 스크롤뷰 마지막에 포함 */}
                <View style={styles.sectionContainer}>
                  <Text style={styles.dateInfo}>
                    작성일: {formatDateCompact(selectedCapsule.createdAt)}
                  </Text>
                  <Text style={styles.dateInfo}>
                    열람일: {formatDateCompact(selectedCapsule.opendedAt)}
                  </Text>
                </View>
              </ScrollView>
              {/* 하단 고정 영역: 버튼만 남김 */}
              <View style={styles.bottomFixedContainer}>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.modalButtonEqui}
                    onPress={() => handleDeleteCapsule(selectedCapsule.capsuleId)}
                  >
                    <Text style={styles.modalButtonEquiText}>삭제</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalButtonClose}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalButtonCloseText}>닫기</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  };
  // =======================================================

  const renderPage = (pageIndex) => {
    const startIndex = pageIndex * ITEMS_PER_PAGE;
    const pageItems = timeCapsules.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    const rows = [];

    for (let i = 0; i < 3; i++) {
      const rowItems = pageItems.slice(i * 3, (i * 3) + 3);
      const row = (
        <View key={`row-${i}`} style={styles.gridRow}>
          {rowItems.map((capsule, index) => (
            <View key={`cell-${index}`} style={styles.gridCell}>
              <TouchableOpacity 
                style={styles.timeCapsule}
                onPress={() => handleTimeCapsulePress(capsule.capsuleId)}
              >
                <Image source={DEFAULT_IMAGE} style={styles.capsuleImage} />
                <Text style={styles.capsuleTitle} numberOfLines={1}>
                  {capsule.title || "제목 없음"}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
          {[...Array(3 - rowItems.length)].map((_, index) => (
            <View key={`empty-${index}`} style={styles.gridCell}>
              <View style={styles.emptyCell} />
            </View>
          ))}
        </View>
      );
      rows.push(row);
    }

    return (
      <View key={`page-${pageIndex}`} style={styles.page}>
        {rows}
      </View>
    );
  };

  if (loading) {
    return <View style={styles.container} />;
  }

  const totalPages = Math.ceil(timeCapsules.length / ITEMS_PER_PAGE);

  return (
    <View style={styles.container}>
      {errorMessage ? (
        <Text style={styles.errorMessage}>{errorMessage}</Text>
      ) : timeCapsules.length === 0 ? (
        <Text style={styles.noDataText}>보관된 타임캡슐이 없습니다.</Text>
      ) : (
        <>
          <Text style={styles.countText}>
            보관된 타임캡슐: {timeCapsules.length}개
          </Text>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handlePageChange}
            scrollEventThrottle={16}
            style={styles.scrollView}
          >
            {[...Array(totalPages)].map((_, index) => renderPage(index))}
          </ScrollView>
          {renderModal()}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  countText: {
    fontSize: 18,
    margin: 20,
    fontWeight: '600',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  page: {
    width: screenWidth,
    padding: 20,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  gridCell: {
    flex: 1,
    margin: 5,
  },
  timeCapsule: {
    height: 180,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  emptyCell: {
    height: 180,
    backgroundColor: 'transparent',
  },
  capsuleImage: {
    width: '100%',
    height: '65%',
    resizeMode: 'cover',
  },
  capsuleTitle: {
    height: '25%',
    textAlign: 'center',
    padding: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  errorMessage: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  // ============= 모달 관련 스타일 =============
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  modalContentScroll: {
    flex: 1,
  },
  sectionContainer: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    textAlign: 'center',
  },
  // 미디어 영역: 내부 요소 중앙 정렬
  mediaContainer: {
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swiperSlide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  // 작성일/열람일 텍스트 스타일
  dateInfo: {
    fontSize: 12,
    color: '#666',
    marginVertical: 2,
    textAlign: 'center',
  },
  // 하단 고정 영역 (버튼만 포함)
  bottomFixedContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
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
  // 공유 대상 영역: 2열 그리드 스타일
  sharedUserRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  sharedUserCell: {
    width: '48%',
    paddingHorizontal: 5,
  },
  sharedUserName: {
    fontSize: 14,
    color: '#333',
  },
  // separator 스타일: 가로줄 효과
  separator: {
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginVertical: 10,
  },
});

export default TimeCapsule;
