import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity,
  ScrollView, 
  Dimensions, 
  TextInput, 
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import Animated, { 
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  useAnimatedGestureHandler
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Comments from '../components/Comments';

const { width } = Dimensions.get('window');

const Getbottle = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [bottle, setBottle] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [comments, setComments] = useState([]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const translateX = useSharedValue(0);

  const [authToken, setAuthToken] = useState(null);
  const BASE_URL = 'https://i12e207.p.ssafy.io';


  useEffect(() => {
    const getStoredToken = async () => {
      try {
        const token = await AsyncStorage.getItem('AUTH_TOKEN');
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
    
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (authToken) {
      console.log('토큰 설정됨, 유리병 가져오기 시작');
      fetchRandomBottle();
    }
  }, [authToken]);

  const checkLikeStatus = async (bottleId) => {
    if (!authToken || !bottleId) {
      console.log('토큰 또는 병 ID가 없어 좋아요 상태를 확인할 수 없습니다');
      return;
    }
    
    try {
      console.log('좋아요 상태 확인 시작 - 병 ID:', bottleId);
      const response = await axios.get(
        `${BASE_URL}/bottle/like/status`,
        {
          params: { bottleId },
          headers: {
            'Authorization': authToken
          }
        }
      );
  
      console.log('좋아요 상태 응답:', response.data);
      if (response.data.code === 'SUCCESS') {
        const likedStatus = response.data.data.status === 'LIKED';
        setIsLiked(likedStatus);
        console.log('좋아요 상태 설정 완료:', likedStatus);
      }
    } catch (error) {
      console.error('좋아요 상태 확인 실패:', error);
    }
  };

  const fetchRandomBottle = async () => {
    try {
      console.log('랜덤 유리병 가져오기 시작');
      setIsLoading(true);  // 로딩 시작
      
      const response = await axios.get(`${BASE_URL}/bottle/random`, {
        headers: {
          'Authorization': authToken
        }
      });
  
      console.log('서버 응답:', response.data);
      
      if (response.data.code === 'SUCCESS') {
        console.log('유리병 ID 받음:', response.data.data.bottleId);
        const bottleId = response.data.data.bottleId;
        await fetchBottleDetails(bottleId);
      }
    } catch (error) {
      console.error('유리병 가져오기 실패:', error);
      Alert.alert('오류', '유리병을 가져오는데 실패했습니다.');
    } finally {
      setIsLoading(false);  // 로딩 종료
      console.log('로딩 상태 해제');
    }
  };

  const fetchBottleDetails = async (bottleId) => {
    try {
        console.log('유리병 상세 정보 조회 시작 - ID:', bottleId);

        const response = await axios.get(`${BASE_URL}/bottle/detail`, {
            params: { bottleId },
            headers: {
                'Authorization': authToken
            }
        });

        console.log('유리병 상세 정보 응답:', response.data);

        if (response.data.code === 'SUCCESS') {
            console.log('유리병 상세 정보 가져오기 성공');
            const bottleData = response.data.data;
            console.log('받은 병 데이터:', bottleData);

            setBottle({
                id: bottleId,
                title: bottleData.title,
                content: bottleData.content,
                createdAt: bottleData.createdAt,
                mediaUrls: bottleData.mediaUrls,
                likeCount: bottleData.likeCount,
                comments: [] // 초기에는 빈 배열로 설정
            });

            // 댓글 데이터 가져오기
            fetchComments(bottleId);

            await checkLikeStatus(bottleId);
        }
    } catch (error) {
        console.error('유리병 상세 정보 조회 실패:', error);
        console.error('에러 응답:', error.response?.data);
        Alert.alert('오류', '유리병 상세 정보를 가져오는데 실패했습니다.');
    }
};

const fetchComments = async (bottleId) => {
    try {
        console.log('댓글 데이터 가져오기 시작 - ID:', bottleId);

        const response = await axios.get(`${BASE_URL}/bottle/comments`, { // API 엔드포인트 확인
            params: { bottleId },
            headers: {
                'Authorization': authToken
            }
        });

        console.log('댓글 데이터 응답:', response.data);

        if (response.data.code === 'SUCCESS') {
            const commentsData = response.data.data; // 댓글 데이터 속성 확인
            console.log('받은 댓글 데이터:', commentsData);

            setComments(commentsData); // 댓글 상태 업데이트
        }
    } catch (error) {
        console.error('댓글 데이터 가져오기 실패:', error);
        console.error('에러 응답:', error.response?.data);
        Alert.alert('오류', '댓글 데이터를 가져오는데 실패했습니다.');
    }
};
  
  const handleError = (error) => {
    let errorMessage = '유리병을 가져오는데 실패했어요.';
    
    if (error.response) {
      switch (error.response.status) {
        case 400:
          errorMessage = '유리병 ID가 필요합니다.';
          break;
        case 401:
          if (error.response.data.code === 'AUTH_REQUIRED') {
            errorMessage = '로그인이 필요합니다.';
          } else if (error.response.data.code === 'INVALID_TOKEN') {
            errorMessage = '다시 로그인해주세요.';
          }
          navigation.navigate('Login');
          break;
        case 404:
          errorMessage = '존재하지 않는 유리병입니다.';
          break;
        case 500:
          errorMessage = '서버 오류가 발생했습니다.';
          break;
      }
    }
    
    Alert.alert('오류', errorMessage, [
      { text: '확인', onPress: () => navigation.goBack() }
    ]);
  };

  const renderSlideContent = () => {
    const slides = [];
    
    // 이미지 슬라이드를 먼저 추가
    if (bottle.mediaUrls && bottle.mediaUrls.length > 0) {
      bottle.mediaUrls.forEach((url, index) => {
        slides.push(
          <View key={`image-${index}`} style={styles.slideContent}>
            <Image
              source={{ uri: url }}
              style={styles.image}
              resizeMode="contain"
            />
            {index < bottle.mediaUrls.length - 1 && (
              <TouchableOpacity 
                style={[styles.arrowButton, styles.rightArrow]} 
                onPress={slideRight}
              >
                <Image
                  source={require('../../assets/images/arrow_right.png')}
                  style={styles.arrowIcon}
                />
              </TouchableOpacity>
            )}
            {index > 0 && (
              <TouchableOpacity 
                style={[styles.arrowButton, styles.leftArrow]} 
                onPress={slideLeft}
              >
                <Image
                  source={require('../../assets/images/arrow_left.png')}
                  style={styles.arrowIcon}
                />
              </TouchableOpacity>
            )}
          </View>
        );
      });
    }
  
    // 컨텐츠 슬라이드에 스크롤 기능 추가
    if (bottle.content) {
      slides.push(
        <View key="content" style={styles.slideContent}>
          <ScrollView 
            style={styles.contentScrollView}
            showsVerticalScrollIndicator={true}
            scrollEventThrottle={16}
            nestedScrollEnabled={true}
            contentContainerStyle={styles.contentContainer}
            onTouchStart={(e) => {
              // 터치 이벤트를 ScrollView에서 처리하도록 함
              e.stopPropagation();
            }}
          >
            <Text style={styles.content}>{bottle.content}</Text>
          </ScrollView>
        </View>
      );
    }
    return slides;
  };
  

  const handleCommentAdded = (newComment) => {
    console.log('GetBottle: 새 댓글 추가 시작');
    console.log('GetBottle: 새 댓글 데이터:', newComment);
  
    setComments(prevComments => {
      const updatedComments = [...prevComments, newComment];
      console.log('GetBottle: 업데이트된 댓글 목록:', updatedComments);
      return updatedComments;
    });
  
    setBottle(prevBottle => {
      if (!prevBottle) {
        console.log('GetBottle: 이전 병 데이터가 없습니다');
        return prevBottle;
      }
  
      const updatedBottle = {
        ...prevBottle,
        comments: [...prevBottle.comments, newComment]
      };
  
      console.log('GetBottle: 업데이트된 병 데이터:', updatedBottle);
      return updatedBottle;
    });
  };

  const handleLikeBottle = async () => {
    try {
      if (isLiked) {
        const response = await axios.post(
          `${BASE_URL}/bottle/like/delete`,
          { bottleId: bottle.id },
          {
            headers: {
              'Authorization': authToken,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.code === 'SUCCESS') {
          setIsLiked(false);
          setBottle(prevBottle => ({
            ...prevBottle,
            likeCount: Math.max(0, prevBottle.likeCount - 1)
          }));
        }
      } else {
        const response = await axios.post(
          `${BASE_URL}/bottle/like`,
          { bottleId: bottle.id },
          {
            headers: {
              'Authorization': authToken,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.code === 'SUCCESS') {
          setIsLiked(true);
          setBottle(prevBottle => ({
            ...prevBottle,
            likeCount: prevBottle.likeCount + 1
          }));
        }
      }
    } catch (error) {
      handleLikeError(error);
    }
  };
  
  const handleUnlikeBottle = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/bottle/like/delete`,
        {
          bottleId: bottle.id
        },
        {
          headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.data.code === 'SUCCESS') {
        setIsLiked(false);
        setBottle(prevBottle => ({
          ...prevBottle,
          likeCount: Math.max(0, prevBottle.likeCount - 1)
        }));
      }
    } catch (error) {
      handleLikeError(error);
    }
  };
  
  const handleLikeError = (error) => {
    let errorMessage = '좋아요 처리에 실패했어요.';
    
    if (error.response) {
      switch (error.response.status) {
        case 400:
          if (error.response.data.code === 'ALREADY_LIKED') {
            errorMessage = '이미 좋아요를 누른 유리병이에요.';
          } else if (error.response.data.code === 'NOT_LIKED') {
            errorMessage = '아직 좋아요를 누르지 않은 유리병이에요.';
          } else if (error.response.data.code === 'MISSING_BOTTLE_ID') {
            errorMessage = '유리병 ID가 필요합니다.';
          }
          break;
        case 401:
          if (error.response.data.code === 'AUTH_REQUIRED') {
            errorMessage = '로그인이 필요합니다.';
          } else if (error.response.data.code === 'INVALID_TOKEN') {
            errorMessage = '다시 로그인해주세요.';
          }
          navigation.navigate('Login');
          break;
        case 404:
          errorMessage = '존재하지 않는 유리병입니다.';
          break;
        case 500:
          errorMessage = '서버 오류가 발생했습니다.';
          break;
      }
    }
    Alert.alert('오류', errorMessage);
  };

  const slideLeft = () => {
    translateX.value = withSpring(0);
  };

  const slideRight = () => {
    translateX.value = withSpring(-width);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      const newValue = context.startX + event.translationX;
      translateX.value = Math.max(Math.min(newValue, 0), -width);
    },
    onEnd: (event) => {
      if (event.velocityX < -500 || (event.translationX < -50 && event.velocityX < 0)) {
        translateX.value = withSpring(-width);
      } else if (event.velocityX > 500 || (event.translationX > 50 && event.velocityX > 0)) {
        translateX.value = withSpring(0);
      } else {
        translateX.value = withSpring(translateX.value < -width/2 ? -width : 0);
      }
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>유리병을 주워오고 있어요...</Text>
      </View>
    );
  }

  if (!bottle) {
    return null;
  } 

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{bottle.title}</Text>
      </View>
  
      <View style={styles.contentWrapper}>
        {!keyboardVisible && (
          <View style={styles.sliderWrapper}>
            <PanGestureHandler onGestureEvent={gestureHandler}>
              <Animated.View style={[styles.imageContainer, animatedStyle]}>
                {renderSlideContent()}
              </Animated.View>
            </PanGestureHandler>
          </View>
        )}
  
        <View style={styles.likeCountContainer}>
          <TouchableOpacity 
            style={styles.likeButton}
            onPress={handleLikeBottle}
          >
            <Image
              source={isLiked ? 
                require('../../assets/images/heart_filled.png') : 
                require('../../assets/images/heart.png')
              }
              style={styles.heartIcon}
            />
          </TouchableOpacity>
          <Text style={styles.likeCount}>좋아요 {bottle.likeCount}개</Text>
        </View>
  
        <Comments
          bottleId={bottle.id}
          comments={comments} // 댓글 데이터
          onCommentAdded={handleCommentAdded}
          style={styles.commentsSection}
      />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 56,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 15,
  },
  sliderWrapper: {
    height: '41%', // 슬라이더 영역 높이 조정
    marginBottom: 10,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 10,
    paddingRight: 20,
  },
  imageContainer: {
    flexDirection: 'row',
    width: width * 2,
    height: '100%',
  },
  slideContent: {
    width: width,
    height: '100%',
    position: 'relative',
    backgroundColor: '#fff',
    overflow: 'hidden', // 추가
  },
  contentScrollView: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
    maxHeight: '100%', // 추가
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  arrowButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
  },
  leftArrow: {
    left: 5,
  },
  rightArrow: {
    right: 5,
  },
  arrowIcon: {
    width: 15,
    height: 15,
    tintColor: '#666',
  },
  content: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    padding: 15,
    flexGrow: 1, // 추가
  },
  commentsSection: {
    flex: 1,
    marginTop: 10,
  },
  commentsScrollView: {
    flex: 1,
  },
  commentsContainer: {
    padding: 15,
  },
  username: {
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 14,
    color: '#333',
  },
  message: {
    fontSize: 14,
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    fontSize: 14,
  },
  sendButton: {
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  sendButtonText: {
    color: '#4A6FA5',
    fontWeight: 'bold',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    padding: 5,
  },
  heartIcon: {
    width: 24,
    height: 24,
    marginRight: 5,
  },
  likeCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  likeCount: {
    fontSize: 14,
    color: '#666',
  },
  commentBox: {
    backgroundColor: '#f8f9fa',
    padding: 5,
    borderRadius: 8,
    marginBottom: 12,
  },
  replyBox: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    marginLeft: 40,
    borderLeftWidth: 2,
    borderLeftColor: '#4A6FA5',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A6FA5',
  },
  commentTime: {
    fontSize: 12,
    color: '#999',
  },
  commentContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  replyButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  replyButtonText: {
    fontSize: 12,
    color: '#666',
  },
  replyingTo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#f0f2f5',
    marginBottom: 8,
    borderRadius: 4,
  },
  replyingToContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    backgroundColor: '#f0f2f5',
    borderRadius: 4,
    marginBottom: 8,
  },
  replyingToText: {
    fontSize: 12,
    color: '#666',
  },
  cancelReply: {
    fontSize: 12,
    color: '#4A6FA5',
    fontWeight: '500',
  },
  cancelReplyText: {
    fontSize: 12,
    color: '#4A6FA5',
    fontWeight: '500',
  }
});

export default Getbottle;
