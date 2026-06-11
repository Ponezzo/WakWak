import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const UploadModeModal = ({ visible, onClose, onLaunchCamera, onLaunchImageLibrary }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.option}
            onPress={() => {
              onLaunchCamera();
              onClose();
            }}
          >
            <Text style={styles.optionText}>카메라로 촬영하기</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.option}
            onPress={() => {
              onLaunchImageLibrary();
              onClose();
            }}
          >
            <Text style={styles.optionText}>사진 선택하기</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.option, styles.cancelOption]}
            onPress={onClose}
          >
            <Text style={[styles.optionText, styles.cancelText]}>취소</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 20,
  },
  option: {
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 16,
    color: '#4A6FA5',
  },
  cancelOption: {
    borderBottomWidth: 0,
    marginTop: 10,
  },
  cancelText: {
    color: '#999',
  }
});

export default UploadModeModal;
