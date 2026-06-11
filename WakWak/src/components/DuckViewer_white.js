import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Duck_white from "../duck_white";

const DuckViewer = () => {
  return (
    <Canvas
      style={{ flex: 1 }}
      camera={{
        position: [-5, 10, 15],
        fov: 45,
        near: 0.1,
        far: 100,
        zoom: 2
      }}
    >
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        minDistance={35}
        maxDistance={25}
      />
      <group rotation={[0, 5.35, 0]} scale={[1, 1, 1]}>
        <Duck_white position={[0, -3, 0]} />
      </group>
    </Canvas>
  );
};

export default DuckViewer;