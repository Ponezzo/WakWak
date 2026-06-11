module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // 다른 플러그인들...
    'react-native-reanimated/plugin' // 반드시 마지막에 위치해야 함
  ],
};
