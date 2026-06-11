import React, { useState, useRef, useEffect } from 'react';
import { 
    View, 
    StyleSheet, 
    Dimensions, 
    ScrollView, 
    Image, 
    Text, 
    TouchableOpacity, 
    Modal,
    Alert,
    BackHandler
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const { width: screenWidth } = Dimensions.get('window');

const Costume = () => {
    const navigation = useNavigation();
    const [currentPage, setCurrentPage] = useState(0);
    const scrollViewRef = useRef(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [currentWearing, setCurrentWearing] = useState(null);

    const data = [
        { 
            id: 1, 
            image: require('../../../assets/images/bag/duck_white.jpg'), 
            description: '순백의 꿈',
            additionalText: "하얀 눈처럼 순수한 오리에게 어울리는 순백의 의상입니다. 부드러운 감촉의 화이트 톤은 마치 꿈결 같은 분위기를 자아내죠. 깨끗하고 맑은 영혼을 가진 오리의 모습을 더욱 돋보이게 해줍니다. (벗은건 전혀 아니에요)" ,
            homeScreen: 'home1'
        }, 
        { 
            id: 3, 
            image: require('../../../assets/images/bag/duck_lightbrown.jpg'), 
            description: '포근한 오후의 햇살',
            additionalText: "따스한 햇살이 내려앉은 오후의 풍경처럼 포근한 가벼운 브라운 색상의 의상입니다. 부드러운 색감은 왁왁이이에게 따뜻하고 편안한 느낌을 선사합니다. 마치 엄마 오리의 품에 안긴 듯한 평온함을 느끼게 해줍니다.",
            homeScreen: 'home3'
        }, 
        { 
            id: 6, 
            image: require('../../../assets/images/bag/duck_brown.jpg'), 
            description: '밤의 장막',
            additionalText: "고요한 밤하늘을 닮은 블랙과 깊은 브라운 색상이 조화롭게 어우러진 의상입니다. 세련되면서도 신비로운 분위기를 풍기는 이 의상은 왁왁이의 시크한 매력을 더욱 돋보이게 해주며, 밤의 세계를 탐험하는 듯한 특별한 경험을 선사합니다.",
            homeScreen: 'home6'
        },
        { 
            id: 5, 
            image: require('../../../assets/images/bag/duck_purple.jpg'), 
            description: '꿈결 속의 산책 ',
            additionalText: "파스텔 색상의 블루와 보라의 조화는 마치 꿈속을 거니는 듯한 몽환적인 분위기를 선사합니다. 부드러운 색감은 왁왁이의 귀여움을 더욱 강조해주고, 사랑스러움을 더욱 강조하는 의상입니다.",
            homeScreen: 'home5'
        },
        { 
            id: 2, 
            image: require('../../../assets/images/bag/duck_blue.jpg'), 
            description: '황금빛 새벽',
            additionalText: "남색과 골드의 조합은 마치 새벽하늘에 떠오르는 태양처럼 신성하고 웅장한 느낌을 줍니다. 고급스러우면서도 화려한 이 의상은 왁왁이의 위엄을 더욱 돋보이게 해주며, 특별한 날, 더욱 빛나게 해줄 의상입니다.",
            homeScreen: 'home2'
        },
        { 
            id: 4, 
            image: require('../../../assets/images/bag/duck_pink.jpg'), 
            description: '사랑스러운 속삭임',
            additionalText: "사랑스러운 핑크와 아이보리가 조화롭게 어우러진 의상입니다. 마치 봄날의 벚꽃처럼 화사하고 따뜻한 느낌을 선사합니다. 사랑스러움과 우아함을 동시에 표현하고 싶은 날에 추천하는 의상입니다.",
            homeScreen: 'home4'
        },
    ];

    useEffect(() => {
        checkCurrentWearing();
    }, []);

    const checkCurrentWearing = async () => {
        try {
            const selectedHomeScreen = await AsyncStorage.getItem('selectedHomeScreen');
            if (selectedHomeScreen) {
                const wearing = parseInt(selectedHomeScreen.replace('home', ''));
                setCurrentWearing(wearing);
            }
        } catch (error) {
            console.error('현재 착용중인 코스튬 확인 실패:', error);
        }
    };

    const handlePageChange = (event) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const newPage = Math.round(offsetX / screenWidth);
        setCurrentPage(newPage);
    };

    const scrollToPage = (page) => {
        scrollViewRef.current.scrollTo({ x: page * screenWidth, animated: true });
        setCurrentPage(page);
    };

    const openModal = (item) => {
        setSelectedItem(item);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
    };

    const handleWear = async () => {
        if (!selectedItem) return;

        try {
            const selectedHomeScreen = `home${selectedItem.id}`;
            await AsyncStorage.setItem('selectedHomeScreen', selectedHomeScreen);
            setCurrentWearing(selectedItem.id);
            
            Alert.alert(
                "코스튬 변경!",
                "코스튬이 변경되었습니다. 홈 화면으로 이동합니다.",
                [
                    {
                        text: "확인",
                        onPress: () => {
                            setModalVisible(false);
                            navigation.navigate('HomeStack');
                            setTimeout(() => {
                                navigation.reset({
                                    index: 0,
                                    routes: [{ name: 'HomeStack' }],
                                });
                            }, 100);
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('홈스크린 저장 실패:', error);
            Alert.alert("오류", "홈스크린 저장에 실패했습니다. 다시 시도해주세요.");
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handlePageChange}
                scrollEventThrottle={16}
                contentContainerStyle={styles.scrollViewContent}
            >
                {data.map((item) => (
                    <View key={item.id} style={styles.page}>
                        <TouchableOpacity 
                            style={styles.box} 
                            onPress={() => openModal(item)}
                            activeOpacity={1}
                        >
                            {currentWearing === item.id && (
                                <View style={styles.wearingBanner}>
                                    <Text style={styles.wearingText}>착용중</Text>
                                </View>
                            )}
                            <Image source={item.image} style={styles.image} />
                            <Text style={styles.text}>{item.description.slice(0, 20)}</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {selectedItem && (
                            <>
                                {/* 이미지 영역 */}
                                <View style={styles.modalImageContainer}>
                                    <Image source={selectedItem.image} style={styles.modalImage} />
                                </View>
                                <Text style={styles.modalText}>{selectedItem.description}</Text>
                                <Text style={styles.additionalText}>{selectedItem.additionalText}</Text>
                            </>
                        )}
                        <View style={styles.modalButtonsContainer}>
                            <TouchableOpacity 
                                style={styles.wearButton} 
                                onPress={handleWear}
                            >
                                <Text style={styles.wearButtonText}>착용하기</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.closeButton} 
                                onPress={closeModal}
                            >
                                <Text style={styles.closeButtonText}>닫기</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1,
        backgroundColor:'#fff',
    },
    scrollViewContent: { 
        flexDirection: 'row' 
    },
    page: { 
        width: screenWidth, 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 20 
    },
    box: { 
        width: '100%', 
        height: '100%', 
        backgroundColor: '#F2F2F2', 
        borderRadius: 20, 
        justifyContent: 'center', 
        alignItems: 'center', 
        borderWidth: 1,
        borderColor: '#ccc',
        overflow: 'hidden'
    },
    wearingBanner: {
        position: 'absolute',
        top: 20,
        left: -30,
        backgroundColor: '#87A7C0',
        padding: 5,
        width: 120,
        transform: [{ rotate: '-45deg' }],
        zIndex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    wearingText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    image: { 
        width: '100%', 
        height: '80%', 
        resizeMode: 'contain' 
    },
    text: { 
        textAlign: 'center', 
        fontFamily: 'font1',
        fontSize: 25,
        fontWeight: 'bold',
        color: '#000',
    },
    modalContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: { 
        backgroundColor: '#fff', // 모달 배경색을 흰색으로 변경
        padding: 20, 
        borderRadius: 10, 
        width: '90%', 
        height: '80%',
        position: 'relative',
    },
    // 새로 추가된 이미지 영역 스타일
    modalImageContainer: {
        backgroundColor: '#F2F2F2',
        borderWidth: 1,
        borderColor: '#ccc', // 조금 더 진한 회색 테두리
        borderRadius: 10,   // 모달과 동일한 둥근 모서리
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        marginBottom: 10,
    },
    modalImage: { 
        width: 300, 
        height: 300, 
        resizeMode: 'contain', 
        alignSelf: 'center' 
    },
    modalText: { 
        marginTop: 10, 
        textAlign: 'center', 
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: 'font1',
        marginBottom: 10,
    },
    additionalText: {
        marginTop: 10,
        marginHorizontal: 20,
        textAlign: 'center',
        fontSize: 14,
        color: '#333',
    },
    modalButtonsContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    wearButton: {
        flex: 1,
        backgroundColor: '#87A7C0',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginRight: 5,
    },
    closeButton: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginLeft: 5,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    wearButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    closeButtonText: {
        color: '#000',
        fontSize: 16,
    },
});

export default Costume;
