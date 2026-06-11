import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal,
  Image, 
  TouchableOpacity,
  ScrollView, 
  Dimensions,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Comments from './Comments';

const { width } = Dimensions.get('window');

const BottleDetailModal = ({ visible, onClose, bottleId }) => {
  const [bottle, setBottle] = useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [authToken, setAuthToken] = useState(null);
  const BASE_URL = 'https://i12e207.p.ssafy.io';


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

  useEffect(() => {
    if (visible && bottleId) {
      fetchBottleDetails();
    }
  }, [visible, bottleId]);

  const fetchBottleDetails = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${BASE_URL}/bottle/detail`, {
        params: { bottleId: bottleId },
        headers: { 'Authorization': authToken }
      });

      if (response.data.code === 'SUCCESS') {
        setBottle(response.data.data);
        setError(null);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
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
          errorMessage = '다시 로그인해주세요.';
          break;
        case 404:
          errorMessage = '존재하지 않는 유리병입니다.';
          break;
        case 500:
          errorMessage = '서버 오류가 발생했습니다.';
          break;
      }
    }
    setError(errorMessage);
  };

  const renderSlideContent = () => {
    const slides = [];
    
    if (bottle?.mediaUrls?.length > 0) {
      bottle.mediaUrls.forEach((url, index) => (
        slides.push(
          <View key={`image-${index}`} style={styles.slideContent}>
            <Image
              source={{ uri: url }}
              style={styles.image}
              resizeMode="contain"
            />
            {renderArrows(index, bottle.mediaUrls.length)}
          </View>
        )
      ));
    }

    if (bottle?.content) {
      const contentSlides = splitContent(bottle.content);
      contentSlides.forEach((content, index) => (
        slides.push(
          <View key={`content-${index}`} style={styles.slideContent}>
            <ScrollView style={styles.contentWrapper}>
              <Text style={styles.content}>{content}</Text>
            </ScrollView>
            {renderArrows(
              index + (bottle?.mediaUrls?.length || 0),
              contentSlides.length + (bottle?.mediaUrls?.length || 0)
            )}
          </View>
        )
      ));
    }

    return slides;
  };

  const renderArrows = (currentIndex, totalSlides) => (
    <>
      {currentIndex > 0 && (
        <TouchableOpacity 
          style={[styles.arrowButton, styles.leftArrow]}
          onPress={() => setCurrentSlideIndex(prev => prev - 1)}
        >
          <Text style={styles.arrowText}>←</Text>
        </TouchableOpacity>
      )}
      {currentIndex < totalSlides - 1 && (
        <TouchableOpacity 
          style={[styles.arrowButton, styles.rightArrow]}
          onPress={() => setCurrentSlideIndex(prev => prev + 1)}
        >
          <Text style={styles.arrowText}>→</Text>
        </TouchableOpacity>
      )}
    </>
  );

  const splitContent = (content) => {
    const maxLength = 300;
    const slides = [];
    let currentContent = content;

    while (currentContent.length > 0) {
      if (currentContent.length <= maxLength) {
        slides.push(currentContent);
        break;
      }

      let splitIndex = currentContent.lastIndexOf('\n', maxLength);
      if (splitIndex === -1) splitIndex = currentContent.lastIndexOf(' ', maxLength);
      if (splitIndex === -1) splitIndex = maxLength;

      slides.push(currentContent.substring(0, splitIndex));
      currentContent = currentContent.substring(splitIndex).trim();
    }

    return slides;
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#4A6FA5" />
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={fetchBottleDetails}
              >
                <Text style={styles.retryButtonText}>다시 시도</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.header}>
                <Text style={styles.headerTitle}>{bottle?.title}</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={onClose}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.sliderContainer}>
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / width);
                    setCurrentSlideIndex(index);
                  }}
                >
                  {renderSlideContent()}
                </ScrollView>
              </View>

              <View style={styles.likeContainer}>
                <Text style={styles.likeCount}>좋아요 {bottle?.likeCount || 0}개</Text>
                <Text style={styles.createdAt}>
                  {new Date(bottle?.createdAt).toLocaleString()}
                </Text>
              </View>

              <View style={styles.commentsContainer}>
                <Comments 
                  bottleId={bottleId}
                  comments={bottle?.comments || []}

                  // 댓글 작성 기능 빼야함
                  // onCommentAdded={(newComments) => {
                  //   setBottle(prev => ({
                  //     ...prev,
                  //     comments: newComments
                  //   }));
                  // }}
                />
              </View>
            </>
          )}
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
    width: '90%',
    height: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  sliderContainer: {
    height: '40%',
  },
  slideContent: {
    width: width * 0.9,
    height: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  contentWrapper: {
    padding: 20,
  },
  content: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  arrowButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 10,
  },
  leftArrow: { left: 10 },
  rightArrow: { right: 10 },
  arrowText: {
    fontSize: 20,
    color: '#666',
  },
  likeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  likeCount: {
    fontSize: 14,
    color: '#666',
  },
  createdAt: {
    fontSize: 12,
    color: '#999',
  },
  commentsContainer: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4A6FA5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  }
});

export default BottleDetailModal;
