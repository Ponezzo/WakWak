import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
  Modal,
  Linking,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import Ionic from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';

const { width: deviceWidth } = Dimensions.get('window');
const MAX_MEDIA = 5; // 최대 5개 첨부 가능
const MEDIA_SCALE = 1.5; // 미디어 관련 요소 배율
const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100MB

const StarWrite = ({ route, navigation }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  
  // 에러 상태
  const [errorTitle, setErrorTitle] = useState('');
  const [errorContent, setErrorContent] = useState('');
  const [errorMedia, setErrorMedia] = useState('');

  const { skyId: initialSkyId, starArray: passedStarArray, constellationData: passedConstellationData } = route.params || {};
  const [skyId] = useState(initialSkyId || '');
  const [constellationData] = useState(passedConstellationData || []);

  // ScrollView 및 각 섹션의 ref와 오프셋 저장
  const scrollRef = useRef(null);
  const [titleOffset, setTitleOffset] = useState(0);
  const [contentOffset, setContentOffset] = useState(0);

  // 권한 모달 상태 및 설정으로 이동 핸들러
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const handleOpenSettings = () => {
    Linking.openSettings();
    setPermissionModalVisible(false);
  };

  // Android 권한 체크 함수
  const hasAndroidPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const permissions = Platform.Version >= 33
          ? [
              PermissionsAndroid.PERMISSIONS.CAMERA,
              PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
              PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
            ]
          : [
              PermissionsAndroid.PERMISSIONS.CAMERA,
              PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
              PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
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

  // 전체 파일 용량 체크 함수
  const checkTotalFileSize = (files) => {
    const totalSize = files.reduce((sum, file) => sum + (file.fileSize || 0), 0);
    return totalSize <= MAX_TOTAL_SIZE;
  };

  // 이미지 선택 핸들러 (비동기로 권한 체크 수행)
  const handleSelectImage = async () => {
    if (mediaFiles.length >= MAX_MEDIA) return;

    // 권한 체크
    const permissionGranted = await hasAndroidPermission();
    if (!permissionGranted) {
      setPermissionModalVisible(true);
      return;
    }

    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('사진 첨부 취소');
      } else if (response.errorCode) {
        console.log('이미지 픽커 오류', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        // 이미지 타입 체크
        if (asset.type && asset.type.startsWith('image/')) {
          // 기존 파일과 새 파일의 총 용량 계산
          const newFiles = [...mediaFiles, asset];
          if (!checkTotalFileSize(newFiles)) {
            setErrorMedia('첨부된 이미지의 총 용량이 100MB를 초과합니다.');
            Alert.alert('용량 초과', '첨부된 이미지의 총 용량은 100MB 미만이어야 합니다.');
            return;
          }
          setErrorMedia('');
          setMediaFiles((prev) => (prev.length < MAX_MEDIA ? [...prev, asset] : prev));
        } else {
          console.log('이미지가 아님.');
        }
      }
    });
  };

  // 파일 제거 핸들러
  const removeFile = (index) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // 제목 입력 포커스 시, titleOffset로 즉시 스크롤
  const handleFocusTitle = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ y: titleOffset, animated: false });
    }
  };

  // 내용 입력 포커스 시, contentOffset로 즉시 스크롤
  const handleFocusContent = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ y: contentOffset, animated: false });
    }
  };

  // 작성 완료 버튼
  const handleComplete = () => {
    let valid = true;
    if (!title.trim()) {
      setErrorTitle('제목을 입력해야 합니다.');
      valid = false;
    } else {
      setErrorTitle('');
    }
    if (!content.trim()) {
      setErrorContent('내용을 입력해야 합니다.');
      valid = false;
    } else {
      setErrorContent('');
    }
    if (!valid) return;

    // 추가로 미디어 파일의 총 용량 체크 (필요 시)
    if (!checkTotalFileSize(mediaFiles)) {
      setErrorMedia('첨부된 이미지의 총 용량이 100MB를 초과합니다.');
      Alert.alert('용량 초과', '첨부된 이미지의 총 용량은 100MB 미만이어야 합니다.');
      return;
    }

    // 내부 스택 내의 StarPosition 스크린으로 데이터 전달
    navigation.navigate('StarPosition', {
      title,
      content,
      mediaFiles,
      skyId,
      starArray: passedStarArray || [],
      constellationData,
    });
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('StarHomeMain')} style={{ marginRight: 10 }}>
          <Ionic name="arrow-back" size={30} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>이야기 담기</Text>
      </View>

      {/* 본문 영역 */}
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
              { opacity: mediaFiles.length >= MAX_MEDIA ? 0.5 : 1 },
            ]}
            onPress={handleSelectImage}
            disabled={mediaFiles.length >= MAX_MEDIA}
          >
            <Ionic name="image-outline" size={37} color="#AAAAAA" />
            <Text style={styles.mediaCount}>{mediaFiles.length}/{MAX_MEDIA}</Text>
          </TouchableOpacity>
          {mediaFiles.length > 0 && (
            <ScrollView
              horizontal
              style={styles.mediaScroll}
              showsHorizontalScrollIndicator={false}
            >
              {mediaFiles.map((file, index) => (
                <View key={index} style={styles.thumbnailWrapper}>
                  <Image source={{ uri: file.uri }} style={styles.thumbnail} />
                  <TouchableOpacity style={styles.removeIcon} onPress={() => removeFile(index)}>
                    <Ionic name="close" size={14} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
        {errorMedia ? <Text style={styles.errorText}>{errorMedia}</Text> : null}

        {/* 제목 영역 */}
        <View style={styles.sectionContainer} onLayout={(e) => setTitleOffset(e.nativeEvent.layout.y)}>
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

        {/* 작성 완료 버튼 */}
        <View style={styles.completeButtonContainer}>
          <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
            <Text style={styles.completeButtonText}>작성 완료</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 권한 모달 */}
      <PermissionModal
        visible={permissionModalVisible}
        onClose={() => setPermissionModalVisible(false)}
        onOpenSettings={handleOpenSettings}
      />
    </View>
  );
};

const PermissionModal = ({ visible, onClose, onOpenSettings }) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.permissionModalContainer}>
      <View style={styles.permissionModalContent}>
        <Text style={styles.permissionModalTitle}>권한이 필요합니다</Text>
        <Text style={styles.permissionModalText}>
          카메라 및 갤러리 접근 권한이 필요합니다. 설정에서 권한을 부여해 주세요.
        </Text>
        <View style={styles.permissionModalButtons}>
          <TouchableOpacity style={styles.permissionModalButton} onPress={onClose}>
            <Text style={styles.permissionModalButtonText}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.permissionModalButton} onPress={onOpenSettings}>
            <Text style={styles.permissionModalButtonText}>설정으로 이동</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 20,
  },
  // 헤더
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
  // 섹션 컨테이너
  sectionContainer: {
    marginBottom: 30,
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
  // 제목 영역
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
  // 내용 영역
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
  // 작성 완료 버튼
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
  // Permission Modal styles
  permissionModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionModalContent: {
    width: deviceWidth * 0.8,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  permissionModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  permissionModalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  permissionModalButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#87A7C0',
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
  },
  permissionModalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default StarWrite;
