// components/ConstellationDetail.js
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
  Dimensions,
  ScrollView,
  Alert, // 추가: Alert import
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');

// BASE_URL 상수 – 앞으로 모든 API 호출에 사용됩니다.
const BASE_URL = 'https://i12e207.p.ssafy.io'; 

const ConstellationDetail = ({ visible, constellation, onClose, refreshData }) => {
  const [authToken, setAuthToken] = useState(null);

  // 동적 토큰 불러오기
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

  // 정렬된 별 배열 (order 순으로 정렬)
  const sortedStars =
    constellation && constellation.stars
      ? [...constellation.stars].sort((a, b) => a.order - b.order)
      : [];

  // 미리보기 렌더링: 미리보기 영역 내에 항상 완전히 들어가도록 축소
  const renderPreview = () => {
    if (sortedStars.length === 0) return null;
    const starSize = 30; // 별 이미지 크기를 30으로 고정
    const xs = sortedStars.map(item => item.longitude);
    const ys = sortedStars.map(item => item.latitude);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);
    const constellationWidth = maxX - minX;
    const constellationHeight = maxY - minY;

    // 미리보기 영역의 최대 크기: 모달 내부의 previewArea 크기
    const previewAreaWidth = deviceWidth * 0.9 * 0.8;   // 모달 너비의 80%
    const previewAreaHeight = deviceHeight * 0.8 * 0.5;  // 모달 높이의 50%
    // 별자리 전체 크기가 previewArea보다 클 경우 축소하도록 scaleFactor 계산하고,
    // 항상 0.7배 정도 더 줄여서 여백을 둡니다.
    const scaleFactor = Math.min(
      previewAreaWidth / (constellationWidth || 1),
      previewAreaHeight / (constellationHeight || 1)
    ) * 0.7;

    // previewContainer의 실제 크기 (별자리 좌표에 따른 크기)
    const containerWidth = constellationWidth * scaleFactor;
    const containerHeight = constellationHeight * scaleFactor;

    return (
      <View style={[styles.previewContainer, { width: containerWidth, height: containerHeight }]}>
        {/* 별자리 선들 (색상: #87A7C0) */}
        {sortedStars.map((star, index) => {
          if (index === sortedStars.length - 1) return null;
          const nextStar = sortedStars[index + 1];
          const dx = nextStar.longitude - star.longitude;
          const dy = nextStar.latitude - star.latitude;
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          // 두 별의 중심 좌표:
          const centerX1 = (star.longitude - minX) * scaleFactor;
          const centerY1 = (star.latitude - minY) * scaleFactor;
          const centerX2 = (nextStar.longitude - minX) * scaleFactor;
          const centerY2 = (nextStar.latitude - minY) * scaleFactor;
          // 중간 좌표
          const midX = (centerX1 + centerX2) / 2;
          const midY = (centerY1 + centerY2) / 2;
          return (
            <View
              key={`line-modal-${index}`}
              style={{
                position: 'absolute',
                left: midX - (length * scaleFactor) / 2,
                top: midY - 1,
                width: length * scaleFactor,
                height: 2,
                backgroundColor: '#87A7C0',
                transform: [{ rotate: `${angle}deg` }],
              }}
            />
          );
        })}
        {/* 별 이미지 (tintColor: #87A7C0) */}
        {sortedStars.map((star, index) => (
          <Image
            key={`star-modal-${star.starId || index}`}
            source={require('../../assets/images/star.png')}
            style={{
              position: 'absolute',
              // 별의 중심을 (star.longitude - minX)*scaleFactor, (star.latitude - minY)*scaleFactor에 맞춤
              left: (star.longitude - minX) * scaleFactor - starSize / 2,
              top: (star.latitude - minY) * scaleFactor - starSize / 2,
              width: starSize,
              height: starSize,
              tintColor: '#87A7C0',
            }}
            resizeMode="contain"
          />
        ))}
      </View>
    );
  };

  // 별자리 삭제 함수
  const handleDelete = async () => {
    if (!authToken) {
      console.error("인증 토큰이 없습니다.");
      return;
    }
    try {
      const response = await axios.post(
        `${BASE_URL}/constellations/delete`,
        { constellationId: constellation.constellationId },
        {
          headers: {
            "Authorization": authToken,
            "Content-Type": "application/json",
          },
          validateStatus: () => true,
        }
      );
      console.log("Response JSON:", response.data);
      if (response.status === 200 && response.data.code === "SUCCESS") {
        onClose();
        if (refreshData) {
          refreshData();
        }
      } else {
        console.error("삭제 오류:", response.status, response.data);
      }
    } catch (error) {
      console.error("별자리 삭제 중 오류 발생:", error);
    }
  };

  // 변경: 삭제 확인 Alert 함수 (모달 대신 Alert 사용)
  const showDeleteAlert = () => {
    Alert.alert(
      "경고",
      "별자리를 삭제하면 복구할 수 없습니다. 정말 삭제하시겠습니까?",
      [
        {
          text: "취소",
          style: "cancel",
        },
        {
          text: "삭제",
          onPress: handleDelete,
          style: "destructive",
        },
      ]
    );
  };

  return (
    <>
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
                  <Text style={styles.modalTitle}>
                    {constellation ? constellation.constellationName : '별자리 상세'}
                  </Text>
                </View>
                <View style={styles.modalInnerContainer}>
                  {/* 미리보기 영역: previewArea는 모달 내부에서 가로 80%, 세로 50%로 고정 */}
                  <View style={styles.previewArea}>
                    {renderPreview()}
                  </View>
                  <View style={styles.buttonContainer}>
                    {/* 변경: 삭제 버튼을 누르면 Alert가 뜨도록 수정 */}
                    <TouchableOpacity
                      style={styles.modalButtonEqui}
                      onPress={showDeleteAlert}
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
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Modal 배경
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Modal 컨테이너
  modalContainer: {
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  // Modal 헤더
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
  // Modal 내부 컨테이너 (미리보기 영역과 버튼 영역 분리)
  modalInnerContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  // 미리보기 영역: 모달 내부에서 가로 80%, 세로 50%로 고정, 중앙 정렬
  previewArea: {
    width: deviceWidth * 0.9 * 0.8,
    height: deviceHeight * 0.8 * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // renderPreview에서 반환하는 실제 미리보기 컨테이너
  previewContainer: {
    alignSelf: 'center',
  },
  // 버튼 영역 (모달 하단)
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
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
  // 삭제 경고 모달 내부 내용 (더 이상 사용하지 않음)
  warningContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ConstellationDetail;
