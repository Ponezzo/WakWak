import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Video from "react-native-video";
import DuckViewer from "../components/DuckViewer_pink";
import Quotes from "../components/Quotes";
import OverlayText from "../components/OverlayText";

const HomeScreen = ({ navigation }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showBox, setShowBox] = useState(true);
    const [videoPath, setVideoPath] = useState(null);
    const [quote, setQuote] = useState(null);
    const [overlayText, setOverlayText] = useState(null);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);
            if (now.getSeconds() === 0) {
                changeQuote();
            }
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        navigation.setOptions({ headerShown: false });

        const availableOverlayTexts = OverlayText;
        if (availableOverlayTexts && availableOverlayTexts.length > 0) {
            changeOverlayText(availableOverlayTexts);
        }

        const timeout = setTimeout(() => {
            setShowBox(false);
        }, 3000);
        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        const videoUri = `file:///android_asset/videos/ground1.mp4`;
        setVideoPath(videoUri);
    }, []);

    useEffect(() => {
        const availableQuotes = Quotes;
        if (availableQuotes && availableQuotes.length > 0) {
            changeQuote(availableQuotes);
        }
    }, []);

    const changeQuote = (availableQuotes) => {
        const quotesToUse = availableQuotes || Quotes;
        if (quotesToUse && quotesToUse.length > 0) {
            const randomIndex = Math.floor(Math.random() * quotesToUse.length);
            setQuote(quotesToUse[randomIndex]);
        }
    };

    const changeOverlayText = (availableOverlayTexts) => {
        const textsToUse = availableOverlayTexts || OverlayText;
        if (textsToUse && textsToUse.length > 0) {
            const randomIndex = Math.floor(Math.random() * textsToUse.length);
            setOverlayText(textsToUse[randomIndex]);
        }
    };

    const formattedTime = currentTime.toLocaleTimeString("en-us", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

    return (
        <View style={styles.background}>
            <View style={{ flex: 1 }}>
                <View style={styles.header}>
                    <Text style={styles.time}>{formattedTime}</Text>
                </View>

                <View style={styles.quoteContainer}>
                    {quote && (
                        <>
                            <Text style={styles.quoteText}>" {quote.text.replace(/,/g, ",\n")} "</Text>
                            <Text style={styles.quoteAuthor}>- {quote.author} -</Text>
                        </>
                    )}
                </View>

                {showBox && (
                    <View style={styles.overlayBox}>
                        {overlayText && (
                            <Text style={styles.overlayText}>
                                {overlayText}
                            </Text>
                        )}
                    </View>
                )}

                <View style={styles.contentContainer}>
                    <View style={styles.videoContainer}>
                        {videoPath && (
                            <Video
                                source={{ uri: videoPath }}
                                style={styles.video}
                                resizeMode="cover"
                                repeat
                                muted
                            />
                        )}
                    </View>
                    <View style={styles.duckContainer}>
                        <DuckViewer />
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: "cover",
        backgroundColor: "#87A7C0",
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
        marginTop: 40,
    },
    quoteContainer: {
        alignItems: "center",
        justifyContent: "center",
        width: 370,
        height: 150,
        paddingHorizontal: 30,
        paddingVertical: 20,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        borderRadius: 15,
        marginLeft: 20,
        marginTop: -70,
    },
    quoteText: {
        color: "white",
        fontSize: 22,
        fontFamily: "font1",
        textAlign: "center",
        marginBottom: 5,
    },
    quoteAuthor: {
        color: "white",
        fontSize: 18,
        fontFamily: "font1",
    },
    contentContainer: {
        position: 'relative',
        width: "100%",
        height: "60%",
    },
    videoContainer: {
        position: 'absolute',
        width: "100%",
        height: "100%",
        zIndex: 1,
    },
    video: {
        width: "100%",
        height: "100%",
        borderRadius: 15,
    },
    duckContainer: {
        top: "7%",
        width: "100%",
        height: "90%",
        zIndex: 2,
    },
    overlayBox: {
        position: "absolute",
        height: "100%",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "black",
        opacity: 1,
        zIndex: 1000,
    },
    overlayText: {
        top: "50%",
        color: "white",
        fontSize: 24,
        fontFamily: "font1",
        textAlign: "center",
        justifyContent: "center",
    }
});

export default HomeScreen;