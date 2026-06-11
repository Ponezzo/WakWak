import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity,
  Image, 
  SafeAreaView, 
  StyleSheet,
  Linking,
  Dimensions,
  ScrollView, 
  Alert
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { PermissionsAndroid, Platform } from 'react-native';
import UploadModeModal from '../components/UploadModeModal';
import Ionic from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: deviceWidth } = Dimensions.get('window');
const MAX_MEDIA = 5;
const MEDIA_SCALE = 1.5;

const Sendbottle = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  // 다중 이미지를 위해 배열로 변경
  const [images, setImages] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  
  // 에러 상태
  const [errorMedia, setErrorMedia] = useState('');
  const [errorTitle, setErrorTitle] = useState('');
  const [errorContent, setErrorContent] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const scrollRef = useRef(null);
  const [titleOffset, setTitleOffset] = useState(0);
  const [contentOffset, setContentOffset] = useState(0);

  const [authToken, setAuthToken] = useState(null);
  const BASE_URL = 'https://i12e207.p.ssafy.io';

  // 토큰 가져오기 useEffect
  useEffect(() => {
    const getStoredToken = async () => {
      try {
        const token = await AsyncStorage.getItem('AUTH_TOKEN');
        if (token) {
          setAuthToken(`Bearer ${token}`);
          console.log('토큰 가져오기 성공');
          console.log(`Bearer ${token}`);
        } else {
          console.warn('저장된 토큰이 없습니다');
        }
      } catch (error) {
        console.error('토큰 가져오기 실패:', error);
      }
    };
    getStoredToken();
  }, []);

  const imagePickerOption = {
    mediaType: 'photo',
    maxWidth: 512,
    maxHeight: 512,
    includeBase64: Platform.OS === 'android',
    selectionLimit: MAX_MEDIA,
  };

  const hasAndroidPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const permissions = Platform.Version >= 33 
          ? [
              PermissionsAndroid.PERMISSIONS.CAMERA,
              PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
              PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO
            ]
          : [
              PermissionsAndroid.PERMISSIONS.CAMERA,
              PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
              PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
            ];
        
        const statuses = await PermissionsAndroid.requestMultiple(permissions);
        return Object.values(statuses).every(status => status === PermissionsAndroid.RESULTS.GRANTED);
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    const checkPermissions = async () => {
      const hasPermission = await hasAndroidPermission();
      if (!hasPermission) {
        Linking.openSettings();
      }
    };
    checkPermissions();
  }, []);

  // 다중 이미지 선택 처리
  const onPickImage = (result) => {
    if (result.didCancel || !result) return;
    
    if (result.errorCode) {
      setErrorMessage('이미지를 선택하는 중 오류가 발생했습니다.');
      return;
    }

    if (result.assets && result.assets.length > 0) {
      const newImages = result.assets;
      setImages((prev) => {
        const combined = [...prev, ...newImages];
        return combined.slice(0, MAX_MEDIA);
      });
    }
  };

  const onLaunchCamera = async () => {
    const hasPermission = await hasAndroidPermission();
    if (!hasPermission) {
      setErrorMessage('카메라 접근 권한이 필요합니다.');
      return;
    }
    launchCamera({ ...imagePickerOption, selectionLimit: 1 }, onPickImage);
  };

  const onLaunchImageLibrary = async () => {
    const hasPermission = await hasAndroidPermission();
    if (!hasPermission) {
      setErrorMessage('갤러리 접근 권한이 필요합니다.');
      return;
    }
    launchImageLibrary(imagePickerOption, onPickImage);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // 스크롤 포커스 처리
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

  // 파일 크기 체크 함수 추가
  const checkTotalFileSize = (imageFiles) => {
    const totalSize = imageFiles.reduce((sum, file) => {
      return sum + (file.fileSize || 0);
    }, 0);
    
    // 100MB를 bytes로 변환 (10 * 1024 * 1024)
    const maxSize = 100 * 1024 * 1024;
    
    return totalSize <= maxSize;
  };

  // 유리병(메시지) 전송 함수 (FormData 사용)
  const handleSendMessage = async () => {
    console.log('=== 유리병 전송 프로세스 시작 ===');
    
    // 필수 항목 체크
    if (images.length === 0) {
      console.log('에러: 이미지 미첨부');
      setErrorMedia('사진을 첨부해주세요.');
      return;
    }
  
    // 파일 크기 체크
    console.log('첨부된 이미지 정보:', images.map(img => ({
      크기: img.fileSize,
      타입: img.type,
      uri: img.uri
    })));
    
    if (!checkTotalFileSize(images)) {
      console.log('에러: 파일 크기 초과');
      setErrorMessage('100MB 미만의 파일을 첨부해주세요.');
      return;
    }
  
    if (!title.trim()) {
      console.log('에러: 제목 미입력');
      setErrorTitle('제목을 입력하세요.');
      return;
    }
    
    if (!text.trim()) {
      console.log('에러: 내용 미입력');
      setErrorContent('내용을 입력하세요.');
      return;
    }
  
    if (!authToken) {
      console.log('에러: 인증 토큰 없음');
      setErrorMessage('인증이 필요합니다.');
      return;
    }
  
    console.log('모든 유효성 검사 통과');
    setIsLoading(true);
    setErrorMessage('');
  
    try {
      console.log('=== API 요청 시작 ===');
      console.log('사용 중인 토큰:', authToken);
      
      // FormData 생성
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', text);
      
      console.log('전송할 데이터:');
      console.log('- 제목:', title);
      console.log('- 내용:', text);
      console.log('- 이미지 개수:', images.length);
  
      // 이미지 FormData에 추가
      if (images.length > 0) {
        images.forEach((img, index) => {
          const imageFile = {
            uri: img.uri,
            type: img.type || 'image/jpeg',
            name: `image_${index}.jpg`,
          };
          formData.append('images', imageFile);
          console.log(`- 이미지 ${index + 1}:`, imageFile);
        });
      }
  
      console.log('API 엔드포인트:', `${BASE_URL}/bottle`);
      const response = await axios.post(`${BASE_URL}/bottle`, formData, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'multipart/form-data'
        }
      });
  
      console.log('=== 서버 응답 ===');
      console.log('응답 코드:', response.status);
      console.log('응답 데이터:', response.data);
  
      if (response.data.code === 'SUCCESS') {
        console.log('유리병 전송 성공');
        Alert.alert(
          '성공', 
          '유리병 편지를 보냈어요.',
          [{
            text: '확인',
            onPress: () => {
              console.log('메인 화면으로 이동');
              navigation.navigate('BottleMain');
            }
          }]
        );
      }
    } catch (error) {
      console.error('=== 유리병 전송 실패 ===');
      console.error('에러 타입:', error.name);
      console.error('에러 메시지:', error.message);
      console.error('응답 상태:', error.response?.status);
      console.error('응답 데이터:', error.response?.data);
      
      setErrorMessage(
        error.response?.data?.message || 
        '유리병을 보내는데 실패했습니다. 다시 시도해주세요.'
      );
    } finally {
      console.log('=== 유리병 전송 프로세스 종료 ===');
      setIsLoading(false);
    }
  };
  
  

  return (
    <SafeAreaView style={styles.safeArea}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Image
            source={require('../../assets/images/bottle.png')}
            style={styles.loadingBottle}
          />
          <Text style={styles.loadingText}>유리병을 보내고 있어요...</Text>
        </View>
      ) : (
        <View style={styles.container}>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* 미디어 첨부 영역 */}
            <View style={styles.mediaContainer}>
              <TouchableOpacity
                style={[
                  styles.mediaAttachButton,
                  { opacity: images.length >= MAX_MEDIA ? 0.5 : 1 },
                ]}
                onPress={() => setModalVisible(true)}
                disabled={images.length >= MAX_MEDIA}
              >
                <Ionic name="image-outline" size={37} color="#AAAAAA" />
                <Text style={styles.mediaCount}>{images.length}/{MAX_MEDIA}</Text>
              </TouchableOpacity>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.mediaScroll}
              >
                {images.map((img, index) => (
                  <View key={index} style={styles.thumbnailWrapper}>
                    <Image source={{ uri: img.uri }} style={styles.thumbnail} />
                    <TouchableOpacity 
                      style={styles.removeIcon} 
                      onPress={() => removeImage(index)}
                    >
                      <Ionic name="close" size={14} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
            {images.length === 0 && (
              <Text style={styles.imageRequiredText}>사진을 첨부해주세요.</Text>
            )}

            {/* 제목 영역 */}
            <View 
              style={styles.sectionContainer} 
              onLayout={(e) => setTitleOffset(e.nativeEvent.layout.y)}
            >
              <Text style={styles.labelTitle}>제목</Text>
              <TextInput
                style={styles.titleInput}
                placeholder="제목을 입력하세요."
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
            <View 
              style={styles.sectionContainer} 
              onLayout={(e) => setContentOffset(e.nativeEvent.layout.y)}
            >
              <Text style={styles.labelContent}>내용</Text>
              <View style={styles.contentBox}>
                <TextInput
                  style={styles.contentInput}
                  placeholder="내용을 입력하세요."
                  placeholderTextColor="#CCCCCC"
                  multiline
                  value={text}
                  onChangeText={(t) => {
                    setText(t);
                    if (t.trim()) setErrorContent('');
                  }}
                  onFocus={handleFocusContent}
                />
                <Text style={styles.charCount}>{text.length}</Text>
              </View>
              {errorContent ? <Text style={styles.errorText}>{errorContent}</Text> : null}
            </View>

            {/* 네트워크 혹은 전송 관련 에러 메시지 */}
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            {/* 작성 완료 버튼 */}
            <View style={styles.completeButtonContainer}>
              <TouchableOpacity 
                style={styles.completeButton}
                onPress={handleSendMessage}
              >
                <Text style={styles.completeButtonText}>보내기</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}

      <UploadModeModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onLaunchCamera={onLaunchCamera}
        onLaunchImageLibrary={onLaunchImageLibrary}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 20,
  },
  // 미디어 첨부 영역
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
  // 섹션 컨테이너
  sectionContainer: {
    marginBottom: 30,
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
  labelContent: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#87A7C0',
    marginBottom: 5,
  },
  contentBox: {
    minHeight: 370,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    padding: 10,
    marginTop: 15,
  },
  contentInput: {
    flex: 1,
    fontSize: 15,
    color: '#000000',
    textAlignVertical: 'top',
  },
  charCount: {
    alignSelf: 'flex-end',
    color: '#AAAAAA',
  },
  completeButtonContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  completeButton: {
    backgroundColor: '#87A7C0',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    width: deviceWidth * 0.9,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  // 에러 메시지
  errorText: {
    color: 'red',
    marginTop: 5,
    fontSize: 14,
  },
  imageRequiredText: {
    color: '#FF0000',
    fontSize: 14,
    marginTop: 5,
    marginBottom: 10,
    textAlign: 'left',
  },
  // 로딩 화면
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBottle: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#000',
  },
});

export default Sendbottle;
