import React from "react";
import { View, StyleSheet } from "react-native";
import DuckViewer from "../../components/DuckViewer_white";

const HomeScreen = ({ navigation }) => {
    return (
        <View style={styles.background}>
            <View style={styles.duckContainer}>
                <DuckViewer />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    duckContainer: {
        flex: 1,
        width: "100%",
        height: "100%",
    }
});

export default HomeScreen;