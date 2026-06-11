import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  Dimensions, 
  Alert, 
  Image, 
  ScrollView, 
  Modal 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchImageLibrary } from 'react-native-image-picker';
import CreateThumbnail from 'react-native-create-thumbnail';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');
const MAX_MEDIA = 5;
const MEDIA_SCALE = 1.5;

const DUCK_IMAGE = require('../../assets/images/duck.jpg');

// BASE_URL 상수 – 앞으로 모든 API 호출에 사용됩니다.
const BASE_URL = 'https://i12e207.p.ssafy.io';

const TimeCapsule = () => {
  const [authToken, setAuthToken] = useState(null);
  useEffect(() => {
    const getToken = async () => {
      try {
        const token = await AsyncStorage.getItem('AUTH_TOKEN');
        if (token) {
          const formattedToken = `Bearer ${token}`;
          setAuthToken(formattedToken);
          console.log('토큰 가져오기 성공:', token);
        } else {
          console.warn('저장된 토큰이 없습니다');
        }
      } catch (error) {
        console.error('토큰 가져오기 실패:', error);
      }
    };
    getToken();
  }, []);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [accessUserIds, setAccessUserIds] = useState([]);
  
  const [friendsModalVisible, setFriendsModalVisible] = useState(false);
  const [friendsList, setFriendsList] = useState([]);
  
  const [errorTitle, setErrorTitle] = useState('');
  const [errorContent, setErrorContent] = useState('');

  const scrollRef = useRef(null);
  const [titleOffset, setTitleOffset] = useState(0);
  const [contentOffset, setContentOffset] = useState(0);

  const navigation = useNavigation();
  const route = useRoute();

  const selectFile = () => {
    const options = {
      mediaType: 'mixed',
      maxWidth: 264,
      maxHeight: 264,
      includeBase64: true,
      selectionLimit: 0,
    };
    
    launchImageLibrary(options, async (response) => {   
      if (response.didCancel) {
        console.log('사진 첨부 취소');
        setSelectedFiles([]);
      } else if (response.errorCode) {
        console.log('ImagePicker 오류: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const processedAssets = await Promise.all(
          response.assets.map(async (asset) => {
            if (asset.type && asset.type.startsWith('video/')) {
              try {
                const thumbnail = await CreateThumbnail.create({ url: asset.uri });
                let thumbnailPath = thumbnail.path;
                if (!thumbnailPath.startsWith('file://')) {
                  thumbnailPath = `file://${thumbnailPath}`;
                }
                return { ...asset, thumbnail: thumbnailPath };
              } catch (err) {
                console.error('썸네일 생성 오류:', err);
                return asset;
              }
            } else {
              return asset;
            }
          })
        );
        setSelectedFiles(processedAssets);
      }
    });
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFocusTitle = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ y: titleOffset, animated: false });
    }
  };

  const handleFocusContent = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ y: contentOffset, animated: false });
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const fetchFriends = async () => {
    if (!authToken) {
      console.warn("토큰이 없으므로 친구 목록 API를 호출할 수 없습니다.");
      return;
    }
    try {
      const response = await axios.get(`${BASE_URL}/friends`, {
        headers: { Authorization: authToken },
      });
      if (response.data && response.data.code === 'SUCCESS') {
        console.log('친구 데이터:', response.data);
        setFriendsList(response.data.data);
      } else {
        console.error('친구 목록 API error:', response.data);
        Alert.alert('오류', '친구 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('친구 목록 API error:', error);
      Alert.alert('오류', '친구 목록을 불러오는데 실패했습니다.');
    } finally {
      setFriendsModalVisible(true);
    }
  };

  const handleAttachFriends = () => {
    console.log("첨부 버튼 눌림, 선택된 친구 ID들: ", accessUserIds);
    setFriendsModalVisible(false);
  };

  const sendCoordinatesToDB = async () => {
    const { latitude, longitude } = route.params;
    if (latitude == null || longitude == null) {
      console.error('전달받은 위도, 경도 정보가 없습니다.');
      return;
    }
  
    const openedAt = date ? date.toISOString() : "";
  
    if (!authToken) {
      console.warn("토큰이 없으므로 DB 전송 API를 호출할 수 없습니다.");
      return;
    }
  
    // 토큰 값 확인 로그
    console.log('토큰 값 확인 >>>,', authToken);
  
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('openedAt', openedAt);
    formData.append('latitude', latitude.toString());
    formData.append('longitude', longitude.toString());
  
    if (selectedFiles.length > 0) {
      selectedFiles.forEach((file) => {
        formData.append('files', {
          uri: file.uri,
          type: file.type,
          name: file.fileName,
        });
      });
    }
  
    if (accessUserIds.length > 0) {
      formData.append('accessUserIds', accessUserIds.join(','));
    }
  
    try {
      const response = await fetch(`${BASE_URL}/time-capsules`, {
        method: 'POST',
        headers: {
          Authorization: authToken, // Content-Type 헤더는 설정하지 않습니다.
        },
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('DB 전송 실패:', errorData);
        Alert.alert('전송 오류', errorData.message || 'DB 전송 중 문제가 발생했습니다.');
        return;
      }
      
      const responseData = await response.json();
      console.log('DB 전송 성공:', responseData);
    } catch (error) {
      console.error('DB 전송 중 오류:', error);
      Alert.alert('전송 오류', error.message || 'DB 전송 중 문제가 발생했습니다.');
    }
  };

  const handleSubmit = async () => {
    // 토큰이 로딩되지 않았으면 제출하지 않음
    if (!authToken) {
      Alert.alert('오류', '토큰이 로딩 중입니다. 잠시 후 다시 시도해 주세요.');
      return;
    }

    if (!date) {
      Alert.alert('오류', '개봉 날짜를 선택해 주세요.');
      return;
    }

    await sendCoordinatesToDB();

    if (!route.params?.travelTime) {
      Alert.alert('오류', '소요시간 정보가 없습니다.');
      return;
    }

    navigation.navigate('BottomTabNavigator', {
      screen: 'RecordStack',
      params: {
        screen: 'Map',
        params: {
          submitted: true,
          destinationMarker: route.params?.destinationMarker,
          travelTime: route.params.travelTime,
        },
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 10 }}>
          <Ionicons name="arrow-back" size={30} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>이야기 담기</Text>
      </View>
      
      {/* 세로 스크롤 영역 */}
      <ScrollView 
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent} 
        keyboardShouldPersistTaps="handled"
      >
        {/* 미디어 첨부 영역 */}
        <View style={styles.mediaContainer}>
          <TouchableOpacity 
            style={styles.mediaAttachButton} 
            onPress={selectFile}>
            <Ionicons name="image-outline" size={37} color="#AAAAAA" />
            <Text style={styles.mediaCount}>{selectedFiles.length}</Text>
          </TouchableOpacity>
          {selectedFiles.length > 0 && (
            <ScrollView 
              horizontal 
              style={styles.mediaScroll} 
              showsHorizontalScrollIndicator={false}
            >
              {selectedFiles.map((file, index) => {
                if (file.type && file.type.startsWith('video/')) {
                  return (
                    <View key={index} style={styles.thumbnailWrapper}>
                      {file.thumbnail ? (
                        <Image source={{ uri: file.thumbnail }} style={styles.thumbnail} />
                      ) : (
                        <View style={[styles.thumbnail, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F7F7' }]}>
                          <Ionicons name="videocam" size={37} color="#AAAAAA" />
                        </View>
                      )}
                      <TouchableOpacity style={styles.removeIcon} onPress={() => removeFile(index)}>
                        <Ionicons name="close" size={14} color="white" />
                      </TouchableOpacity>
                    </View>
                  );
                } else {
                  return (
                    <View key={index} style={styles.thumbnailWrapper}>
                      <Image source={{ uri: file.uri }} style={styles.thumbnail} />
                      <TouchableOpacity style={styles.removeIcon} onPress={() => removeFile(index)}>
                        <Ionicons name="close" size={14} color="white" />
                      </TouchableOpacity>
                    </View>
                  );
                }
              })}
            </ScrollView>
          )}
        </View>

        {/* 제목 입력 영역 */}
        <View style={styles.sectionContainer} onLayout={(e) => setTitleOffset(e.nativeEvent.layout.y)}>
          <Text style={styles.labelTitle}>제목</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="제목을 입력하세요"
            placeholderTextColor="#CCCCCC"
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (text.trim()) setErrorTitle('');
            }}
            onFocus={handleFocusTitle}
          />
          {errorTitle ? <Text style={styles.errorText}>{errorTitle}</Text> : null}
        </View>

        {/* 내용 영역 */}
        <View style={styles.sectionContainer} onLayout={(e) => setContentOffset(e.nativeEvent.layout.y)}>
          <Text style={styles.labelContent}>내용</Text>
          <View style={styles.contentBox}>
            <TextInput
              style={styles.contentInput}
              placeholder="내용을 입력하세요."
              placeholderTextColor="#CCCCCC"
              multiline
              value={content}
              onChangeText={(text) => {
                setContent(text);
                if (text.trim()) setErrorContent('');
              }}
              onFocus={handleFocusContent}
            />
            <Text style={styles.charCount}>{content.length}</Text>
          </View>
          {errorContent ? <Text style={styles.errorText}>{errorContent}</Text> : null}
        </View>

        {/* 개봉 날짜 영역 */}
        <Text style={styles.openDateLabel}>개봉 날짜</Text>
        <TouchableOpacity style={styles.dateSelectButton} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateSelectButtonText}>
            {date ? date.toISOString().substring(0, 10) : '개봉날짜 선택'}
          </Text>
        </TouchableOpacity>

        {/* 공유 영역 */}
        <View style={styles.shareContainer}>
          <Text style={styles.shareLabel}>공유</Text>
          <TouchableOpacity style={styles.addFriendButton} onPress={fetchFriends}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* 선택된 친구 표시 */}
        {accessUserIds.length > 0 && (
          <ScrollView horizontal style={styles.selectedFriendsContainer} showsHorizontalScrollIndicator={false}>
            {friendsList
              .filter(friend => accessUserIds.includes(friend.userId))
              .map(friend => (
                <View key={friend.userId.toString()} style={styles.friendThumbnailWrapper}>
                  <Image
                    source={
                      friend.mediaUrl 
                        ? { uri: friend.mediaUrl } 
                        : DUCK_IMAGE
                    }
                    style={styles.friendThumbnail}
                  />
                  <Text style={styles.friendNickname}>{friend.nickname}</Text>
                </View>
            ))}
          </ScrollView>
        )}

        {/* 작성 완료 버튼 */}
        <View style={styles.completeButtonContainer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>작성 완료</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 날짜 선택 컴포넌트 */}
      {showDatePicker && (
        <DateTimePicker
          value={date ? new Date(date) : new Date(new Date().setDate(new Date().getDate() + 1))}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date(new Date().setDate(new Date().getDate() + 1))}
        />
      )}

      {/* 친구 목록 모달 */}
      <Modal
        visible={friendsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFriendsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { width: 300 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderText}>친구 목록</Text>
            </View>
            <ScrollView style={{ maxHeight: 300 }}>
              {friendsList.length === 0 ? (
                <Text style={styles.emptyText}>등록된 친구가 없습니다.</Text>
              ) : (
                friendsList.map((friend) => (
                  <TouchableOpacity
                    key={friend.userId.toString()}
                    style={[
                      styles.friendItem,
                      accessUserIds.includes(friend.userId) && styles.friendItemSelected,
                    ]}
                    onPress={() => {
                      if (accessUserIds.includes(friend.userId)) {
                        setAccessUserIds(accessUserIds.filter(id => id !== friend.userId));
                      } else {
                        setAccessUserIds([...accessUserIds, friend.userId]);
                      }
                    }}
                  >
                    <Image
                      source={
                        friend.avatarUrl
                          ? { uri: friend.avatarUrl }
                          : friend.mediaUrl
                            ? { uri: friend.mediaUrl }
                            : DUCK_IMAGE
                      }
                      style={styles.friendImage}
                    />
                    <Text style={styles.friendNickname}>{friend.nickname}</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={handleAttachFriends}>
                <Text style={styles.modalButtonText}>첨부</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => setFriendsModalVisible(false)}>
                <Text style={styles.modalButtonText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
};

export default TimeCapsule;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#87A7C0',
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  labelTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#87A7C0',
    marginBottom: 5,
  },
  titleInput: {
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 15,
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  mediaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 25,
  },
  mediaAttachButton: {
    width: 50 * MEDIA_SCALE,
    height: 50 * MEDIA_SCALE,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    position: 'relative',
  },
  mediaCount: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    fontSize: 10 * MEDIA_SCALE,
    color: '#AAAAAA',
  },
  mediaScroll: {
    flexGrow: 0,
  },
  thumbnailWrapper: {
    width: 50 * MEDIA_SCALE,
    height: 50 * MEDIA_SCALE,
    marginRight: 15,
    position: 'relative',
  },
  thumbnail: {
    width: 50 * MEDIA_SCALE,
    height: 50 * MEDIA_SCALE,
    borderRadius: 5,
  },
  removeIcon: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'red',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContent: {
    fontSize: 25, 
    fontWeight: 'bold',
    color: '#87A7C0',
    marginTop: 15,
    marginBottom: 5,
  },
  contentBox: {
    minHeight: 370,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    padding: 10,
    marginTop: 5,
  },
  charCount: {
    alignSelf: 'flex-end',
    color: '#AAAAAA',
  },
  contentInput: {
    flex: 1,
    fontSize: 15, 
    color: '#000000',
    textAlignVertical: 'top',
  },
  shareContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginTop: 15,
    marginHorizontal: 20,
  },
  shareLabel: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#87A7C0',
    marginBottom: 5,
  },
  addFriendButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#87A7C0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateSelectButton: {
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 15,
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  dateSelectButtonText: {
    color: 'black',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#87A7C0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
  },
  selectedFriendsContainer: {
    marginHorizontal: 20,
    marginTop: 10,
  },
  friendThumbnailWrapper: {
    alignItems: 'center',
    marginRight: 10,
  },
  friendThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 5,
  },
  friendNickname: {
    fontSize: 12,
    marginTop: 5,
    color: '#3F4A6B',
  },
  openDateLabel: {
    fontSize: 25, 
    fontWeight: 'bold',
    color: '#87A7C0',
    marginBottom: 5,
    marginTop: 15,
  },
  completeButtonContainer: {
    marginTop: 40,
    marginBottom: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    paddingTop: 0,
    paddingHorizontal: 0,
    paddingBottom: 20, 
  },
  modalHeader: {
    backgroundColor: '#87A7C0',
    width: '100%',
    padding: 10,
    paddingBottom: 10,
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  modalHeaderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  modalButton: {
    backgroundColor: '#87A7C0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#B0B0B0',
    padding: 10,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  friendItemSelected: {
    backgroundColor: '#D9D9D9',
  },
  friendImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
});
