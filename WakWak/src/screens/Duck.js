import React, { Suspense, useEffect } from "react";
import { View } from "react-native";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei/native";
import DuckWalk from "../duck_walk";

const CameraController = () => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 20, 20);
    camera.lookAt(0, 0, 0);
  }, []);

  return null;
};

const DuckScreen = () => {
  return (
    <View style={{ flex: 1 }}>
      <Canvas style={{ flex: 1 }}>
        <CameraController />
        <OrbitControls
          enablePan={true}
          enableZoom={false}
          enableRotate={true} // 화면 터치를 통한 회전 비활성화
          rotateSpeed={2.5}
        />
        <Suspense fallback={null}>
          <group 
          rotation={[0, 299.95, 0]} 
          scale={[1.5,1.5,1.5]} 
          > 
            <DuckWalk />
          </group>
        </Suspense>
      </Canvas>
    </View>
  );
};

export default DuckScreen;