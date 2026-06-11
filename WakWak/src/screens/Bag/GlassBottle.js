import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Dimensions, 
  ScrollView, 
  Modal,
  Alert
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  useAnimatedGestureHandler
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Swiper from 'react-native-swiper';

const screenWidth = Dimensions.get('window').width;
const { width } = Dimensions.get('window');

const DEFAULT_IMAGE = require('../../../assets/images/bottle_color.png');
const ITEMS_PER_PAGE = 9;
const BASE_URL = 'https://i12e207.p.ssafy.io';

const GlassBottle = () => {
  const [bottles, setBottles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBottle, setSelectedBottle] = useState(null);
  const scrollViewRef = useRef(null);
  // 댓글 입력창 관련 상태는 제거 – 삭제 기능만 사용합니다.
  const [bottleComments, setBottleComments] = useState([]);
  const translateX = useSharedValue(0);

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
      const totalSlides = (selectedBottle?.mediaUrls?.length || 0) + (selectedBottle?.content ? 1 : 0);
      const maxTranslate = -width * (totalSlides - 1);
      
      const isLastSlide = Math.abs(translateX.value) >= -maxTranslate;
      
      if (isLastSlide && event.translationX < 0) {
        return;
      }
  
      const newValue = context.startX + event.translationX;
      translateX.value = Math.max(Math.min(newValue, 0), maxTranslate);
    },
    onEnd: (event) => {
      const totalSlides = (selectedBottle?.mediaUrls?.length || 0) + (selectedBottle?.content ? 1 : 0);
      if (event.velocityX < -500 || (event.translationX < -50 && event.velocityX < 0)) {
        translateX.value = withSpring(Math.max(-width * (totalSlides - 1), translateX.value - width));
      } else if (event.velocityX > 500 || (event.translationX > 50 && event.velocityX > 0)) {
        translateX.value = withSpring(Math.min(0, translateX.value + width));
      } else {
        const currentIndex = Math.round(-translateX.value / width);
        translateX.value = withSpring(-width * currentIndex);
      }
    },
  });
  
  const getStoredToken = async () => {
    try {
      const token = await AsyncStorage.getItem('AUTH_TOKEN');
      if (token) {
        setAuthToken(`Bearer ${token}`);
      } else {
        console.warn('No auth token found in storage');
      }
    } catch (error) {
      console.error('Error retrieving auth token:', error);
    }
  };

  useEffect(() => {
    getStoredToken();
  }, []);

  const fetchBottles = async () => {
    try {
      if (!authToken) {
        await getStoredToken();
      }

      const response = await axios.get(`${BASE_URL}/bottle/list`, {
        headers: { Authorization: authToken },
      });

      if (response.data.code === "SUCCESS") {
        console.log('유리병 조회 성공:', response.data);
        setBottles(response.data.data);
        setErrorMessage(null);
      } else if (response.data.code === "NO_BOTTLE_AVAILABLE") {
        console.log('24시간이 지난 유리병 없음');
        setBottles([]);
        setErrorMessage(null);
      }
    } catch (error) {
      console.error('유리병 조회 오류:', error);
      if (error.response?.status === 401) {
        if (error.response.data.code === "AUTH_REQUIRED") {
          setErrorMessage("인증이 필요합니다. 다시 로그인해주세요.");
        } else if (error.response.data.code === "INVALID_TOKEN") {
          setErrorMessage("인증이 만료되었습니다. 다시 로그인해주세요.");
        }
      } else if (error.response?.status === 500) {
        setErrorMessage("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      } else {
        setErrorMessage("유리병 정보를 가져오는 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchBottles();
    }
  }, [authToken]);

  const handleDeleteBottle = async (bottleId) => {
    Alert.alert(
      "유리병 삭제",
      "정말로 이 유리병을 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await axios.post(
                `${BASE_URL}/bottle/delete`,
                { bottleId },
                { headers: { Authorization: authToken } }
              );
              if (response.data && response.data.code === "SUCCESS") {
                setModalVisible(false);
                fetchBottles();
                Alert.alert("성공", "유리병이 삭제되었습니다.");
              } else {
                Alert.alert("오류", "유리병 삭제에 실패했습니다.");
              }
            } catch (error) {
              console.error('Error deleting bottle:', error);
              Alert.alert("오류", "유리병 삭제 중 오류가 발생했습니다.");
            }
          }
        }
      ]
    );
  };

  const handleBottlePress = async (bottleId) => {
    try {
      if (!authToken) {
        await getStoredToken();
      }
      console.log('Fetching bottle details:', bottleId);
      const response = await axios.get(
        `${BASE_URL}/bottle/detail`,
        {
          params: { bottleId },
          headers: { Authorization: authToken },
        }
      );
      
      console.log('Bottle API response:', response.data);
      
      if (response.data && response.data.code === "SUCCESS") {
        const bottleData = response.data.data;
        console.log('Setting bottle data:', bottleData);
        setSelectedBottle(bottleData);
        setModalVisible(true);
        fetchComments(bottleId);
      }
    } catch (error) {
      console.error('Error fetching bottle details:', error);
    }
  };

  const renderSlideContent = () => {
    console.log('Rendering slide content:', {
      bottle: selectedBottle,
      hasMedia: selectedBottle?.mediaUrls?.length > 0,
      content: selectedBottle?.content
    });
    
    if (!selectedBottle) return null;
    
    const slides = [];
    
    if (selectedBottle.mediaUrls && selectedBottle.mediaUrls.length > 0) {
      console.log('Adding media slides:', selectedBottle.mediaUrls);
      selectedBottle.mediaUrls.forEach((url, index) => {
        slides.push(
          <View key={`image-${index}`} style={[styles.slideContent, { width: width }]}>
            <Image
              source={{ uri: url }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        );
      });
    }
  
    if (selectedBottle.content) {
      console.log('Adding content slide:', selectedBottle.content);
      slides.push(
        <View key="content" style={[styles.slideContent, styles.contentSlide]}>
          <View style={styles.contentContainer}>
            <Text style={styles.content}>{selectedBottle.content}</Text>
          </View>
        </View>
      );
    }
  
    console.log('Total slides generated:', slides.length);
    return slides;
  };
  
  const fetchComments = async (bottleId) => {
    try {
      console.log('Fetching comments for bottle:', bottleId);
      const response = await axios.get(`${BASE_URL}/bottle/comments`, {
        params: { bottleId },
        headers: { Authorization: authToken }
      });
  
      console.log('Comments API response:', response.data);
  
      if (response.data.code === 'SUCCESS') {
        console.log('Comments data:', response.data.data);
        setBottleComments(response.data.data);
      }
    } catch (error) {
      console.error('댓글 가져오기 실패:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "날짜 정보가 없습니다!";
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: '2-digit', // '2-digit'으로 변경
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePageChange = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newPage = Math.round(offsetX / screenWidth);
    setCurrentPage(newPage);
  };

  // ================================
  // [추가] CommentsList 컴포넌트 – 기존의 계층 구조 댓글 렌더링 함수 (삭제 기능 포함)
  const CommentsList = ({ comments }) => {
    // 계층 구조 재구성 함수
    const organizeComments = (commentsData) => {
      if (!commentsData || !Array.isArray(commentsData)) return [];
      const validComments = commentsData.filter(comment => comment && comment.commentId);
      const commentMap = new Map();
      const rootComments = [];
  
      validComments.forEach(comment => {
        commentMap.set(comment.commentId, { ...comment, children: [] });
      });
  
      validComments.forEach(comment => {
        if (comment.parentId) {
          const parent = commentMap.get(comment.parentId);
          if (parent) {
            parent.children.push(commentMap.get(comment.commentId));
          }
        } else {
          rootComments.push(commentMap.get(comment.commentId));
        }
      });
  
      return rootComments;
    };
  
    // 기존의 계층 구조 댓글 렌더링 함수 (삭제 기능 포함)
    const renderCommentWithReplies = (comment, depth = 0) => {
      if (!comment || !comment.commentId) return null;
      
      return (
        <View key={`comment-${comment.commentId}-${depth}`}>
          <View style={[
            styles.commentBox,
            depth > 0 && {
              marginLeft: depth * 20,
              paddingLeft: 15,
              borderLeftWidth: 2,
              borderLeftColor: '#4A6FA5',
            },
            { position: 'relative' } // 댓글 박스를 relative로 설정하여 버튼의 절대 위치 지정 가능
          ]}>
            <View style={styles.commentHeader}>
              <View style={styles.userInfo}>
                {depth > 0 && <Text style={styles.replyIcon}>↳ </Text>}
                <Text style={styles.commentUser}>{comment.nickname || '익명'}</Text>
              </View>
              <Text style={styles.commentTime}>
            {formatDate(comment.createdAt)}
          </Text>
        </View>
        <Text style={styles.commentContent}>{comment.content}</Text>
        {!comment.isDeleted && (
          <TouchableOpacity 
            style={styles.deleteButtonAbsolute} // 수정된 스타일 적용
            onPress={() => handleDeleteComment(comment.commentId)}
          >
            <Text style={styles.deleteButtonText}>삭제</Text>
          </TouchableOpacity>
        )}
      </View>
      {comment.children && comment.children.length > 0 && (
        <View>
          {comment.children.map(reply => renderCommentWithReplies(reply, depth + 1))}
        </View>
      )}
    </View>
  );
};

    const organizedComments = organizeComments(comments);
  
    return (
      <ScrollView style={styles.commentsList}>
        {organizedComments.map(comment => renderCommentWithReplies(comment, 0))}
      </ScrollView>
    );
  };
  // ================================

  // handleDeleteComment 함수 – 제공된 코드를 그대로 사용
  const handleDeleteComment = async (commentId) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/bottle/comments/delete`,
        {
          bottleId: selectedBottle.bottleId,
          commentId: commentId
        },
        { headers: { Authorization: authToken } }
      );
  
      if (response.data.code === 'SUCCESS') {
        // 댓글 삭제 후 댓글 목록 새로고침
        await fetchComments(selectedBottle.bottleId);
      }
    } catch (error) {
      if (error.response?.status === 403) {
        Alert.alert('오류', '유리병 작성자만 댓글을 삭제할 수 있습니다.');
      } else {
        Alert.alert('오류', '댓글 삭제에 실패했습니다.');
      }
      console.error('댓글 삭제 실패:', error);
    }
  };

  // 수정된 모달 렌더링 – 모달 내 댓글 영역은 CommentsList 컴포넌트를 사용
  const renderModal = () => {
    if (!modalVisible) return null;
  
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            {selectedBottle ? (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalHeaderTitle}>
                    {selectedBottle.title || "제목이 없습니다!"}
                  </Text>
                </View>
                
                <View style={styles.modalInnerContainer}>
                  <ScrollView style={styles.modalContentScroll}>
                    {/* 슬라이드 영역 */}
                    <View style={styles.sliderWrapper}>
                      <PanGestureHandler onGestureEvent={gestureHandler}>
                        <Animated.View style={[styles.imageContainer, animatedStyle]}>
                          {renderSlideContent()}
                        </Animated.View>
                      </PanGestureHandler>
                    </View>
        
                    {/* 좋아요 영역 */}
                    <View style={styles.likeCountContainer}>
                      <Text style={styles.likeTitle}>좋아요 {selectedBottle.likeCount || 0}개</Text>
                    </View>
        
                    {/* 댓글 영역 – CommentsList 컴포넌트 사용 */}
                    <View style={styles.commentsContainer}>
                      <Text style={styles.commentsTitle}>댓글</Text>
                      <CommentsList comments={bottleComments} />
                    </View>
                  </ScrollView>
        
                  {/* 하단 버튼 영역 */}
                  <View style={styles.modalFooter}>
                    <Text style={styles.dateInfo}>
                      작성일: {formatDate(selectedBottle.createdAt)}
                    </Text>
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                        style={styles.modalButtonEqui}
                        onPress={() => handleDeleteBottle(selectedBottle.bottleId)}
                      >
                        <Text style={styles.modalButtonEquiText}>삭제</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.modalButtonClose}
                        onPress={() => setModalVisible(false)}
                      >
                        <Text style={styles.modalButtonCloseText}>닫기</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </>
            ) : (
              <View style={[styles.modalInnerContainer, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text>로딩 중...</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  const renderPage = (pageIndex) => {
    const startIndex = pageIndex * ITEMS_PER_PAGE;
    const pageItems = bottles.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    const rows = [];

    for (let i = 0; i < 3; i++) {
      const rowItems = pageItems.slice(i * 3, i * 3 + 3);
      const row = (
        <View key={`row-${i}`} style={styles.gridRow}>
          {rowItems.map((bottle, index) => (
            <View key={`cell-${index}`} style={styles.gridCell}>
              <TouchableOpacity 
                style={styles.bottle}
                onPress={() => handleBottlePress(bottle.bottleId)}
              >
                <Image source={DEFAULT_IMAGE} style={styles.bottleImage} />
                <Text style={styles.bottleTitle} numberOfLines={1}>
                  {bottle.title || "제목 없음"}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
          {[...Array(3 - rowItems.length)].map((_, index) => (
            <View key={`empty-${index}`} style={styles.gridCell}>
              <View style={styles.emptyCell} />
            </View>
          ))}
        </View>
      );
      rows.push(row);
    }

    return (
      <View key={`page-${pageIndex}`} style={styles.page}>
        {rows}
      </View>
    );
  };

  if (loading) {
    return <View style={styles.container} />;
  }

  const totalPages = Math.ceil(bottles.length / ITEMS_PER_PAGE);

  return (
    <View style={styles.container}>
      {errorMessage ? (
        <Text style={styles.errorMessage}>{errorMessage}</Text>
      ) : bottles.length === 0 ? (
        <Text style={styles.noDataText}>보관된 유리병이 없습니다.</Text>
      ) : (
        <>
          <Text style={styles.countText}>
            보관된 유리병: {bottles.length}개
          </Text>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handlePageChange}
            scrollEventThrottle={16}
            style={styles.scrollView}
          >
            {[...Array(totalPages)].map((_, index) => renderPage(index))}
          </ScrollView>
          {renderModal()}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  countText: {
    fontSize: 18,
    margin: 20,
    fontWeight: '600',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  page: {
    width: screenWidth,
    padding: 20,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  gridCell: {
    flex: 1,
    margin: 5,
  },
  bottle: {
    height: 180,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  emptyCell: {
    height: 180,
    backgroundColor: 'transparent',
  },
  bottleImage: {
    width: '100%',
    height: '70%',
    resizeMode: 'contain',
  },
  bottleTitle: {
    height: '25%',
    textAlign: 'center',
    padding: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  errorMessage: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '95%',
    height: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: '#87A7C0',
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  modalHeaderTitle: {
    fontSize: 23,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  modalInnerContainer: {
    flex: 1,
    padding: 20,
  },
  modalContentScroll: {
    flex: 1,
  },
  sliderWrapper: {
    height: '41%',
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  imageContainer: {
    flexDirection: 'row',
    width: width * 2,
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  slideContent: {
    width: width,
    height: '100%',
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  contentSlide: {
    padding: 15,
    alignItems: 'flex-start',
  },
  contentContainer: {
    width: '100%',
    minHeight: '100%',
    padding: 10,
  },
  content: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    padding: 15,
    width: '100%',
  },
  likeCountContainer: {
    padding: 15,
  },
  likeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentsContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  modalFooter: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  dateInfo: {
    fontSize: 14,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    width: '100%',
  },
  modalButtonEqui: {
    backgroundColor: '#ffffff',
    borderColor: '#d4d4d4',
    borderWidth: 1,
    borderRadius: 10,
    width: '47%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonEquiText: {
    color: 'black',
    fontSize: 15,
    fontWeight: 'bold',
  },
  modalButtonClose: {
    backgroundColor: '#87A7C0',
    borderColor: '#87A7C0',
    borderWidth: 1,
    borderRadius: 10,
    width: '47%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonCloseText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  // CommentsList 관련 스타일
  commentsList: {
    flex: 1,
    paddingHorizontal: 5,
  },
  commentBox: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyIcon: {
    fontSize: 14,
    color: '#4A6FA5',
    marginRight: 4,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A6FA5',
  },
  commentTime: {
    fontSize: 12,
    color: '#999',
    marginRight: 10,
  },
  deleteButton: {
    padding: 5,
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#ff6b6b',
    fontWeight: '500',
  },
  commentContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  deleteButtonAbsolute: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    padding: 5,
  },
});

export default GlassBottle;
