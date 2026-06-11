import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, Image, StyleSheet, ScrollView, 
  TouchableOpacity, Alert 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import FriendAddModal from '../components/FriendAddModal'
import ProfileChangeModal from '../components/ProfileChangeModal'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Friend = ({ setIsLoggedIn }) => {
  const navigation = useNavigation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [friends, setFriends] = useState([]);
  const [userProfile, setUserProfile] = useState({
    nickname: '',
    profileImage: require('../../assets/images/wakwak.png')
  });
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [isNicknameAvailable, setIsNicknameAvailable] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [authToken, setAuthToken] = useState(null);
  const BASE_URL = 'https://i12e207.p.ssafy.io';

  const swipeableRefs = useRef([]);

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

  // 토큰이 설정되면 프로필과 친구 목록을 가져오도록 수정
useEffect(() => {
  if (authToken) {
    console.log('토큰 설정됨, 데이터 로드 시작');
    fetchUserProfile();
    fetchFriends();
  }
}, [authToken]);

const handleLogout = async () => {
  try {
    await AsyncStorage.removeItem('AUTH_TOKEN');
    // App.js의 setIsLoggedIn을 false로 설정
    setIsLoggedIn(false);  // 이 함수를 props로 전달받아야 함
  } catch (error) {
    console.error('로그아웃 실패:', error);
    Alert.alert('오류', '로그아웃 중 문제가 발생했습니다.');
  }
};

const fetchUserProfile = async () => {
  try {
    console.log('프로필 정보 조회 시작');
    const response = await axios.get(`${BASE_URL}/tmp`, {
      headers: {
        'Authorization': authToken  // Bearer 토큰이 이미 포함된 authToken 사용
      }
    });

    console.log('프로필 응답 데이터:', response.data);
    
    if (response.data.code === 'SUCCESS') {
      const profileData = {
        nickname: response.data.data.nickname,
        profileImage: response.data.data.mediaUrl 
          ? { uri: response.data.data.mediaUrl }
          : require('../../assets/images/wakwak.png')
      };
      setUserProfile(profileData);
      console.log('프로필 정보 설정 완료');
    }
  } catch (error) {
    console.error('프로필 조회 실패:', error.response?.data || error.message);
    Alert.alert('오류', '프로필 정보를 불러오는데 실패했습니다.');
  }
};

// 닉네임 관련 함수
const checkNicknameAvailability = async (nickname) => {
  console.log('=== 닉네임 중복 확인 시작 ===');
  console.log('요청 닉네임:', nickname);
  console.log('요청 URL:', `${BASE_URL}/users/check-nickname`);
  
  try {
    const response = await axios.post(
      `${BASE_URL}/users/check-nickname`,
      { nickname },  // POST 요청 body에 nickname 포함
      {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('서버 응답:', response.data);
    const isAvailable = response.data.code === 'SU';
    console.log('사용 가능 여부:', isAvailable);
    return isAvailable;
    
  } catch (error) {
    console.error('=== 중복 확인 에러 발생 ===');
    console.error('에러 상태 코드:', error.response?.status);
    console.error('에러 데이터:', error.response?.data);
    console.error('에러 메시지:', error.message);
    
    const errorMessage = error.response?.data?.message || '중복 확인 중 오류가 발생했습니다.';
    Alert.alert('오류', errorMessage);
    return false;
  }
};

const handleNicknameChange = async (nickname, isCheckOnly) => {
  console.log('=== 닉네임 변경 처리 시작 ===');
  console.log('입력된 닉네임:', nickname);
  console.log('중복 확인 모드:', isCheckOnly);

  try {
    if (isCheckOnly) {
      console.log('중복 확인 모드로 실행');
      return await checkNicknameAvailability(nickname);
    }

    console.log('닉네임 변경 모드로 실행');
    const response = await axios.patch(
      `${BASE_URL}/tmp/nickname`,
      { nickname },
      {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('변경 요청 응답:', response.data);
    
    // 여기를 수정: SUCCESS로 체크
    if (response.data.code === 'SUCCESS') {
      setUserProfile(prev => ({ ...prev, nickname }));
      Alert.alert('성공', '닉네임이 변경되었습니다.');
      return true;
    }
    return false;
  } catch (error) {
    console.error('=== 닉네임 변경 에러 발생 ===');
    console.error('에러 상태 코드:', error.response?.status);
    console.error('에러 데이터:', error.response?.data);
    Alert.alert('오류', '닉네임 변경에 실패했습니다.');
    return false;
  }
};

// 프로필 변경 함수
const handleProfileImageChange = async (imageFile) => {
  try {
    console.log('프로필 이미지 변경 시작:', imageFile);
    const formData = new FormData();
    formData.append('profile_image', imageFile);

    const response = await axios.patch(
      `${BASE_URL}/tmp/profile-image`,
      formData,
      {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    console.log('프로필 이미지 변경 응답:', response.data);

    if (response.data.code === 'SUCCESS') {
      // media_url 대신 mediaUrl 사용
      const newImageUrl = response.data.data.mediaUrl;
      console.log('새 이미지 URL:', newImageUrl);
      
      if (!newImageUrl) {
        console.error('이미지 URL이 응답에 없습니다:', response.data);
        return false;
      }

      setUserProfile(prev => ({
        ...prev,
        profileImage: { uri: newImageUrl }
      }));

      // 상태 업데이트가 즉시 반영되도록 강제 리렌더링
      setRefreshKey(prev => prev + 1);
      return true;
    }
    return false;
  } catch (error) {
    console.error('프로필 이미지 변경 에러:', error);
    Alert.alert('오류', '프로필 이미지 변경에 실패했습니다.');
    return false;
  }
};


// 친구
const fetchFriends = async () => {
  try {
    console.log('친구 목록 조회 시작');
    const response = await axios.get(`${BASE_URL}/friends`, {
      headers: {
        'Authorization': authToken,
        'Content-Type': 'application/json'
      }
    });

    console.log('친구 목록 응답 데이터:', response.data);
    if (response.data.code === 'SUCCESS') {
      const friendsList = response.data.data || [];
      console.log('받은 친구 목록:', friendsList);
      const mappedFriends = friendsList.map(friend => ({
        id: friend.userId,
        nickname: friend.nickname,
        profileImage: friend.mediaUrl
          ? { uri: friend.mediaUrl }
          : require('../../assets/images/wakwak.png')
      }));
      setFriends(mappedFriends);
      console.log('친구 목록 설정 완료');
    }
  } catch (error) {
    console.error('친구 목록 조회 실패:', error.response?.data || error.message);
    Alert.alert('오류', '친구 목록을 불러오는데 실패했습니다.');
  }
};

  const handleDeleteFriend = async (friendId) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/friends/delete`,
        { friendId: friendId.toString() },
        {
          headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.code === 'SUCCESS') {
        Alert.alert('성공', '친구가 삭제되었습니다.');
        fetchFriends();
        if (swipeableRefs.current[friendId]) {
          swipeableRefs.current[friendId].close();
        }
      }
    } catch (error) {
      console.error('친구 삭제 실패:', error);
      Alert.alert('오류', '친구 삭제에 실패했습니다.');
    }
  };
  

  const handleApiError = (error) => {
    if (error.response) {
      const errorMessages = {
        400: '잘못된 요청입니다.',
        401: '로그인이 필요합니다.',
        404: '존재하지 않는 친구 관계입니다.',
        500: '서버 오류가 발생했습니다.'
      };
      Alert.alert('오류', errorMessages[error.response.status] || '오류가 발생했습니다.');
    } else {
      Alert.alert('오류', '네트워크 오류가 발생했습니다.');
    }
  };

  const renderRightActions = (progress, dragX, friendId, nickname) => (
    <TouchableOpacity
      style={styles.deleteAction}
      onPress={() => confirmDeleteFriend(friendId, nickname)}
    >
      <Text style={styles.deleteActionText}>삭제</Text>
    </TouchableOpacity>
  );

  const confirmDeleteFriend = (friendId, nickname) => {
    Alert.alert(
      '친구 삭제',
      `${nickname}님을 친구 목록에서 삭제하시겠습니까?`,
      [
        {
          text: '아니요',
          onPress: () => swipeableRefs.current[friendId]?.close(),
          style: 'cancel',
        },
        {
          text: '예',
          onPress: () => handleDeleteFriend(friendId),
          style: 'destructive',
        },
      ]
    );
  };

  // 모달 닫을 때 처리하는 함수
  const handleModalClose = () => {
    console.log('친구 추가 모달 닫기');
    setShowAddModal(false);
    console.log('친구 목록 새로고침 시작');
    fetchFriends();  // 친구 목록 새로고침
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container} key={refreshKey}>
        <View style={styles.header}>
          <View style={styles.profileContainer}>
            <Image 
              source={userProfile.profileImage} 
              style={styles.profileImage}
              // 이미지 캐시 방지를 위한 키 추가
              key={userProfile.profileImage.uri}
            />
            <Text style={styles.nickname}>{userProfile.nickname}</Text>
            <TouchableOpacity 
              onPress={() => setShowProfileModal(true)}
              style={styles.editButton}
            >
              <Image 
                source={require('../../assets/images/edit.png')} 
                style={styles.editIcon} 
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>로그아웃</Text>
          </TouchableOpacity>
        </View>

        {/* 프로필 변경 모달 추가 */}
        <ProfileChangeModal
          visible={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          currentNickname={userProfile.nickname}
          currentProfileImage={userProfile.profileImage}
          onNicknameChange={handleNicknameChange}
          onProfileImageChange={handleProfileImageChange}
        />


        <View style={styles.friendsListTitleContainer}>
          <Text style={styles.friendsListTitle}>친구 목록</Text>
        </View>

        <ScrollView style={styles.friendsListScrollView}>
          {friends.length > 0 ? (
            friends.map((friend) => (
              <Swipeable
                key={`friend-${friend.id}`}
                ref={ref => {
                  if (ref && friend.id) {
                    swipeableRefs.current[friend.id] = ref;
                  }
                }}
                renderRightActions={(progress, dragX) => 
                  renderRightActions(progress, dragX, friend.id, friend.nickname)
                }
                rightThreshold={40}
              >
                <View style={styles.friendItem}>
                  <Image 
                    source={friend.profileImage} 
                    style={styles.friendImage} 
                  />
                  <Text style={styles.friendName}>{friend.nickname}</Text>
                </View>
              </Swipeable>
            ))
          ) : (
            <Text style={styles.noFriendsText}>친구 목록이 비어있습니다.</Text>
          )}
        </ScrollView>

        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>친구 추가</Text>
        </TouchableOpacity>

        {showAddModal && (
          <FriendAddModal
            visible={showAddModal}
            onClose={() => {
              setShowAddModal(false);
              fetchFriends();
            }}
            onFriendAdded={fetchFriends}
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  // 기본 컨테이너
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  
  // 헤더 영역
  header: {
    paddingVertical: 20,
    paddingHorizontal: 18,
    alignItems: 'right',
    backgroundColor: '#87A7C0',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    marginRight: 20,
  },
  nickname: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  logoutButton: {
    // marginTop: 5,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 5,
    alignSelf: 'flex-end',
  },
  logoutButtonText: {
    color: '#87A7C0',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // 친구 목록 타이틀
  friendsListTitleContainer: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  friendsListTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    letterSpacing: 0.1,
    marginLeft: 5,
  },

  // 친구 목록
  friendsListScrollView: {
    flex: 1,
  },
  friendItem: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  friendImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  friendName: {
    flex: 1,
    fontSize: 16,
  },
  friendStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noFriendsText: {
    fontSize: 20,
    textAlign: 'center',
    color: '#666',
    paddingTop: 100,
  },

  // 카운트 컨테이너
  likecountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  itemcountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  countIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  likecountIcon: {
    width: 25,
    height: 25,
    marginLeft: 5,
    marginRight: 5,
  },
  likeCount: {
    color: '#666',
  },
  itemcountIcon: {
    width: 27,
    height: 27,
    marginLeft: 5,
    marginRight: 5,
  },
  itemCount: {
    color: '#666',
  },

  // 버튼 스타일
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  button: {
    flex: 1,
    margin: 5,
    padding: 15,
    backgroundColor: '#87A7C0',
    borderRadius: 8,
    alignItems: 'center',
  },
  addButton: {
    margin: 20,
    padding: 15,
    backgroundColor: '#87A7C0',
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // 검색 영역
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },

  // 친구 요청 영역
  requestItem: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  buttonGroup: {
    flexDirection: 'row',
    marginLeft: 'auto',
  },
  acceptButton: {
    padding: 8,
    backgroundColor: '#87A7C0',
    borderRadius: 4,
    marginRight: 8,
  },
  rejectButton: {
    padding: 8,
    backgroundColor: '#ff4444',
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },

  // 하트 관련
  heartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  heartIcon: {
    width: 25,
    height: 25,
    marginRight: 5,
  },
  heartCount: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  heartButton: {
    padding: 5,
  },
  deleteAction: {
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: 100,
    height: '100%',
  },
  deleteActionText: {
    color: 'white',
    fontWeight: 'bold',
    padding: 20,
  },
  editButton: {
    padding: 10,
    marginLeft: 10,
  },
  editIcon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
});

export default Friend;
