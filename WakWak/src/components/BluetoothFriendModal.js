import React, { useState, useEffect } from 'react';
import { 
  View, Text, Modal, StyleSheet, TouchableOpacity, 
  ScrollView, Image, Alert, Platform, PermissionsAndroid, NativeModules, NativeEventEmitter
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BluetoothFriendModal = ({ visible, onClose, BASE_URL }) => {
  const [scannedDevices, setScannedDevices] = useState([]); // 스캔된 블루투스 기기 목록
  const [isScanning, setIsScanning] = useState(false); // 스캔 진행 중 여부
  const [nearbyUsers, setNearbyUsers] = useState([]); // 근처의 사용자 목록
  const [myDeviceId, setMyDeviceId] = useState(null);
  const [foundUsers, setFoundUsers] = useState([]);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    const getStoredToken = async () => {
      try {
        const token = await AsyncStorage.getItem('AUTH_TOKEN');
        if (token) {
          setAuthToken(`Bearer ${token}`);
        } else {
          console.warn('저장된 토큰이 없습니다');
        }
      } catch (error) {
        console.error('토큰 가져오기 실패:', error);
      }
    };
    getStoredToken();
  }, []);

  // 블루투스 이벤트 이미터 초기화
  useEffect(() => {
    const BleManagerModule = NativeModules.BleManager;
    const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

    const initBleManager = async () => {
      try {
        console.log('[블루투스] 매니저 초기화 시작');
        await BleManager.start({ showAlert: false });
        console.log('[블루투스] 매니저 초기화 완료');

        const bluetoothState = await BleManager.checkState();
        console.log('[블루투스] 현재 상태:', bluetoothState);

        if (bluetoothState !== 'on') {
          Alert.alert(
            '블루투스 꺼짐',
            '블루투스를 켜주세요.',
            [{ text: '확인', onPress: () => BleManager.enableBluetooth() }]
          );
        }

        await requestPermissions();
      } catch (error) {
        console.error('[블루투스] 초기화 실패:', error);
      }
    };

    const discoveryListener = bleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      handleDiscoverPeripheral
    );

    initBleManager();

    return () => {
      console.log('[블루투스] 리소스 정리 시작');
      discoveryListener.remove();
      BleManager.stopScan();
      console.log('[블루투스] 리소스 정리 완료');
    };
  }, []);

  // 현재 디바이스의 블루투스 정보 가져오기
  const getMyDeviceInfo = async () => {
    try {
      // 블루투스 상태 확인
      const enabled = await BleManager.checkState();
      if (enabled === 'on') {
        // 현재 디바이스의 블루투스 어댑터 정보 가져오기
        const info = await BleManager.getBleState();
        if (info) {
          // Android의 경우 MAC 주소를, iOS의 경우 UUID를 디바이스 ID로 사용
          const deviceId = Platform.OS === 'android' 
            ? await BleManager.getMacAddress() 
            : info.uuid;
          
          setMyDeviceId(deviceId);
          // 디바이스 ID를 서버에 등록
          await registerDevice(deviceId, Platform.OS === 'android' ? 'Android Device' : 'iOS Device');
        }
      } else {
        Alert.alert('알림', '블루투스를 켜주세요.');
      }
    } catch (error) {
      console.error('디바이스 정보 가져오기 실패:', error);
    }
  };

  // 컴포넌트 마운트 시 블루투스 초기화
  useEffect(() => {
    const initBleManager = async () => {
      try {
        console.log('[블루투스] 매니저 초기화 시작');
        await BleManager.start({ showAlert: false });
        console.log('[블루투스] 매니저 초기화 완료');

        const bluetoothState = await BleManager.checkState();
        console.log('[블루투스] 현재 상태:', bluetoothState);
        
        if (bluetoothState !== 'on') {
          console.log('[블루투스] 블루투스가 꺼져있음, 활성화 요청');
          Alert.alert(
            '블루투스 꺼짐',
            '블루투스를 켜주세요.',
            [{ text: '확인', onPress: () => BleManager.enableBluetooth() }]
          );
        }

        const permissionResult = await requestPermissions();
        console.log('[블루투스] 권한 요청 결과:', permissionResult);
      } catch (error) {
        console.error('[블루투스] 초기화 실패:', error);
      }
    };

    initBleManager();
  }, []);

  // 안드로이드 권한 요청
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
      ]);
      return Object.values(granted).every(
        permission => permission === PermissionsAndroid.RESULTS.GRANTED
      );
    }
    return true;
  };

  // 블루투스 스캔 시작
  const startBluetoothScan = async () => {
    try {
      console.log('[스캔] 블루투스 스캔 시작');
      setIsScanning(true);
      await BleManager.scan([], 10, true);
      console.log('[스캔] 10초간 주변 기기 스캔 중...');
      
      setTimeout(() => {
        BleManager.stopScan();
        console.log('[스캔] 스캔 종료');
        setIsScanning(false);
      }, 10000);
    } catch (error) {
      console.error('[스캔] 오류 발생:', error);
    }
  };

  // 블루투스 기기 발견 처리
  const handleDiscoverPeripheral = async (peripheral) => {
    console.log('[발견] 새로운 기기 발견:', peripheral);
    if (!peripheral.name && !peripheral.id) {
      console.log('[발견] 유효하지 않은 기기 정보, 무시');
      return;
    }
    
    console.log('[발견] 서버에 디바이스 등록 시도');
    await registerDevice(peripheral.id, peripheral.name || 'Android Device');
    
    setScannedDevices(prevDevices => {
      if (!prevDevices.some(device => device.id === peripheral.id)) {
        console.log('[발견] 새로운 기기 목록에 추가:', peripheral.name);
        const newDevices = [...prevDevices, peripheral];
        console.log('[발견] 발견된 모든 기기로 사용자 검색 시작');
        searchBluetoothUsers(newDevices.map(device => device.id));
        return newDevices;
      }
      return prevDevices;
    });
  };

  // 블루투스 사용자 검색
  const searchBluetoothUsers = async (deviceIds) => {
    try {
      if (!authToken) {
        Alert.alert('오류', '인증 토큰이 없습니다.');
        return;
      }

      const response = await axios.post(`${BASE_URL}/friends/search/bluetooth`, {
        params: { deviceIds : deviceIds.join(',') },
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json',
        },
      });

      const data = response.data;
      if (response.status === 200 && data.code === 'SUCCESS') {
        setNearbyUsers(data.data);
      } else {
        handleApiError(response.status, data);
      }
    } catch (error) {
      Alert.alert('오류', '블루투스 사용자 검색에 실패했습니다.');
    }
  };

  // API 에러 처리
  const handleApiError = (status, data) => {
    switch (status) {
      case 400:
        if (data.code === 'MISSING_DEVICE_IDS') {
          Alert.alert('오류', '디바이스 ID가 필요합니다.');
        }
        break;
      case 401:
        if (data.code === 'AUTH_REQUIRED') {
          Alert.alert('오류', '로그인이 필요합니다.');
        } else if (data.code === 'INVALID_TOKEN') {
          Alert.alert('오류', '인증 토큰이 유효하지 않습니다.');
        }
        break;
      case 500:
        Alert.alert('오류', '서버 내부 오류가 발생했습니다.');
        break;
      default:
        Alert.alert('오류', '알 수 없는 오류가 발생했습니다.');
    }
  };

  // 디바이스 등록
  const registerDevice = async (deviceId, deviceName) => {
    try {
      if (!authToken) {
        Alert.alert('오류', '인증 토큰이 없습니다.');
        return;
      }

      const response = await axios.post(
        `${BASE_URL}/tmp/device`,
        { deviceId, deviceName },
        {
          headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = response.data;
      if (response.status === 200 && data.code === 'SUCCESS') {
        console.log('디바이스 등록 성공:', data.data);
      } else {
        handleApiError(response.status, data);
      }
    } catch (error) {
      console.error('디바이스 등록 실패:', error);
    }
  };

  // 친구 요청 보내기
  const sendFriendRequest = async (userId) => {
    try {
      if (!authToken) {
        Alert.alert('오류', '인증 토큰이 없습니다.');
        return;
      }

      const response = await axios.post(
        `${BASE_URL}/friends/send`,
        { receiverId: userId },
        {
          headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = response.data;
      if (data.code === 'SUCCESS') {
        Alert.alert('성공', '친구 요청을 보냈습니다.');
      } else {
        handleApiError(response.status, data);
      }
    } catch (error) {
      console.error('[친구요청] 실패:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.headerContainer}>
            <Text style={styles.modalTitle}>블루투스 친구 찾기</Text>
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

          <TouchableOpacity 
            style={[styles.scanButton, isScanning && styles.scanningButton]}
            onPress={startBluetoothScan}
            disabled={isScanning}
          >
            <Text style={styles.scanButtonText}>
              {isScanning ? '스캔 중...' : '블루투스 스캔 시작'}
            </Text>
          </TouchableOpacity>

          <ScrollView style={styles.deviceList}>
            {nearbyUsers.map((user) => (
              <View key={user.user_id} style={styles.deviceItem}>
                <View style={styles.deviceInfo}>
                  <Text style={styles.deviceName}>{user.nickname}</Text>
                  <Image 
                    source={{ uri: user.media_url }} 
                    style={styles.profileImage}
                  />
                </View>
                <TouchableOpacity 
                  style={styles.requestButton}
                  onPress={() => sendFriendRequest(user.user_id)}
                >
                  <Text style={styles.requestButtonText}>친구 신청</Text>
                </TouchableOpacity>
              </View>
            ))}
            {nearbyUsers.length === 0 && (
              <Text style={styles.noDevicesText}>
                {isScanning ? '주변 기기 검색 중...' : '발견된 사용자가 없습니다.'}
              </Text>
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
  scanButton: {
    backgroundColor: '#87A7C0',
    padding: 15,
    borderRadius: 10,
    marginVertical: 20,
    alignItems: 'center',
  },
  scanningButton: {
    backgroundColor: '#888',
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deviceList: {
    flex: 1,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  deviceInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  requestButton: {
    backgroundColor: '#87A7C0',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  requestButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noDevicesText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
});

export default BluetoothFriendModal;