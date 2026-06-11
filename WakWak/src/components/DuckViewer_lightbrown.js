import React, {useEffect} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import Duck_lightbrown from "../duck_lightbrown";

const CameraController = () => {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(-5, 10, 15);
    camera.lookAt(0, 0, 0);
    camera.zoom = 2;
    camera.near = 0.1;  // 카메라의 가까운 클리핑 평면
    camera.far = 100;   // 카메라의 먼 클리핑 평면
    camera.updateProjectionMatrix();
  }, [camera]);

  return null;
};

const DuckViewer = () => {
  return (
      <Canvas style={{ flex: 1 }}>
        <CameraController />
        <group rotation={[0, 5.35, 0]} scale={[1, 1, 1]}>
          <Duck_lightbrown position={[0, -3, 0]}/>
        </group>
      </Canvas>
  );
};

export default DuckViewer;