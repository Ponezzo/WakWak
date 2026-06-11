// Record.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const Record = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* 헤더 영역 */}
      <View style={styles.header}>
        {/* 변경: Record 헤더 title을 이미지로 변경 (record_line.png) */}
        <Image 
          source={require('../../assets/images/record_line.png')}
          style={styles.headerTitleImage}
        />
        <Text style={styles.subtitle}>당신의 이야기를 들려주세요</Text>
      </View>

      <View style={styles.cardContainer}>
        {/* 타임캡슐 카드 */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Map')}
        >
          <Text style={styles.cardText}>타임캡슐</Text>
          {/* 추가: 오른쪽 데코레이션 이미지 (capsule_line.png) */}
          <Image 
            source={require('../../assets/images/capsule_line.png')}
            style={styles.cardImage}
          />
        </TouchableOpacity>

        {/* 별 일기 카드 */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('StarHome')}
        >
          <Text style={styles.cardText}>별 일기</Text>
          {/* 추가: 오른쪽 데코레이션 이미지 (starline_line.png) */}
          <Image 
            source={require('../../assets/images/starline_line.png')}
            style={styles.cardImage}
          />
        </TouchableOpacity>

        {/* 유리병 편지 카드 */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Bottle')}
        >
          <Text style={styles.cardText}>유리병 편지</Text>
          {/* 추가: 오른쪽 데코레이션 이미지 (bottle_line.png) */}
          <Image 
            source={require('../../assets/images/bottle_line.png')}
            style={styles.cardImage}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // 전체 화면 배경: 흰색
  container: {
    flex: 1,
    backgroundColor: '#87A7C0',
  },
  // 헤더 스타일
  header: {
    width: '100%',
    height: '30%',
    backgroundColor: '#87A7C0',
    paddingVertical: 39,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 변경: Record 헤더 타이틀 이미지를 위한 스타일
  headerTitleImage: {
    width: 200,        // 이미지 가로 크기
    height: 100,       // 이미지 세로 크기
    resizeMode: 'contain',
    marginTop: '10%',
    marginBottom: '5%',
    tintColor: '#FFFFFF',
  },
  // 헤더의 부제목
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  // 카드 컨테이너 스타일 변경
  cardContainer: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30, 
    height: '70%',
    width: '100%',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center', // 변경: 카드 그룹을 중앙에 정렬
  },
  // 카드(버튼) 스타일 변경
  card: {
    width: '80%',
    backgroundColor: '#87A7C0',
    paddingVertical: 25, // 카드 세로 높이 기준(이미지 크기의 기준)
    borderRadius: 10,
    position: 'relative', // 추가: 자식의 절대 위치 설정을 위해
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: '10%',
    paddingRight: '10%',
    alignSelf: 'center',
    marginVertical: '3%', // 변경: 각 카드 사이에 약 5% 간격 (위, 아래 각각 2.5% 적용)
    overflow: 'hidden', // 추가: 이미지 클리핑 효과
  },
  // 카드 내부 텍스트
  cardText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // 변경: 카드 데코레이션 이미지 스타일 수정
  cardImage: {
    width: 110,           // 카드 세로 5배 (25 * 5)
    height: 110,          // 카드 세로 5배 (25 * 5)
    resizeMode: 'contain',
    tintColor: '#FFFFFF', // 이미지 색상 흰색으로 변경
    position: 'absolute', // 이미지가 카드 레이아웃에 영향을 주지 않도록
    right: '-5%',        // 카드 오른쪽에 배치
    top: '150%',          // 이미지 위치 조정
    marginTop: -62.5,     // 이미지 높이의 절반만큼 올려서 중앙 정렬
    transform: [{ rotate: '20deg' }], // 이미지 기울임 (20도)
    opacity: 0.5,
  },
});

export default Record;
