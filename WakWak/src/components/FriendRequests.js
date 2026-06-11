import React, { useState, useEffect } from 'react';
import { 
  View, Text, Modal, StyleSheet, TouchableOpacity, 
  ScrollView, Image, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const FriendRequests = ({ visible, onClose, onFriendAdded }) => {
  const [requests, setRequests] = useState([]);
  const [authToken, setAuthToken] = useState(null);
  const BASE_URL = 'https://i12e207.p.ssafy.io';


  useEffect(() => {
    const getStoredToken = async () => {
      try {
        const token = await AsyncStorage.getItem('AUTH_TOKEN');  // AUTH_TOKEN -> AUTH_TOKEN으로 변경
        if (token) {
          setAuthToken(`Bearer ${token}`);
          console.log('토큰 가져오기 성공:', token);
        } else {
          console.warn('저장된 토큰이 없습니다');
        }
      } catch (error) {
        console.error('토큰 가져오기 실패:', error);
      }
    };
    getStoredToken();
  }, []);

  useEffect(() => {
    if (visible && authToken) {  // visible과 authToken 모두 있을 때만 호출
      console.log('친구 요청 목록 조회 시작');
      fetchRequests();
    }
  }, [visible, authToken]);  // visible과 authToken 모두 의존성 배열에 추가

  // 주기적으로 친구 요청 목록을 새로고침
  useEffect(() => {
    console.log('FriendRequests 컴포넌트 마운트');
   
    return () => {
      console.log('FriendRequests 컴포넌트 언마운트');
    };
  }, [visible]);

  const fetchRequests = async () => {
  if (!authToken) {
    console.log('토큰이 없어 요청을 보낼 수 없습니다');
    return;
  }

  console.log('친구 요청 목록 조회 시작');
  try {
    console.log('API 요청 시작:', `${BASE_URL}/friends/requests`);
    console.log('요청 헤더:', { Authorization: authToken });
    
    const response = await axios.get(`${BASE_URL}/friends/requests`, {
      headers: {
        'Authorization': authToken,
        'Content-Type': 'application/json'
      }
    });

    console.log('서버 응답:', response.data);
    
    if (response.data.code === 'SUCCESS') {
      console.log('친구 요청 목록 가져오기 성공:', response.data.data);
      setRequests(response.data.data);
    }
  } catch (error) {
    console.error('친구 요청 목록 조회 실패:', error);
    console.error('에러 상세 정보:', error.response?.data);
    
    if (error.response?.status === 403) {
      console.error('인증 오류. 토큰이 유효하지 않거나 만료되었습니다.');
    
        switch (error.response.status) {
          case 401:
            Alert.alert('오류', '로그인이 필요합니다.');
            break;
          case 500:
            Alert.alert('오류', '서버 오류가 발생했습니다.');
            break;
          default:
            Alert.alert('오류', '친구 요청 목록을 불러오는데 실패했습니다.');
        }
      } else {
        Alert.alert('오류', '네트워크 오류가 발생했습니다.');
      }
    }
  };

  const handleAccept = async (senderId) => {
    console.log('친구 수락 시작 - senderId:', senderId);
    try {
      const response = await axios.post(
        `${BASE_URL}/friends/requests/accept`,
        { senderId: senderId.toString() },
        {
          headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.code === 'SUCCESS') {
        console.log('친구 수락 성공');
        setRequests(prevRequests => 
          prevRequests.filter(request => request.senderId !== senderId)
        );
        Alert.alert('성공', '친구 요청을 수락했습니다.');
        
        if (onFriendAdded) {
          console.log('친구 목록 새로고침 콜백 실행');
          onFriendAdded();
        }
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (error) {
      console.error('친구 수락 처리 중 에러:', error);
      if (error.response) {
        switch (error.response.status) {
          case 400:
            Alert.alert('오류', '잘못된 요청입니다.');
            break;
          case 401:
            Alert.alert('오류', '로그인이 필요합니다.');
            break;
          case 404:
            Alert.alert('오류', '존재하지 않는 친구 요청입니다.');
            break;
          case 409:
            Alert.alert('오류', '이미 친구 관계입니다.');
            break;
          case 500:
            Alert.alert('오류', '서버 오류가 발생했습니다.');
            break;
          default:
            Alert.alert('오류', '친구 요청 수락에 실패했습니다.');
        }
      } else {
        Alert.alert('오류', '네트워크 오류가 발생했습니다.');
      }
    }
  };


  const confirmReject = (id, nickname) => {
    console.log('거절 확인 다이얼로그 - ID:', id, 'nickname:', nickname);
    Alert.alert(
      '친구 요청 거절',
      `${nickname}님의 친구 요청을 거절하시겠습니까?`,
      [
        {
          text: '아니요',
          style: 'cancel'
        },
        {
          text: '예',
          onPress: () => handleReject(id),
          style: 'destructive'
        }
      ],
      { cancelable: false }
    );
  };

  const handleReject = async (id) => {
    try {
      console.log('친구 거절 API 요청 시작');
      console.log('거절할 senderId:', id);
      
      const response = await axios.post(
        `${BASE_URL}/friends/requests/reject`,
        { senderId: id.toString() },
        {
          headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.code === 'SUCCESS') {
        console.log('친구 요청 거절 성공');
        setRequests(requests.filter(request => request.senderId !== id));
        Alert.alert('성공', '친구 요청을 거절했습니다.');
      }
    } catch (error) {
      console.error('친구 거절 처리 중 에러:', error);
      Alert.alert('오류', '네트워크 오류가 발생했습니다.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.headerContainer}>
            <Text style={styles.modalTitle}>나를 찾은 친구</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Image 
                source={require('../../assets/images/cancel.png')} 
                style={styles.closeIcon}
              />
            </TouchableOpacity>
          </View>

          <ScrollView>
            {requests.length > 0 ? (
              requests.map((request, index) => (
                <View key={`${request.senderId}_${index}`} style={styles.requestItem}>
                  <Image 
                    source={{ uri: request.media_url }} 
                    style={styles.profileImage} 
                  />
                  <Text style={styles.nickname}>{request.nickname}</Text>
                  <View style={styles.buttonGroup}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.acceptButton]}
                      onPress={() => {
                        console.log('수락 버튼 클릭 - senderId:', request.senderId);
                        handleAccept(request.senderId);
                      }}
                    >
                      <Text style={styles.buttonText}>수락</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => confirmReject(request.senderId, request.nickname)}
                    >
                      <Text style={styles.buttonText}>거절</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noRequestsText}>받은 친구 요청이 없습니다.</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  closeIcon: {
    width: 20,
    height: 20,
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  nickname: {
    flex: 1,
    fontSize: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginLeft: 10,
  },
  acceptButton: {
    backgroundColor: '#87A7C0',
  },
  rejectButton: {
    backgroundColor: '#E74C3C',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noRequestsText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  }
});

export default FriendRequests;
