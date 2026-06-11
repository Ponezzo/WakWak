import React, { useState, useEffect } from 'react';
import { 
  View, Text, Modal, StyleSheet, TouchableOpacity, 
  ScrollView, Image, Alert, TextInput
} from 'react-native';
import axios from 'axios'; // axios 임포트
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage 임포트
import FriendRequests from './FriendRequests';
import BluetoothFriendModal from './BluetoothFriendModal';

const FriendAddModal = ({ visible, onClose, onFriendAdded }) => {
  const [showRequests, setShowRequests] = useState(false);
  const [showBluetoothModal, setShowBluetoothModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recommendedFriends, setRecommendedFriends] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [requestCount, setRequestCount] = useState(0);

  const [authToken, setAuthToken] = useState(null);
  const BASE_URL = 'https://i12e207.p.ssafy.io';

  

  useEffect(() => {
    const getStoredToken = async () => {
      try {
        const token = await AsyncStorage.getItem('AUTH_TOKEN'); // 'AUTH_TOKEN' -> 'AUTH_TOKEN'으로 변경
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

  // 컴포넌트 마운트 시 추천 친구 목록 가져오기
  useEffect(() => {
    if (authToken) {
      console.log('토큰 설정됨, 초기 데이터 로드 시작');
      fetchRecommendedFriends();
      // checkNewRequests 함수 호출 제거 (아래에서 별도로 처리)
    }
  }, [authToken]);

  // 친구 요청 확인을 위한 별도의 useEffect
  useEffect(() => {
    const checkNewRequests = async () => {
      if (!authToken) return;
  
      try {
        console.log('친구 요청 수 확인 시작');
        const response = await axios.get(`${BASE_URL}/friends/requests`, {
          headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json'
          }
        });
  
        if (response.data.code === 'SUCCESS') {
          const count = response.data.data.length;
          console.log('새로운 친구 요청 수:', count);
          setRequestCount(count);
        }
      } catch (error) {
        console.error('친구 요청 수 확인 실패:', error);
      }
    };
  
    if (authToken) {
      checkNewRequests();
    }
  
    const interval = setInterval(checkNewRequests, 5000);
    
    return () => {
      console.log('친구 요청 확인 인터벌 정리');
      clearInterval(interval);
    };
  }, [authToken]);

  // 추천 친구 목록 조회
  const fetchRecommendedFriends = async () => {
    try {
      console.log('추천 친구 목록 조회 시작');
      const response = await axios.get(`${BASE_URL}/friends/recommend-friend`, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      });
  
      if (response.data.code === 'SUCCESS') {
        // 각 추천 친구의 상태 확인
        const friendsWithStatus = await Promise.all(
          response.data.data.map(async (friend) => {
            const status = await checkFriendStatus(friend.userId);
            return { ...friend, friendStatus: status };
          })
        );
        setRecommendedFriends(friendsWithStatus);
      }
    } catch (error) {
      console.error('추천 친구 조회 실패:', error);
      console.error('에러 응답:', error.response?.data);
      console.error('에러 상태 코드:', error.response?.status);
    }
  };
  // 친구 검색
  const searchFriends = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('오류', '검색할 닉네임을 입력해주세요.');
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get(`${BASE_URL}/friends/search`, {
        params: { nickname: searchQuery },
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.code === 'SUCCESS') {
        const filteredResults = response.data.data.filter(user => !user.isSelf);
        const results = await Promise.all(
          filteredResults.map(async (user) => {
            const status = await checkFriendStatus(user.userId);
            return { ...user, friendStatus: status };
          })
        );
        setSearchResults(results);
      }
    } catch (error) {
      Alert.alert('오류', '친구 검색에 실패했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  // 친구 상태 확인
  const checkFriendStatus = async (targetId) => {
    try {
      const response = await axios.get(`${BASE_URL}/friends/search/status`, {
        params: { targetId: targetId },
        headers: {
          'Authorization': authToken
        }
      });

      if (response.data.code === 'SUCCESS') {
        return response.data.data.status;
      }
    } catch (error) {
      console.error('친구 상태 확인 실패:', error);
      return null;
    }
  };

  // 친구 요청 수락 처리
  const handleAccept = async (userId) => {
    console.log('친구 수락 처리 시작 - userId:', userId);
    try {
      const token = await AsyncStorage.getItem('AUTH_TOKEN'); // AsyncStorage에서 토큰 가져오기
      const response = await axios.post(`${BASE_URL}/friends/requests/accept`, 
        { senderId: userId.toString() }, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('친구 수락 응답 상태:', response.status);
      const data = response.data;
      console.log('친구 수락 응답 데이터:', data);

      if (data.code === 'SUCCESS') {
        console.log('친구 수락 성공 - 목록 업데이트 시작');
        if (onFriendAdded) {
          console.log('친구 목록 새로고침 콜백 실행');
          onFriendAdded();
        }
        Alert.alert('성공', '친구 요청을 수락했습니다.');
      }
    } catch (error) {
      console.error('친구 수락 처리 중 에러:', error);
    }
  };

  // 친구 상태에 따른 버튼 렌더링
  const renderFriendActionButton = (friend) => {
    switch (friend.friendStatus) {
      case 'PENDING':
        return <Text style={styles.statusText}>요청중</Text>;
      case 'FRIENDS':
        return <Text style={styles.statusText}>친구</Text>;
      case 'RECEIVED':
        return (
          <TouchableOpacity 
            style={styles.acceptButton}
            onPress={() => handleAccept(friend.userId)}
          >
            <Text style={styles.buttonText}>수락</Text>
          </TouchableOpacity>
        );
      case 'NOT_FRIENDS':
      default:
        return (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => sendFriendRequest(friend.userId)}
          >
            <Text style={styles.addButtonText}>친구 요청</Text>
          </TouchableOpacity>
        );
    }
  };

  // 친구 요청 보내기
  const sendFriendRequest = async (userId) => {
    console.log('친구 요청 시작 - 대상 userId:', userId);
    console.log('사용 중인 토큰:', authToken);
    
    try {
      const requestData = { receiverId: userId };
      console.log('요청 데이터:', requestData);
      
      const response = await axios.post(
        `${BASE_URL}/friends/send`,
        requestData,
        {
          headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json'
          }
        }
      );
  
      console.log('친구 요청 응답:', response.data);
      
      if (response.data.code === 'SUCCESS') {
        console.log('친구 요청 성공');
        Alert.alert('성공', '친구 요청을 보냈습니다.', 
          [{
            text: '확인',
            onPress: () => {
              // 검색 결과에서 해당 유저의 상태를 업데이트
              setSearchResults(prevResults =>
                prevResults.map(friend =>
                  friend.userId === userId
                    ? { ...friend, friendStatus: 'PENDING' }
                    : friend
                )
              );
              
              // 추천 친구 목록에서 제거
              setRecommendedFriends(prevFriends =>
                prevFriends.filter(friend => friend.user_id !== userId)
              );

              if (onFriendAdded) {
                console.log('친구 목록 새로고침 콜백 실행');
                onFriendAdded();
              }
              // 추천 친구 목록 새로고침
              fetchRecommendedFriends();
            }
          }]
        );
      }
    } catch (error) {
      console.error('친구 요청 실패:', error);
      console.error('에러 응답:', error.response?.data);
      console.error('에러 상태 코드:', error.response?.status);
      
      if (error.response) {
        switch (error.response.status) {
          case 400:
            Alert.alert('잘못된 요청입니다.');
            break;
          case 401:
            Alert.alert('인증이 필요합니다.');
            break;
          case 403:
            Alert.alert('권한이 없습니다.');
            break;
          case 404:
            Alert.alert('사용자를 찾을 수 없습니다.');
            break;
          case 409:
            Alert.alert('이미 친구 요청을 보냈거나 친구 관계입니다.');
            break;
          default:
            Alert.alert('친구 요청 전송에 실패했습니다.');
        }
      } else {
        Alert.alert('네트워크 오류가 발생했습니다.');
      }
    }
  };
  
  // X 버튼 클릭 시 처리하는 함수
  const handleClose = () => {
    console.log('모달 닫기 버튼 클릭');
    if (onFriendAdded) {
      console.log('친구 목록 새로고침 실행');
      onFriendAdded();
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}  // 뒤로가기 버튼 처리
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.headerContainer}>
            <Text style={styles.modalTitle}>내가 찾은 친구</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleClose}  // X 버튼 클릭 시 handleClose 호출
            >
              <Image 
                source={require('../../assets/images/cancel.png')} 
                style={styles.closeIcon}
              />
            </TouchableOpacity>
          </View>

          {/* 추천 친구 섹션 */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>추천 친구</Text>
            <ScrollView horizontal style={styles.recommendContainer}>
              {recommendedFriends.length > 0 ? (
                recommendedFriends.map((friend) => (
                  <View key={friend.userId} style={styles.recommendItem}>
                    <Image 
                      source={friend.profileImage 
                        ? { uri: friend.profileImage }
                        : require('../../assets/images/wakwak.png')} 
                      style={styles.profileImage} 
                    />
                    <Text style={styles.nickname}>{friend.nickname}</Text>
                    {friend.friendStatus === 'PENDING' ? (
                      <Text style={styles.statusText}>요청중</Text>
                    ) : friend.friendStatus === 'FRIENDS' ? (
                      <Text style={styles.statusText}>친구</Text>
                    ) : (
                      <TouchableOpacity 
                        style={styles.addButton}
                        onPress={() => {
                          console.log('친구 추가 버튼 클릭 - userId:', friend.userId);
                          sendFriendRequest(friend.userId);
                        }}
                      >
                        <Text style={styles.addButtonText}>친구 추가</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              ) : (
                <View style={styles.noRecommendContainer}>
                  <Text style={styles.noRecommendText}>추천 친구가 없습니다.</Text>
                </View>
              )}
            </ScrollView>
          </View>

          {/* 검색 섹션 */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="친구의 닉네임을 입력해보세요"
              autoFocus={false}
              showSoftInputOnFocus={true}
              keyboardType="default"
            />
            <TouchableOpacity onPress={searchFriends}>
              <Image 
                source={require('../../assets/images/search.png')} 
                style={styles.searchIcon}
              />
            </TouchableOpacity>
          </View>

          {/* 검색 결과 */}
          <ScrollView>
            {searchResults.map((friend) => (
              <View key={friend.userId} style={styles.searchResultItem}>
                <View style={styles.userInfo}>
                  <Image 
                    source={friend.profileImage 
                      ? { uri: friend.profileImage }
                      : require('../../assets/images/wakwak.png')} 
                    style={styles.profileImage} 
                  />
                  <Text style={styles.nickname}>{friend.nickname}</Text>
                </View>
                {renderFriendActionButton(friend)}
              </View>
            ))}
          </ScrollView>

          {/* 하단 버튼 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => setShowRequests(true)}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>받은 신청</Text>
                {/* {requestCount > 0 && ( */}
                  <View style={styles.requestBadge}>
                    <Text style={styles.requestBadgeText}>{requestCount}</Text>
                  </View>
                {/* )} */}
              </View>
            </TouchableOpacity>
          </View>


          {/* 친구 요청 모달 */}
          {showRequests && (
            <FriendRequests 
            visible={showRequests}
            onClose={() => setShowRequests(false)}
            onFriendAdded={() => {
              console.log('FriendRequests에서 친구 추가됨');
              if (onFriendAdded) {
                onFriendAdded();  // 부모 컴포넌트의 콜백 실행
              }
              setShowRequests(false);
            }}
          />
          )}
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
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  recommendContainer: {
    flexDirection: 'row',
  },
  recommendItem: {
    width: 150,
    marginRight: 15,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 10,
  },
  noRecommendContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    width: '100%',
  },
  noRecommendText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 10,
  },
  searchInput: {
    flex: 1,
    marginRight: 10,
    fontSize: 16,
  },
  searchIcon: {
    width: 24,
    height: 24,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  nickname: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bridgeCount: {
    fontSize: 12,
    color: '#666',
    marginVertical: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    backgroundColor: '#87A7C0',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#87A7C0',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginTop: 5,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  statusText: {
    color: '#666',
    fontSize: 14,
  },
  buttonContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  requestBadge: {
    backgroundColor: '#FF3B30',
    width: 28,
    height: 28,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  requestBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default FriendAddModal;