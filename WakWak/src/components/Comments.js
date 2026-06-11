import React, { useRef, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
  Keyboard
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Comments = ({ bottleId, comments: initialComments, onCommentAdded }) => {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(initialComments || []); // 초기값 설정
  const inputRef = useRef(null);
  const [userProfile, setUserProfile] = useState(null);

  const [authToken, setAuthToken] = useState(null);
  const BASE_URL = 'https://i12e207.p.ssafy.io';


  
  // 토큰 관리 추가
  useEffect(() => {
    const getStoredToken = async () => {
      try {
        const token = await AsyncStorage.getItem('AUTH_TOKEN');
        if (token) {
          setAuthToken(`Bearer ${token}`);
          console.log('Comments: 토큰 가져오기 성공:', token);
        } else {
          console.warn('Comments: 저장된 토큰이 없습니다');
        }
      } catch (error) {
        console.error('Comments: 토큰 가져오기 실패:', error);
      }
    };
    getStoredToken();
  }, []);

  // 프로필 정보 가져오기
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/tmp`, {
        headers: {
          'Authorization': authToken
        }
      });
      
      if (response.data.code === 'SUCCESS') {
        setUserProfile(response.data.data);
        console.log('현재 사용자 프로필:', response.data.data);
      }
    } catch (error) {
      console.error('프로필 정보 가져오기 실패:', error);
    }
  };

  // 컴포넌트 마운트 시 프로필 정보 가져오기
  useEffect(() => {
    if (authToken) {
      fetchUserProfile();
    }
  }, [authToken]);


  useEffect(() => {
    console.log('Comments 컴포넌트 마운트 또는 업데이트');
    console.log('받은 댓글 데이터:', initialComments);
    setComments(initialComments || []); // initialComments가 undefined일 경우 빈 배열 사용
  }, [initialComments]);

  const organizeComments = (commentsData) => {
    console.log('댓글 구조화 시작');
    console.log('구조화할 댓글 데이터:', commentsData);

    if (!commentsData || !Array.isArray(commentsData) || commentsData.length === 0) {
        console.log('유효한 댓글 데이터 없음 - 빈 배열 반환');
        return [];
    }

    try {
        // 유효한 댓글 데이터만 필터링
        const validComments = commentsData.filter(comment =>
            comment &&
            typeof comment === 'object' &&
            'commentId' in comment
        );

        console.log('필터링된 유효한 댓글 수:', validComments.length);

        const commentMap = new Map();
        const rootComments = [];

        // 댓글 Map 구성
        validComments.forEach(comment => {
            console.log('처리 중인 댓글 ID:', comment.commentId);
            commentMap.set(comment.commentId, {
                ...comment,
                children: []
            });
        });

        // 계층 구조 구성
        validComments.forEach(comment => {
            if (comment.parentId) {
                console.log('대댓글 처리:', comment.commentId, '-> 부모:', comment.parentId);
                const parentComment = commentMap.get(comment.parentId);
                if (parentComment) {
                    parentComment.children.push(commentMap.get(comment.commentId));
                }
            } else {
                console.log('최상위 댓글 추가:', comment.commentId);
                rootComments.push(commentMap.get(comment.commentId));
            }
        });

        console.log('구조화 완료 - 최상위 댓글 수:', rootComments.length);
        return rootComments;
    } catch (error) {
        console.error('댓글 구조화 중 오류 발생:', error);
        return [];
    }
};

  // 댓글 렌더링 함수 수정
  const renderCommentWithReplies = (comment, depth = 0) => {
    if (!comment || !comment.commentId) return null;
    
    return (
      <View key={`comment-${comment.commentId}-${depth}`}>
        <View style={[
          styles.commentBox,
          depth > 0 && styles.replyBox,
          { marginLeft: depth * 21 }
        ]}>
          <View style={styles.commentHeader}>
            <Text style={styles.username}>{comment.nickname || 'Anonymous'}</Text>
            <Text style={styles.commentTime}>
              {new Date(comment.createdAt).toLocaleString()}
            </Text>
          </View>
          <Text style={styles.commentContent}>{comment.content}</Text>
          {!comment.isDeleted && (
            <TouchableOpacity 
              style={styles.replyButton}
              onPress={() => handleReplyPress(comment.commentId)}
            >
              <Text style={styles.replyButtonText}>답글쓰기</Text>
            </TouchableOpacity>
          )}
        </View>
        {comment.children?.map((reply) => (
          <View key={`reply-${reply.commentId}`}>
            {renderCommentWithReplies(reply, depth + 1)}
          </View>
        ))}
      </View>
    );
  };
  

  const handleAddComment = async () => {
    if (!authToken) {
      console.log('토큰이 없어 댓글을 작성할 수 없습니다');
      Alert.alert('오류', '인증이 필요합니다.');
      return;
    }
  
    if (!newComment.trim()) return;
  
    try {
      // 댓글 작성 전에 최신 프로필 정보 가져오기
      await fetchUserProfile();
      
      const requestBody = {
        bottleId: bottleId,
        content: newComment.trim(),
        ...(replyTo && { parentId: replyTo })
      };
  
      console.log('댓글 작성 요청:', requestBody);
  
      const response = await axios.post(
        `${BASE_URL}/bottle/comments`,
        requestBody,
        {
          headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json'
          }
        }
      );
  
      console.log('서버 응답:', response.data);
  
      if (response.data.code === 'SUCCESS') {
        const newCommentData = {
          ...response.data.data,
          nickname: userProfile?.nickname || 'Anonymous'  // 현재 사용자의 닉네임 사용
        };
        
        console.log('새 댓글 데이터:', newCommentData);
        
        onCommentAdded(newCommentData);
        setComments(prevComments => [...prevComments, newCommentData]);
        setNewComment('');
        setReplyTo(null);
        Keyboard.dismiss();
      }
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      handleCommentError(error);
    }
  };
  

  const handleCommentError = (error) => {
    let errorMessage = '댓글 작성에 실패했어요.';
    
    if (error.response) {
      switch (error.response.status) {
        case 400:
          if (error.response.data.code === 'INVALID_CONTENT_LENGTH') {
            errorMessage = '댓글은 1~255자 사이로 입력해주세요.';
          }
          break;
        case 401:
          errorMessage = '다시 로그인해주세요.';
          break;
        case 404:
          if (error.response.data.code === 'PARENT_COMMENT_NOT_FOUND') {
            errorMessage = '원본 댓글을 찾을 수 없습니다.';
          }
          break;
      }
    }
    
    // 실제 에러가 있을 때만 알림 표시
    if (error.response && error.response.status !== 200) {
      Alert.alert('오류', errorMessage);
    }
  };

  // 답글쓰기 버튼 부분 수정
  const handleReplyPress = (commentId) => {
    setReplyTo(commentId);
    // 키보드 올리기
    inputRef.current?.focus();
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.commentsList}>
        {organizeComments(comments).map((comment) => (
          <View key={`comment-root-${comment.commentId}`}>
            {renderCommentWithReplies(comment, 0)}
          </View>
        ))}
      </ScrollView>
      
      <KeyboardAvoidingView behavior="padding">
        <View style={styles.inputContainer}>
          {replyTo && (
            <View style={styles.replyingToContainer}>
              <TouchableOpacity onPress={() => {
                setReplyTo(null);
                Keyboard.dismiss();
              }}>
                <Text style={styles.cancelReplyText}>취소</Text>
              </TouchableOpacity>
            </View>
          )}
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={newComment}
            onChangeText={setNewComment}
            placeholder={replyTo ? "답글을 입력하세요" : "댓글을 입력하세요"}
            placeholderTextColor="#999"
            maxLength={255}
          />
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={handleAddComment}
          >
            <Text style={styles.sendButtonText}>전송</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );  
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
      },
    commentsList: {
    flex: 1,
    paddingHorizontal: 5,
    },
    commentBox: {
      backgroundColor: '#f8f9fa',
      padding: 12,
      borderRadius: 8,
      marginBottom: 5,
    },
    replyBox: {
      backgroundColor: '#f8f9fa',
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
      borderLeftWidth: 2,
      borderLeftColor: '#4A6FA5',
    },
    commentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    username: {
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
      paddingHorizontal:15,
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
    replyingToContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 6,
      backgroundColor: '#f0f2f5',
      borderRadius: 4,
      marginBottom: 6,
    },
    replyingToText: {
      fontSize: 12,
      color: '#666',
    },
    cancelReplyText: {
      fontSize: 12,
      color: '#4A6FA5',
      fontWeight: '500',
    }
  });

export default Comments;
