import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TimeCapsuleMapMarkers = ({ region, onMarkersUpdate }) => {
  const [token, setToken] = useState(null);

  // 토큰을 AsyncStorage에서 불러오기
  useEffect(() => {
    const getToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('AUTH_TOKEN');
        if (storedToken) {
          setToken(`Bearer ${storedToken}`);
          console.log('토큰 가져오기 성공:', storedToken);
        } else {
          console.warn('저장된 토큰이 없습니다');
        }
      } catch (error) {
        console.error('토큰 가져오기 실패:', error);
      }
    };
    getToken();
  }, []);

  useEffect(() => {
    const fetchCapsules = async () => {
      if (!region || !token) {
        onMarkersUpdate([]);
        return;
      }

      const left = region.longitude - region.longitudeDelta / 2;
      const right = region.longitude + region.longitudeDelta / 2;
      const up = region.latitude + region.latitudeDelta / 2;
      const down = region.latitude - region.latitudeDelta / 2;
      const queryString = `?left=${left}&right=${right}&up=${up}&down=${down}`;
      const base_url = 'https://i12e207.p.ssafy.io';

      try {
        const response = await axios.get(`${base_url}/time-capsules/map${queryString}`, {
          headers: { Authorization: token },
        });
        // 서버에서 SUCCESS 또는 NO_DATA 응답을 받으면
        if (response.data && (response.data.code === 'SUCCESS' || response.data.code === 'NO_DATA')) {
          const capsules = response.data.capsules || [];
          // 열린(수거가 끝난) 캡슐은 지도에 나타나지 않도록 필터링
          // API의 필드명은 "opendedAt"임 (주의!)
          const nowTimestamp = Date.now();
          const filteredCapsules = capsules.filter(
            (capsule) => new Date(capsule.openDate).getTime() > nowTimestamp
          );
          onMarkersUpdate(filteredCapsules.map(capsule => ({ ...capsule })));
        } else {
          console.error('API 응답 오류:', response.data);
          onMarkersUpdate([]); // 빈 배열 업데이트
        }
      } catch (error) {
        console.error('Error fetching time capsules:', error);
        onMarkersUpdate([]);
      }
    };

    fetchCapsules();
  }, [region, token, onMarkersUpdate]);

  return null;
};

export default TimeCapsuleMapMarkers;
