import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ImageBackground, ActivityIndicator } from "react-native";
import DuckViewer from "../components/DuckViewer";

const HomeScreen = ({ navigation }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showBox, setShowBox] = useState(true);

  // 명언 리스트
  const quotes = [
        { "text": "생각이 많아지면, 용기가 사라진다.", 
          "author": "Erwin Rommel" 
        },
      
  ]
  
  const [quote, setQuote] = useState(quotes[0]); // 초기 명언 설정

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // 정각(분:00, 초:00)일 때 명언 변경
      if (
        // now.getMinutes() === 1 
      // && 
      now.getSeconds() === 0
      ){
        changeQuote();
      }
    }, 1000); // 1초마다 체크

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    navigation.setOptions({ 
      headerShown: false,

    }); // 네비게이션 바 숨기기
    const timeout = setTimeout(() => {
      setShowBox(false);
    }, 3000);
    return () => clearTimeout(timeout);
  }, []);

  // 랜덤 명언 변경 함수
  const changeQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);
  };

  const formattedTime = currentTime.toLocaleTimeString("en-us", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <ImageBackground
      source={require("../../assets/images/background.png")}
      style={styles.background}
    >
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.time}>{formattedTime}</Text>
        </View>

        {/* 매 정각마다 자동 변경되는 명언 */}
        <View style={styles.quoteContainer}>
          <Text style={styles.quoteText}>" {quote.text.replace(/,/g, ",\n")} "</Text>
          <Text style={styles.quoteAuthor}>- {quote.author}</Text>
        </View>

        {showBox && (
          <View style={styles.overlayBox}>
            <Text style={styles.overlayText}>밍기적 밍기적 둥지에서 나오는중..</Text>
          </View>
        )}

        <View style={styles.duckContainer}>
          <DuckViewer />
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  header: {
    padding: 20,
    height: 250,
    alignItems: "center",
  },
  time: {
    color: "white",
    fontSize: 70,
    fontFamily: "font1",
    marginTop: 70,
  },
  quoteContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 370,
    Height: 150,
    paddingHorizontal: 30,
    paddingVertical: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 15,
    marginLeft: 20,
    marginTop: -50,

  },
  quoteText: {
    color: "white",
    fontSize: 22,
    fontFamily: 'font1',
    textAlign: "center",
    marginBottom: 5,
  },
  quoteAuthor: {
    color: "white",
    fontSize: 18,
    fontFamily: 'font1',
  },
  duckContainer: {
    flex: 3,
  },
  overlayBox: {
    position: 'absolute',
    height: '100%',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
    opacity: 1,
    zIndex: 1000,
  },
  overlayText: {
    top: '50%',
    color: 'white',
    fontSize: 24,
    fontFamily: 'font1',
    textAlign: 'center',
    justifyContent: 'center',
  },
});

export default HomeScreen;
