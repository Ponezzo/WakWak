import React, { useState, useEffect } from 'react';
import { View, Modal, Image, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import Video from 'react-native-video';

const texts = [
  '',
  '당신의 기록을 간직하고 싶어요.',
  '시간을 기억하는 오리,',
  '소중한 순간을 남겨보세요.',
  '추억을 저장하는 앱,',
  '함께 시작해볼까요?'
];

export default function Login({ setIsLoggedIn }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [loginUrl, setLoginUrl] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [showButtons, setShowButtons] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const textFadeAnim = useState(new Animated.Value(0))[0];
  const [videoPath, setVideoPath] = useState(null);

  useEffect(() => {
    const videoUri = `file:///android_asset/videos/ground1.mp4`;
    setVideoPath(videoUri);
  }, []);

  useEffect(() => {
    Animated.timing(textFadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [textIndex]);

  useEffect(() => {
    if (showButtons) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [showButtons]);

  const handleScreenPress = () => {
    Animated.timing(textFadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      if (textIndex < texts.length - 1) {
        setTextIndex(textIndex + 1);
        Animated.timing(textFadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } else {
        setShowButtons(true);
      }
    });
  };

  const handleLogin = (platform) => {
    let url;
    if (platform === 'kakao') {
      url = 'https://i12e207.p.ssafy.io/api/members/oauth2/kakao';
    } else if (platform === 'naver') {
      url = 'https://i12e207.p.ssafy.io/api/members/oauth2/naver';
    }
    setLoginUrl(url);
    setModalVisible(true);
  };

  const getTokenFromUrl = (url) => {
    try {
      const queryString = url.split('?')[1];
      if (!queryString) return null;

      const params = {};
      queryString.split('&').forEach(param => {
        const [key, value] = param.split('=');
        params[key] = decodeURIComponent(value);
      });

      return params.token;
    } catch (error) {
      console.error('URL 파싱 에러:', error);
      return null;
    }
  };

  const handleWebViewNavigationStateChange = async (event) => {
    if (event.url.includes('auth/oauth-response')) {
      console.log('로그인 완료 URL:', event.url);
      
      try {
        const token = getTokenFromUrl(event.url);
        
        if (token) {
          await AsyncStorage.setItem('AUTH_TOKEN', token);
          console.log('토큰 저장 완료:', token);
          setIsLoggedIn(true);
        } else {
          console.error('토큰이 없습니다.');
        }
      } catch (error) {
        console.error('토큰 저장 실패:', error);
      }

      setModalVisible(false);
    }
  };

  return (
    <View style={styles.container} onTouchStart={handleScreenPress}>
      {videoPath && (
        <Video
          source={{ uri: videoPath }}
          style={styles.backgroundVideo}
          resizeMode="cover"
          repeat
          muted
        />
      )}
      <Text style={styles.appName}>WakWak</Text>
      <Animated.Text style={[styles.appDescription, { opacity: textFadeAnim }]}>{texts[textIndex]}</Animated.Text>
      {showButtons && (
        <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
          <TouchableOpacity onPress={() => handleLogin('kakao')} style={styles.loginButton}>
            <Image source={require('../../assets/images/Kakao_Logo_Black.png')} style={styles.loginIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleLogin('naver')} style={styles.loginButton}>
            <Image source={require('../../assets/images/Naver_Logo_Black.png')} style={styles.loginIcon} />
          </TouchableOpacity>
        </Animated.View>
      )}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <WebView source={{ uri: loginUrl }} onNavigationStateChange={handleWebViewNavigationStateChange} startInLoadingState={true} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
  appName: {
    fontSize: 60,
    fontWeight: 'heavy',
    color: 'white',
    position: 'absolute',
    top: '20%',
    fontFamily: 'font1',
  },
  appDescription: {
    fontSize: 24,
    color: 'white',
    position: 'absolute',
    bottom: '50%',
    paddingHorizontal: 20,
    textAlign: 'center',
    fontFamily: 'font1',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: '20%',
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginButton: {
    marginHorizontal: 10,
  },
  loginIcon: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
});