import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Costume from './Bag/Costume';
import TimeCapsule from './Bag/TimeCapsule';
import GlassBottle from './Bag/GlassBottle';
// import Viewer from './Bag/Viewer'; // 필요 시 추가

const Bag = () => {
  const [activeTab, setActiveTab] = useState('costume');

  const renderContent = () => {
    switch (activeTab) {
      case 'costume':
        return <Costume />;
      case 'timeCapsule':
        return <TimeCapsule />;
      case 'glassBottle':
        return <GlassBottle />;
      // case 'viewer':
      //   return <Viewer />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'costume' && styles.activeTabButton]}
          onPress={() => setActiveTab('costume')}
        >
          <Image
            source={require('../../assets/images/hanger.png')}
            style={[styles.icon, { tintColor: activeTab === 'costume' ? 'white' : 'black' }]}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'timeCapsule' && styles.activeTabButton]}
          onPress={() => setActiveTab('timeCapsule')}
        >
          <Image
            source={require('../../assets/images/capsule_line.png')}
            style={[styles.icon, { tintColor: activeTab === 'timeCapsule' ? 'white' : 'black' }]}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'glassBottle' && styles.activeTabButton]}
          onPress={() => setActiveTab('glassBottle')}
        >
          <Image
            source={require('../../assets/images/bottle_line.png')}
            style={[styles.icon, { tintColor: activeTab === 'glassBottle' ? 'white' : 'black' }]}
          />
        </TouchableOpacity>
      </View>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    width: '100%',
    height: 60,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#ffffff',
  },
  activeTabButton: {
    borderBottomColor: '#87A7C0',
    backgroundColor: '#87A7C0',
  },
  icon: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
  },
});

export default Bag;
