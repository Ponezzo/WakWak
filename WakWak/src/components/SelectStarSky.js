// components/SelectStarSky.js
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableWithoutFeedback, Image, Pressable, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 기본적으로 1~4에 해당하는 제목과 이미지를 정의합니다.
const skyInfo = [
  { id: 1, title: "별빛의 속삭임", source: require('../../assets/images/sky1.png') },
  { id: 2, title: "보랏빛의 꿈", source: require('../../assets/images/sky2.png') },
  { id: 3, title: "새벽을 부르는 노래", source: require('../../assets/images/sky3.png') },
  { id: 4, title: "노을에 물든 기억", source: require('../../assets/images/sky4.png') },
];

// getSkyImage 함수: 전달받은 id 값을 4로 나눈 나머지를 기준으로 이미지를 반환 (0이면 4로 매핑)
const getSkyImage = (id) => {
  const numId = Number(id);
  let mappedId = numId % 4;
  if (mappedId === 0) mappedId = 4;
  const found = skyInfo.find(item => item.id === mappedId);
  return found ? found.source : skyInfo[0].source;
};

// BASE_URL 상수 – 앞으로 모든 API 호출에 사용됩니다.
const BASE_URL = 'https://i12e207.p.ssafy.io'; 

const SelectStarSky = ({ visible, onClose, onConfirm, selectedSkyId }) => {
  // skyListData는 API 반환값 개수만큼의 객체 배열입니다.
  // 각 객체: { originalId, mappedId, title }
  const [skyListData, setSkyListData] = useState([]);
  // 선택된 값는 API에서 반환받은 원본 id 값 그대로 저장합니다.
  const [selectedSky, setSelectedSky] = useState(selectedSkyId || null);
  const [hoveredItem, setHoveredItem] = useState(null); // hover 상태 관리

  // 동적 토큰 관리
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
    if (visible && authToken) {
      const fetchStarSkyList = async () => {
        try {
          const response = await axios.get(`${BASE_URL}/star-sky/list`, {
            headers: {
              "Authorization": authToken
            },
            validateStatus: () => true,
          });
          console.log("GET /star-sky/list response:", response.data);
          
          if (response.status === 200 && response.data.code === "SUCCESS") {
            // API에서 반환된 각 항목은 starSkyId 라고 가정합니다.
            const ids = Array.isArray(response.data.data)
              ? response.data.data.map(item => item.starSkyId)
              : [];
            // 반환된 id 개수만큼, 각각의 id를 4로 나눈 나머지(0이면 4)를 구한 후, 해당하는 제목과 이미지를 매핑합니다.
            const mappedData = ids.map(id => {
              const numId = Number(id);
              let mappedId = numId % 4;
              if (mappedId === 0) mappedId = 4;
              const info = skyInfo.find(item => item.id === mappedId);
              return {
                originalId: id,
                mappedId, // 1~4 사이의 값
                title: info ? info.title : "",
              };
            });
            setSkyListData(mappedData);
          } else {
            console.warn("예상치 못한 응답 구조:", response.status, response.data);
          }
        } catch (error) {
          console.error("별 하늘 목록 요청 중 오류 발생:", error);
        }
      };
      fetchStarSkyList();
    }
  }, [visible, authToken]);

  // 현재 선택된 항목의 mappedId를 계산
  const getCurrentMappedId = () => {
    if (!selectedSky) return null;
    const numId = Number(selectedSky);
    let mappedId = numId % 4;
    if (mappedId === 0) mappedId = 4;
    return mappedId;
  };
  const currentMappedId = getCurrentMappedId();
  
  const handleConfirm = async () => {
    if (!selectedSky || !authToken) return;
    try {
      const response = await axios.post(
        `${BASE_URL}/star-sky/equip`,
        { skyId: selectedSky }, // 원본 id 값을 전달합니다.
        {
          headers: {
            "Authorization": authToken,
            "Content-Type": "application/json"
          },
          validateStatus: () => true,
        }
      );
      console.log("Equip response:", response.data);
      if (response.status === 200 && response.data.code === "SUCCESS") {
        onConfirm(selectedSky);
      } else {
        console.error("별 하늘 착용 실패:", response.status, response.data);
      }
    } catch (error) {
      console.error("별 하늘 착용 요청 중 오류 발생:", error);
    }
  };
  

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* 모달 외부 터치를 감지하여 모달을 닫습니다 */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalBackground}>
          {/* 내부 터치 이벤트가 모달 외부로 전파되지 않도록 */}
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalContainer}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                {/* <Text style={styles.modalTitle}>하늘 선택</Text> */}
              </View>
              {/* Modal Inner Container */}
              <View style={styles.modalInnerContainer}>
                {/* 이미지 리스트: 반환된 데이터 개수만큼 보여줍니다 */}
                <ScrollView contentContainerStyle={styles.content}>
                  {skyListData.map(item => {
                    // 현재 선택된 항목은 원본 id의 mappedId와 비교합니다.
                    const isSelected = currentMappedId === item.mappedId;
                    return (
                      <Pressable
                        key={item.originalId}
                        onPress={() => setSelectedSky(item.originalId)}
                        onHoverIn={() => setHoveredItem(item.originalId)}
                        onHoverOut={() => setHoveredItem(null)}
                        style={({ pressed }) => [
                          styles.listItem,
                          (hoveredItem === item.originalId || isSelected) && styles.listItemHovered,
                          isSelected && styles.listItemOutline,
                        ]}
                      >
                        <Image 
                          source={getSkyImage(item.originalId)} 
                          style={styles.listItemImage} 
                          resizeMode="stretch" 
                        />
                        <View style={styles.listItemTextContainer}>
                          <Text style={styles.listItemTitle}>
                            {item.title}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </ScrollView>
                {/* Modal Buttons Container */}
                <View style={styles.buttonContainer}>
                  <Pressable style={styles.modalButtonEqui} onPress={handleConfirm}>
                    <Text style={styles.modalButtonEquiText}>변경</Text>
                  </Pressable>
                  <Pressable style={styles.modalButtonClose} onPress={onClose}>
                    <Text style={styles.modalButtonCloseText}>닫기</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // ==================== Modal Background ====================
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 어두운 오버레이
    justifyContent: 'center',
    alignItems: 'center',
  },
  // ==================== Modal Container ====================
  modalContainer: {
    width: '90%',        // 가로 크기는 디바이스 크기의 90%
    height: '80%',       // 세로 크기는 디바이스 크기의 80%
    backgroundColor: 'white', // 배경 색상은 흰색
    borderRadius: 10,
    overflow: 'hidden',
  },
  // ==================== Modal Header ====================
  modalHeader: {
    backgroundColor: '#87A7C0',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    height: 45, // 헤더 세로 길이
  },
  modalTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  // ==================== Inner Container (헤더 제외 영역에 패딩 적용) ====================
  modalInnerContainer: {
    flex: 1,
    padding: 20, // 헤더를 제외한 영역에만 padding 적용
    justifyContent: 'space-between',
  },
  // ==================== Modal Container (List) ====================
  // flex: 1 제거 -> 컨텐츠 길이에 따라 자연스럽게 ScrollView가 작동합니다.
  content: {
    justifyContent: 'flex-start', // 리스트는 상단에서부터 나열
    alignItems: 'stretch',
  },
  // ==================== 리스트 항목 스타일 ====================
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb', // 리스트 사이 회색 구분선
    backgroundColor: 'transparent',
    paddingBottom: 15,
    // marginBottom: 10,
  },
  listItemOutline: {
    outlineStyle: 'solid',
    outlineWidth: 3,
    outlineColor: '#87A7C0',
  },
  listItemImage: {
    borderRadius: 10,
    width: 90,
    height: 90,
    marginRight: 15, // 썸네일과 텍스트 사이 여백
  },
  listItemTextContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  listItemTitle: {
    color: 'black',
    fontSize: 20,
  },
  // ==================== Modal Buttons Container ====================
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  // ==================== Modal Button Equi (좌측) ====================
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
  // ==================== Modal Button Close (우측) ====================
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

export default SelectStarSky;
