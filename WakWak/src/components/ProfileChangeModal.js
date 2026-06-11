import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';

const ProfileChangeModal = ({ 
  visible, 
  onClose, 
  currentNickname,
  currentProfileImage,
  onNicknameChange,
  onProfileImageChange 
}) => {
  const [nickname, setNickname] = useState(currentNickname);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  // 미리보기 이미지 상태
  const [previewImage, setPreviewImage] = useState(currentProfileImage);

  useEffect(() => {
    setPreviewImage(currentProfileImage);
  }, [currentProfileImage]);

  useEffect(() => {
    setNickname(currentNickname);
    setIsAvailable(true); // 현재 닉네임이 기본
  }, [currentNickname]);

  const handleImagePicker = () => {
    console.log('이미지 선택 시작');
    const options = {
      mediaType: 'photo',
      maxWidth: 512,
      maxHeight: 512,
      quality: 0.5,
    };
  
    ImagePicker.launchImageLibrary(options, async (response) => {
      console.log('이미지 선택 응답:', response);
      
      if (response.didCancel) {
        console.log('이미지 선택 취소됨');
        return;
      }
  
      if (response.error) {
        console.log('이미지 선택 오류:', response.error);
        Alert.alert('오류', '이미지를 선택하는 중 오류가 발생했습니다.');
        return;
      }
  
      const imageFile = {
        uri: response.assets[0].uri,
        type: response.assets[0].type,
        name: response.assets[0].fileName,
      };
      
      // 먼저 미리보기 업데이트
      setPreviewImage({ uri: response.assets[0].uri });
      console.log('선택된 이미지 파일:', imageFile);
    });
  };

  const handleNicknameCheck = async () => {
    console.log('=== 모달: 닉네임 중복 확인 시작 ===');
    console.log('입력된 닉네임:', nickname);
    
    if (!nickname || nickname.trim() === '') {
      console.log('닉네임이 비어있음');
      Alert.alert('알림', '닉네임을 입력해주세요.');
      return;
    }
  
    // 닉네임 유효성 검사 추가
    const nicknameRegex = /^[a-zA-Z0-9가-힣]{2,20}$/;
    if (!nicknameRegex.test(nickname)) {
      console.log('닉네임 형식 불일치');
      Alert.alert('알림', '닉네임은 2-20자의 한글, 영문, 숫자만 사용 가능합니다.');
      return;
    }
  
    // 현재 닉네임과 동일한 경우 체크
    if (nickname === currentNickname) {
      console.log('현재 닉네임과 동일함');
      Alert.alert('알림', '현재 사용 중인 닉네임과 동일합니다.');
      setIsAvailable(true);
      return;
    }
    
    setIsChecking(true);
    console.log('중복 확인 요청 시작');
    
    try {
      const available = await onNicknameChange(nickname, true);
      console.log('중복 확인 결과 수신:', available);
      setIsAvailable(available);
      
      if (available) {
        console.log('사용 가능한 닉네임임');
        Alert.alert('확인', '사용 가능한 닉네임입니다.');
      } else {
        console.log('사용 불가능한 닉네임임');
        Alert.alert('알림', '이미 사용 중인 닉네임입니다.');
      }
    } catch (error) {
      console.error('모달: 중복 확인 중 오류 발생', error);
      Alert.alert('오류', '중복 확인 중 오류가 발생했습니다.');
    } finally {
      console.log('중복 확인 프로세스 종료');
      setIsChecking(false);
    }
  };

  const handleSubmit = async () => {
    console.log('프로필 변경 시도');
    let success = true;
  
    // 닉네임 변경 처리
    if (nickname !== currentNickname) {
      // 현재 닉네임과 다른 경우에만 중복 확인 필요
      if (!isAvailable) {
        console.log('닉네임 중복 확인이 되지 않음');
        Alert.alert('알림', '닉네임 중복 확인이 필요합니다.');
        return;
      }
  
      console.log('닉네임 변경 요청 전송');
      success = await onNicknameChange(nickname, false);
      if (!success) {
        return;
      }
    }
  
    // 프로필 이미지 변경 처리
    if (previewImage.uri !== currentProfileImage.uri) {
      console.log('이미지 변경 감지됨');
      const imageFile = {
        uri: previewImage.uri,
        type: 'image/jpeg',
        name: 'profile.jpg'
      };
      const imageSuccess = await onProfileImageChange(imageFile);
      success = success && imageSuccess;
    }
  
    if (success) {
      console.log('프로필 변경 완료');
      // 이미지만 변경된 경우에만 성공 알림 표시
      if (previewImage.uri !== currentProfileImage.uri) {
        Alert.alert('성공', '프로필이 성공적으로 변경되었습니다.');
      }
      onClose();
    }
  };
  

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>프로필 수정</Text>
          
          <TouchableOpacity 
            style={styles.imageContainer}
            onPress={handleImagePicker}
          >
            <Image 
            source={previewImage} 
            style={styles.profileImage}
            />
            <Text style={styles.changeImageText}>이미지 변경</Text>
          </TouchableOpacity>

          <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={nickname}
            onChangeText={(text) => {
                setNickname(text);
                setIsAvailable(false); // 닉네임이 변경되면 중복확인 상태 초기화
            }}
            placeholder="새로운 닉네임"
            />
            <TouchableOpacity 
              style={[
                styles.checkButton,
                isAvailable && styles.checkButtonSuccess
              ]}
              onPress={handleNicknameCheck}
            >
              <Text style={styles.checkButtonText}>
                {isChecking ? "확인 중..." : "중복 확인"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onClose}
            >
              <Text style={styles.buttonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>저장</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  changeImageText: {
    color: '#87A7C0',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  checkButton: {
    backgroundColor: '#87A7C0',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
  },
  checkButtonSuccess: {
    backgroundColor: '#4CAF50',
  },
  checkButtonText: {
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  submitButton: {
    backgroundColor: '#87A7C0',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default ProfileChangeModal;
