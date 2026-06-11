import React, { useEffect, useState, useRef } from 'react'; 
import {
  StyleSheet,
  View,
  Text,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  Alert,
  Modal,
  Linking,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';

import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import TimeCapsuleMapMarkers from '../components/TimeCapsuleMapMarkers';
import axios from 'axios';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import 'react-native-get-random-values';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://i12e207.p.ssafy.io';

let globalRemainingTime = null;
let globalDestinationMarker = null;
let globalTravelTime = null;
let globalExpiryTime = null;
let globalSubmissionTime = null;

const busanRegion = {
  latitude: 35.1796,
  longitude: 129.0756,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const Map = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const mapRef = useRef(null);
  const timerRef = useRef(null);

  const [authToken, setAuthToken] = useState(null);
  useEffect(() => {
    const getStoredToken = async () => {
      try {
        const token = await AsyncStorage.getItem('AUTH_TOKEN');
        if (token) {
          setAuthToken(`Bearer ${token}`);
          console.log('토큰 가져오기 성공');
        } else {
          console.warn('저장된 토큰이 없습니다');
        }
      } catch (error) {
        console.error('토큰 가져오기 실패:', error);
      }
    };
    getStoredToken();
  }, []);

  // 타임캡슐 열 수 있음(수거) 모달 관련 상태
  const [collectCapsules, setCollectCapsules] = useState([]);
  const [visibleCollectModals, setVisibleCollectModals] = useState([]);
  const [loadingCollectCapsules, setLoadingCollectCapsules] = useState(false);

  // 기존 상태들
  const [destinationMarker, setDestinationMarker] = useState(null);
  const [travelTime, setTravelTime] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);
  const [expiryTime, setExpiryTime] = useState(null);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [showArrivalModal, setShowArrivalModal] = useState(false);
  const [plantedCapsules, setPlantedCapsules] = useState([]);
  const [mapRegion, setMapRegion] = useState(busanRegion);
  const [markers, setMarkers] = useState([]);
  const [capsuleDetailModalVisible, setCapsuleDetailModalVisible] = useState(false);
  const [selectedCapsuleDetail, setSelectedCapsuleDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [timeCapsuleListModalVisible, setTimeCapsuleListModalVisible] = useState(false);
  const [timeCapsuleList, setTimeCapsuleList] = useState([]);
  const [loadingCapsuleList, setLoadingCapsuleList] = useState(false);

  const deg2rad = (deg) => deg * (Math.PI / 180);
  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculateTravelTime = (distanceKm) => {
    const averageSpeed = 162.5;
    const timeHours = distanceKm / averageSpeed;
    const hours = Math.floor(timeHours);
    let minutes = Math.round((timeHours - hours) * 60);
    if (minutes === 0) minutes = 1;
    return { hours, minutes };
  };

  const requestPermissions = async () => {
    try {
      if (Platform.OS === 'ios') {
        const auth = await Geolocation.requestAuthorization('always');
        if (auth === 'granted') {
          setPermissionsGranted(true);
        } else {
          Alert.alert(
            '권한 필요',
            '위치 권한을 허용해야 지도가 표시됩니다.',
            [
              { text: '설정으로 이동', onPress: () => Linking.openSettings() },
              { text: '취소', style: 'cancel' },
            ]
          );
        }
      } else {
        const locationPermissions = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        if (
          locationPermissions['android.permission.ACCESS_COARSE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED &&
          locationPermissions['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          setPermissionsGranted(true);
        } else {
          Alert.alert(
            '권한 필요',
            '위치 권한을 허용해야 지도가 표시됩니다.',
            [
              { text: '설정으로 이동', onPress: () => Linking.openSettings() },
              { text: '취소', style: 'cancel' },
            ]
          );
        }
      }
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    requestPermissions();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const parent = navigation.getParent();
      const unsubscribe = parent.addListener('tabPress', (e) => {
        if (navigation.getState().routes[navigation.getState().index].name === 'Map') {
          navigation.popToTop();
        }
      });
      return unsubscribe;
    }, [navigation])
  );

  useFocusEffect(
    React.useCallback(() => {
      console.log("Map 화면 포커스, route.params:", route.params);
      if (
        route.params?.submitted &&
        route.params.destinationMarker &&
        route.params.travelTime &&
        !route.params?.capsulePlanted
      ) {
        console.log("제출된 route.params 감지, 타이머 시작 준비");
        setDestinationMarker(route.params.destinationMarker);
        setTravelTime(route.params.travelTime);
        const totalSeconds =
          route.params.travelTime.hours * 3600 +
          route.params.travelTime.minutes * 60;
        console.log("계산된 총 시간 (초):", totalSeconds);
        setRemainingTime(totalSeconds);
        const newExpiry = Date.now() + totalSeconds * 1000;
        setExpiryTime(newExpiry);
        globalRemainingTime = totalSeconds;
        globalDestinationMarker = route.params.destinationMarker;
        globalTravelTime = route.params.travelTime;
        globalExpiryTime = newExpiry;
        globalSubmissionTime = Date.now();
        console.log("globalExpiryTime:", globalExpiryTime);
      } else if (globalExpiryTime !== null) {
        console.log("global 상태 복원, globalExpiryTime:", globalExpiryTime);
        setRemainingTime(globalRemainingTime);
        setDestinationMarker(globalDestinationMarker);
        setTravelTime(globalTravelTime);
        setExpiryTime(globalExpiryTime);
      } else {
        console.log("타이머 데이터 없음 (route.params와 global 모두 비어있음)");
      }
    }, [route.params])
  );

  useEffect(() => {
    const unsubscribeBlur = navigation.addListener('blur', () => {
      setShowArrivalModal(false);
    });
    return unsubscribeBlur;
  }, [navigation]);

  const handleLongPress = (event) => {
    if (expiryTime) {
      Alert.alert("진행 중", "타이머가 진행 중인 동안에는 새로운 목적지를 설정할 수 없습니다.");
      return;
    }
    const coordinate = event.nativeEvent.coordinate;
    if (destinationMarker && destinationMarker.source === 'longpress') {
      const distanceFromExisting = getDistanceFromLatLonInKm(
        destinationMarker.coordinate.latitude,
        destinationMarker.coordinate.longitude,
        coordinate.latitude,
        coordinate.longitude
      );
      if (distanceFromExisting < 0.05) {
        setDestinationMarker(null);
        setTravelTime(null);
        setRemainingTime(null);
        setExpiryTime(null);
        globalDestinationMarker = null;
        globalTravelTime = null;
        globalRemainingTime = null;
        globalExpiryTime = null;
        return;
      }
    }
    const newMarker = { coordinate, source: 'longpress' };
    setDestinationMarker(newMarker);
    const distance = getDistanceFromLatLonInKm(
      busanRegion.latitude,
      busanRegion.longitude,
      coordinate.latitude,
      coordinate.longitude
    );
    const time = calculateTravelTime(distance);
    setTravelTime(time);
    setRemainingTime(null);
    setExpiryTime(null);
    globalDestinationMarker = newMarker;
    globalTravelTime = time;
    globalRemainingTime = null;
    globalExpiryTime = null;
  };

  useEffect(() => {
    if (expiryTime) {
      timerRef.current = setInterval(() => {
        const newRemaining = Math.max(
          Math.floor((expiryTime - Date.now()) / 1000),
          0
        );
        console.log("타이머 tick - 남은 시간 (초):", newRemaining);
        setRemainingTime(newRemaining);
        globalRemainingTime = newRemaining;
        if (newRemaining <= 0) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          console.log("타이머 종료, 초기 화면으로 복원");
            // 상태를 모두 초기화하여 검색창/목록 버튼 상태로 복원
            setRemainingTime(null);
            setTravelTime(null);
            setExpiryTime(null);
            setDestinationMarker(null);
            globalRemainingTime = null;
            globalExpiryTime = null;
            globalDestinationMarker = null;
            navigation.replace('Map');
          }
        }, 1000);
        return () => clearInterval(timerRef.current);
        }
        }, [expiryTime]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? (hrs < 10 ? '0' + hrs : hrs) + ':' : ''}${
      mins < 10 ? '0' + mins : mins
    }:${secs < 10 ? '0' + secs : secs}`;
  };

  // 상세 정보 조회 모달 
  const fetchCapsuleDetail = async (capsuleId) => {
    setLoadingDetail(true);
    setCapsuleDetailModalVisible(true);
    
    if (!authToken) {
      console.warn("토큰이 없으므로 캡슐 상세를 조회할 수 없습니다.");
      setLoadingDetail(false);
      return;
    }
    try {
      const response = await axios.get(`${BASE_URL}/time-capsules?capsuleId=${capsuleId}`, {
        headers: { Authorization: authToken },
      });
      if (response.data && response.data.code === 'SUCCESS') {
        setSelectedCapsuleDetail(response.data.data);
      } else {
        console.error('Capsule detail API 응답 오류:', response.data);
      }
    } catch (error) {
      console.error('Error fetching capsule detail:', error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleTimeCapsuleListPress = async () => {
    setLoadingCapsuleList(true);
    if (!authToken) {
      console.warn("토큰이 없으므로 타임캡슐 목록을 조회할 수 없습니다.");
      setLoadingCapsuleList(false);
      return;
    }
    try {
      const response = await axios.get(`${BASE_URL}/time-capsules/map/list`, {
        headers: { Authorization: authToken },
      });
      if (response.data && response.data.code === 'SUCCESS') {
        const capsules = response.data.data;
        const now = new Date();
        const filteredCapsules = capsules.filter(
          (capsule) => new Date(capsule.openedAt) > now
        );
        setTimeCapsuleList(filteredCapsules);
      } else {
        console.error('Time capsule list API error:', response.data);
        Alert.alert('Error', 'Failed to fetch time capsule list');
      }
    } catch (error) {
      console.error('Time capsule list API error:', error);
      Alert.alert('Error', 'Failed to fetch time capsule list');
    } finally {
      setLoadingCapsuleList(false);
      setTimeCapsuleListModalVisible(true);
    }
  };

  const handleCapsuleItemPress = (capsule) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: capsule.latitude,
          longitude: capsule.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        1000
      );
      setTimeCapsuleListModalVisible(false);
    }
  };

  const fetchCollectableCapsules = async () => {
    if (!authToken) {
      console.warn("토큰이 없으므로 수거 가능한 타임캡슐 조회 불가");
      return;
    }
    setLoadingCollectCapsules(true);
    try {
      const response = await axios.get(`${BASE_URL}/time-capsules/map/collect`, {
        headers: { Authorization: authToken },
      });
      if (response.data && response.data.code === 'SUCCESS') {
        if (response.data.data && response.data.data.length > 0) {
          const detailedCapsules = await Promise.all(
            response.data.data.map(async (capsule) => {
              try {
                const detailResponse = await axios.get(`${BASE_URL}/time-capsules?capsuleId=${capsule.capsuleId}`, {
                  headers: { Authorization: authToken }
                });
                if (detailResponse.data && detailResponse.data.code === 'SUCCESS') {
                  return detailResponse.data.data;
                } else {
                  console.error('Detail API 응답 오류:', detailResponse.data);
                  return capsule;
                }
              } catch (error) {
                console.error('Error fetching detail for capsule', capsule.capsuleId, error);
                return capsule;
              }
            })
          );
          setCollectCapsules(detailedCapsules);
          setVisibleCollectModals(new Array(detailedCapsules.length).fill(true));
        }
      } else {
        console.error('Collect API error:', response.data);
        Alert.alert('Error', '수거 가능한 타임캡슐 조회 실패');
      }
    } catch (error) {
      console.error('Error fetching collectable capsules:', error);
      Alert.alert('Error', '수거 가능한 타임캡슐 조회 실패');
    } finally {
      setLoadingCollectCapsules(false);
    }
  };

  const autoCheckOpenableCapsules = async () => {
    if (!authToken) return;
    try {
      const response = await axios.get(`${BASE_URL}/time-capsules/map/list`, {
        headers: { Authorization: authToken },
      });
      if (response.data && response.data.code === 'SUCCESS') {
        const capsules = response.data.data;
        const now = new Date();
        const openableCapsules = capsules.filter(capsule => new Date(capsule.openedAt) <= now);
        if (openableCapsules.length > 0) {
          fetchCollectableCapsules();
        }
      } else {
        console.error('Time capsules list API error:', response.data);
      }
    } catch (error) {
      console.error('autoCheckOpenableCapsules error:', error);
    }
  };

  useEffect(() => {
    if (authToken) {
      autoCheckOpenableCapsules();
    }
  }, [authToken]);

  if (!permissionsGranted) {
    return (
      <View style={styles.permissionContainer}>
        <Text>오리가 걸을 곳을 찾는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* 상단 컨테이너에 타이머 텍스트와 검색창/목록 버튼 모두 포함 */}
      <View style={styles.topContainer}>
        {remainingTime !== null ? (
          <Text style={styles.travelTimeText}>
            남은 소요시간: {formatTime(remainingTime)}
          </Text>
        ) : destinationMarker && travelTime ? (
          <Text style={styles.travelTimeText}>
            소요시간: {travelTime.hours > 0 ? `${travelTime.hours}시간 ` : ''}
            {travelTime.minutes}분
          </Text>
        ) : (
          <View style={styles.searchRow}>
            <GooglePlacesAutocomplete
              placeholder="위치를 검색하세요"
              fetchDetails={true}
              onPress={(data, details = null) => {
                if (expiryTime) {
                  Alert.alert("진행 중", "타이머가 진행 중인 동안에는 새로운 목적지를 설정할 수 없습니다.");
                  return;
                }
                if (details && details.geometry && details.geometry.location) {
                  const { lat, lng } = details.geometry.location;
                  const coordinate = { latitude: lat, longitude: lng };
                  const newMarker = { coordinate, source: 'search' };
                  setDestinationMarker(newMarker);
                  const distance = getDistanceFromLatLonInKm(
                    busanRegion.latitude,
                    busanRegion.longitude,
                    lat,
                    lng
                  );
                  const time = calculateTravelTime(distance);
                  setTravelTime(time);
                  globalDestinationMarker = newMarker;
                  globalTravelTime = time;
                  mapRef.current?.animateToRegion(
                    {
                      latitude: lat,
                      longitude: lng,
                      latitudeDelta: 0.05,
                      longitudeDelta: 0.05,
                    },
                    1000
                  );
                }
              }}
              query={{
                key: 'AIzaSyA9gyBdy8aFIb1fR8dEPafVCMG5WVKdtgY',
                language: 'ko',
                components: 'country:kr',
              }}
              styles={{
                container: { width: '50%' },
                textInput: styles.searchInput,
              }}
              requestUrl={{
                url:
                  'https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api',
                useOnPlatform: 'web',
              }}
            />
            <TouchableOpacity style={styles.roundButton} onPress={handleTimeCapsuleListPress}>
              <Text style={styles.roundButtonText}>목록</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        initialRegion={busanRegion}
        onLongPress={handleLongPress}
        onRegionChangeComplete={(region) => setMapRegion(region)}
      >
        <Marker coordinate={busanRegion} title="부산" />
        {destinationMarker && (
          <>
            <Marker
              coordinate={destinationMarker.coordinate}
              title="목적지"
              pinColor={
                destinationMarker.source === 'longpress' ||
                destinationMarker.source === 'search'
                  ? 'blue'
                  : undefined
              }
            />
            <Polyline
              coordinates={[busanRegion, destinationMarker.coordinate]}
              strokeColor="#000"
              strokeWidth={3}
            />
          </>
        )}
        {markers.map((marker, index) => (
          <Marker
            key={marker.capsuleId ?? index}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            onPress={() => fetchCapsuleDetail(marker.capsuleId)}
            image={require('../../assets/images/capsule_mini.png')}
          />
        ))}
      </MapView>

      <TimeCapsuleMapMarkers 
        region={mapRegion} 
        onMarkersUpdate={setMarkers} 
      />

      {destinationMarker &&
        ((destinationMarker.source === 'longpress' || destinationMarker.source === 'search') &&
          (remainingTime === null || remainingTime === 0)) && (
          <TouchableOpacity
            style={styles.timeCapsuleButton}
            onPress={() => {
              const formattedCoordinate = {
                latitude: parseFloat(destinationMarker.coordinate.latitude.toFixed(7)),
                longitude: parseFloat(destinationMarker.coordinate.longitude.toFixed(7)),
              };
              navigation.navigate('TimeCapsule', {
                latitude: formattedCoordinate.latitude,
                longitude: formattedCoordinate.longitude,
                travelTime: travelTime,
                destinationMarker: destinationMarker,
              });
            }}
          >
            <Text style={styles.timeCapsuleButtonText}>타임캡슐 심기</Text>
          </TouchableOpacity>
        )}

      <Modal
        transparent={true}
        visible={
          remainingTime === 0 &&
          travelTime === null &&
          destinationMarker &&
          destinationMarker.source === 'longpress' &&
          showArrivalModal
            ? true
            : false
        }
        animationType="slide"
        onRequestClose={() => setShowArrivalModal(false)}
      >
      
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>타임캡슐이 도착</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowArrivalModal(false);
                setDestinationMarker(null);
                setTravelTime(null);
                setRemainingTime(null);
                setExpiryTime(null);
                globalDestinationMarker = null;
                globalTravelTime = null;
                globalRemainingTime = null;
                globalExpiryTime = null;
              }}
            >
              <Text style={styles.modalButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={capsuleDetailModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setCapsuleDetailModalVisible(false);
          setSelectedCapsuleDetail(null);
        }}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedCapsuleDetail ? selectedCapsuleDetail.title : '타임캡슐 상세'}
              </Text>
            </View>
            {/* Modal 내부 영역 */}
            <View style={styles.modalInnerContainer}>
              <ScrollView style={styles.modalContentScroll}>
                {loadingDetail ? (
                  <ActivityIndicator size="large" color="#000" style={{ padding: 20 }} />
                ) : selectedCapsuleDetail ? (
                  <>
                    {/* 작성자 및 공개일 영역 */}
                    <View style={styles.sectionContainer}>
                      <Text style={styles.content}>
                        작성자: {selectedCapsuleDetail.author?.nickname || '알 수 없음'}
                      </Text>
                    </View>
                    <View style={styles.sectionContainer}>
                      <Text style={styles.content}>
                        공개일: {(() => {
                          const openDate = new Date(selectedCapsuleDetail.opendedAt);
                          const year = openDate.getFullYear();
                          const month = openDate.getMonth() + 1;
                          const day = openDate.getDate();
                          let hours = openDate.getHours();
                          const minutes = openDate.getMinutes().toString().padStart(2, '0');
                          const ampm = hours >= 12 ? 'PM' : 'AM';
                          hours = hours % 12;
                          if (hours === 0) hours = 12;
                          return `${year}년 ${month}월 ${day}일 ${ampm} ${hours}:${minutes}`;
                        })()}
                      </Text>
                    </View>
                    {/* 공유 사용자 영역 */}
                    {selectedCapsuleDetail.sharedUsers &&
                      (() => {
                        const filteredSharedUsers = selectedCapsuleDetail.sharedUsers.filter(
                          user => user.nickname !== selectedCapsuleDetail.author?.nickname
                        );
                        if (filteredSharedUsers.length > 0) {
                          return (
                            <View style={styles.sectionContainer}>
                              <Text style={styles.sectionTitle}>
                                공유 사용자: {filteredSharedUsers.map(user => user.nickname).join(', ')}
                              </Text>
                            </View>
                          );
                        }
                        return null;
                      })()}
                    {/* 캡슐 내용 및 미디어 영역 (공개일이 지난 경우에만 노출) */}
                    {(() => {
                      const openDate = new Date(selectedCapsuleDetail.opendedAt);
                      const now = new Date();
                      const isOpen = now >= openDate;
                      if (isOpen) {
                        return (
                          <>
                            <View style={styles.sectionContainer}>
                              <Text style={styles.content}>
                                {selectedCapsuleDetail.content}
                              </Text>
                            </View>
                            {selectedCapsuleDetail.mediaUrls &&
                              selectedCapsuleDetail.mediaUrls.length > 0 && (
                                <View style={[styles.sectionContainer, styles.mediaContainer]}>
                                  <ScrollView horizontal style={{ marginTop: 10 }}>
                                    {selectedCapsuleDetail.mediaUrls.map((url, idx) => (
                                      <View key={idx} style={styles.swiperSlide}>
                                        <Image
                                          source={{ uri: url }}
                                          style={styles.mediaImage}
                                          resizeMode="cover"
                                        />
                                      </View>
                                    ))}
                                  </ScrollView>
                                </View>
                              )}
                          </>
                        );
                      }
                      return null;
                    })()}
                  </>
                ) : null}
              </ScrollView>
              {/* 하단 고정 영역: 닫기 버튼 */}
              <View style={styles.bottomFixedContainer}>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={() => {
                      setCapsuleDetailModalVisible(false);
                      setSelectedCapsuleDetail(null);
                    }}
                    style={styles.modalButtonClose}
                  >
                    <Text style={styles.modalButtonCloseText}>닫기</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>


      <Modal
        visible={timeCapsuleListModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setTimeCapsuleListModalVisible(false);
          setTimeCapsuleList([]); // 모달 닫을 때 목록 초기화
        }}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>타임캡슐 목록</Text>
            </View>
            <View style={styles.modalInnerContainer}>
              <ScrollView contentContainerStyle={styles.content}>
                {loadingCapsuleList ? (
                  <ActivityIndicator size="large" color="#000" style={{ padding: 20 }} />
                ) : (
                  timeCapsuleList.length > 0 ? (
                    timeCapsuleList.map((capsule, index) => (
                      <TouchableOpacity
                        key={capsule.capsuleId ?? index}
                        onPress={() => handleCapsuleItemPress(capsule)}
                        style={styles.listItem}
                      >
                        <View style={styles.listItemTextContainer}>
                          <Text style={styles.listItemTitle}>{capsule.title}</Text>
                          <Text style={styles.listItemSubtitle}>
                            {(() => {
                              const date = new Date(capsule.openedAt);
                              if (isNaN(date.getTime())) return "0000-00-00 개봉 예정";
                              const year = date.getFullYear();
                              const month = ("0" + (date.getMonth() + 1)).slice(-2);
                              const day = ("0" + date.getDate()).slice(-2);
                              return `${year}-${month}-${day} 개봉 예정`;
                            })()}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={{ padding: 20 }}>현재 심어진 타임캡슐이 없어요!</Text>
                  )
                )}
              </ScrollView>
              <TouchableOpacity
                onPress={() => {
                  setTimeCapsuleListModalVisible(false);
                  setTimeCapsuleList([]);
                }}
                style={styles.modalButtonClose}
              >
                <Text style={styles.modalButtonCloseText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {collectCapsules.map((capsule, index) => (
        visibleCollectModals[index] && (
          <Modal
            key={capsule.capsuleId}
            transparent={true}
            visible={true}
            animationType="slide"
            onRequestClose={() => {
              const newVisibles = [...visibleCollectModals];
              newVisibles[index] = false;
              setVisibleCollectModals(newVisibles);
            }}
          >
            <View style={styles.nowModalBackground}>
              <View style={styles.nowModalContainer}>
                {/* 모달 헤더 */}
                <View style={styles.nowModalHeader}>
                  <Text style={styles.nowModalTitle}>타임캡슐이 열렸어요!</Text>
                </View>
                {/* 내부 컨텐츠 영역 */}
                <View style={styles.nowModalInnerContainer}>
                  <ScrollView
                    style={styles.nowModalContentScroll}
                    contentContainerStyle={styles.nowModalScrollContent}
                  >
                    {/* 제목 */}
                    <View style={styles.nowModalSection}>
                      <Text style={styles.nowModalSectionTitle}>
                        {capsule.title}
                      </Text>
                    </View>
                    {/* 미디어 영역 (존재할 경우) */}
                    {capsule.mediaUrls && capsule.mediaUrls.length > 0 && (
                      <View style={styles.nowModalSection}>
                        <ScrollView horizontal style={styles.nowModalMediaScroll}>
                          {capsule.mediaUrls.map((url, idx) => (
                            <Image
                              key={idx}
                              source={{ uri: url }}
                              style={styles.nowModalMediaImage}
                              resizeMode="cover"
                            />
                          ))}
                        </ScrollView>
                      </View>
                    )}
                    {/* 내용 */}
                    <View style={styles.nowModalSection}>
                      <Text style={styles.nowModalSectionContent}>
                        {capsule.content}
                      </Text>
                    </View>
                    {/* 내용과 공유 영역 사이 구분선 (공유 영역이 있을 경우) */}
                    {capsule.sharedUsers &&
                      capsule.sharedUsers.filter(
                        user => user.nickname !== capsule.author?.nickname
                      ).length > 0 && (
                        <View style={styles.nowModalDivider} />
                      )}
                    {/* 함께한 친구 영역 (존재할 경우) */}
                    {capsule.sharedUsers &&
                      capsule.sharedUsers.filter(
                        user => user.nickname !== capsule.author?.nickname
                      ).length > 0 && (() => {
                        const filteredSharedUsers = capsule.sharedUsers.filter(
                          user => user.nickname !== capsule.author?.nickname
                        );
                        return (
                          <View style={styles.nowModalSection}>
                            <Text style={styles.nowSectionTitle}>함께한 친구</Text>
                            <View style={styles.nowSharedUserRow}>
                              {filteredSharedUsers.map((user, idx) => (
                                <View key={user.userId ?? idx} style={styles.nowSharedUserCell}>
                                  <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                                    <Text
                                      style={styles.nowSharedUserName}
                                      numberOfLines={1}
                                      ellipsizeMode="tail"
                                    >
                                      {user.nickname}
                                    </Text>
                                  </ScrollView>
                                </View>
                              ))}
                            </View>
                          </View>
                        );
                      })()}
                    {/* 공유 영역과 작성일 사이 구분선 (공유 영역이 있을 경우) */}
                    {capsule.sharedUsers &&
                      capsule.sharedUsers.filter(
                        user => user.nickname !== capsule.author?.nickname
                      ).length > 0 && (
                        <View style={styles.nowModalDivider} />
                      )}
                    {/* 작성일 */}
                    <View style={styles.nowModalSection}>
                      <Text style={styles.nowModalSectionSubtitle}>
                        작성일: {(() => {
                          const createdDate = new Date(capsule.createdAt);
                          const year = createdDate.getFullYear();
                          const month = createdDate.getMonth() + 1;
                          const day = createdDate.getDate();
                          let hours = createdDate.getHours();
                          const minutes = createdDate.getMinutes().toString().padStart(2, '0');
                          const ampm = hours >= 12 ? 'PM' : 'AM';
                          hours = hours % 12;
                          if (hours === 0) hours = 12;
                          return `${year}년 ${month}월 ${day}일 ${ampm} ${hours}:${minutes}`;
                        })()}
                      </Text>
                    </View>
                  </ScrollView>
                  {/* 하단 고정 영역 (닫기 버튼) */}
                  <View style={styles.nowBottomFixedContainer}>
                    <TouchableOpacity
                      style={styles.nowModalButtonClose}
                      onPress={() => {
                        const newVisibles = [...visibleCollectModals];
                        newVisibles[index] = false;
                        setVisibleCollectModals(newVisibles);
                      }}
                    >
                      <Text style={styles.nowModalButtonCloseText}>닫기</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </Modal>
        )
      ))}


    </View>
  );
};

const styles = StyleSheet.create({
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  topContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 60,
    alignItems: 'flex-start',
    zIndex: 2,
  },
  
  searchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  searchInput: {
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  roundButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#87A7C0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  roundButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  travelTimeText: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  timeCapsuleButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#87A7C0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeCapsuleButtonText: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 1. 모달 컨텐츠의 가로는 90%, 세로는 90% 고정
  modalContainer: {
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  // 2. 모달 헤더: 참고 코드 사용
  modalHeader: {
    backgroundColor: '#87A7C0',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    height: '10%',
  },
  // 3. 모달 헤더의 텍스트: 참고 코드 사용
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  // 7. 헤더 아래 영역: padding 20 적용, 닫기 버튼과 스크롤 뷰 영역을 포함
  modalInnerContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  // 스크롤 뷰의 내부 컨텐츠 스타일 (하단 여백 추가)
  modalScrollContent: {
    paddingBottom: 20,
  },
  // 각 섹션(제목, 내용, 공개일) 간의 여백
  modalSection: {
    marginBottom: 15,
  },
  // 제목 영역 스타일
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  // 내용 영역 스타일
  modalSectionContent: {
    fontSize: 16,
    color: '#000',
  },
  // 공개일 영역 스타일
  modalSectionSubtitle: {
    fontSize: 16,
    color: '#000',
  },
  // 8. 내용 영역과 공개일 영역 사이의 가로줄
  modalDivider: {
    height: 1,
    backgroundColor: '#dbdbdb',
    marginVertical: 15,
  },
  content: {
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingVertical: 10,
  },
  listItem: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
    backgroundColor: 'transparent',
    marginBottom: 15,
  },
  listItemTextContainer: {
    flexDirection: 'column',
  },
  listItemTitle: {
    color: 'black',
    fontSize: 18,
  },
  listItemSubtitle: {
    color: 'gray',
    fontSize: 14,
    marginTop: 5,
  },
  // 6. 닫기 버튼: 모달 영역 아래에 고정
  modalButtonClose: {
    backgroundColor: '#87A7C0',
    paddingVertical: 15,
    alignItems: 'center',
    width: '100%',
  },
  modalButtonCloseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nowModalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nowModalContainer: {
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  nowModalHeader: {
    backgroundColor: '#87A7C0',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    height: 80,
  },
  nowModalTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  nowModalInnerContainer: {
    flex: 1,
    padding: 20,
  },
  nowModalContentScroll: {
    flex: 1,
  },
  nowModalScrollContent: {
    paddingBottom: 20,
  },
  nowModalSection: {
    marginBottom: 25,
  },
  nowModalSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    textAlign: 'center',
  },
  nowModalSectionSubtitle: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center', // 중앙 정렬
  },
  nowModalSectionContent: {
    fontSize: 16,
    color: '#000',
  },
  nowSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    textAlign: 'center',
  },
  nowSharedUserRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  nowSharedUserCell: {
    width: '48%',
    paddingHorizontal: 5,
  },
  nowSharedUserName: {
    fontSize: 14,
    color: '#333',
  },
  nowModalMediaScroll: {
    marginTop: 5,
  },
  nowModalMediaImage: {
    width: 80,
    height: 80,
    marginRight: 5,
  },
  nowModalDivider: {
    height: 1,
    backgroundColor: '#dbdbdb',
    marginVertical: 5,
  },
  nowBottomFixedContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  nowModalButtonClose: {
    backgroundColor: '#87A7C0',
    borderColor: '#87A7C0',
    borderWidth: 1,
    borderRadius: 10,
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nowModalButtonCloseText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default Map;

