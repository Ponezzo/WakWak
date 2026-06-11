import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useGLTF, useAnimations } from '@react-three/drei';

const toonMaterialMapping = {
  'orange.cartoon': new THREE.MeshToonMaterial({ color: 0xF46E27 }),    // 부리
  'white.cartoon': new THREE.MeshToonMaterial({ color: 0xFFF8D4 }),     // 피부
  'eyes.cartoon': new THREE.MeshToonMaterial({ color: 0x000000 }),      // 
  'brown.cartoon': new THREE.MeshToonMaterial({ color: 0x574336 }),     // 갈색
  'black.cartoon': new THREE.MeshToonMaterial({ color: 0x373635 }),     // 검정색
  'pupils.cartoon': new THREE.MeshToonMaterial({ color: 0xffffff }),    // 다크 그레이 (예시)
  'darkbrown.cartoon': new THREE.MeshToonMaterial({ color: 0x45352B }), // 다크 브라운
};

export default function Model(props) {
  const group = useRef();
  const { nodes, materials, animations } = useGLTF(require('../src/duck.glb'), true);
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    // 애니메이션 설정
    if (actions) {
      Object.values(actions).forEach((action) => {
        action.timeScale = 1;
        action.play();
      });
    }

    // geometry의 vertex normals을 재계산
    Object.values(nodes).forEach((node) => {
      if (node.geometry) node.geometry.computeVertexNormals();
    });

    // 그룹 내의 모든 메시를 순회하며 재질을 MeshToonMaterial로 교체
    if (group.current) {
      group.current.traverse((child) => {
        if (child.isMesh) {
          // 재질이 배열인 경우에도 처리
          if (Array.isArray(child.material)) {
            child.material = child.material.map((mat) => {
              // 재질 이름이 toonMaterialMapping에 있으면 교체, 없으면 기본 toon 재질 생성
              return toonMaterialMapping[mat.name] ||
                new THREE.MeshToonMaterial({
                  color: mat.color ? mat.color : new THREE.Color(0xffffff),
                });
            });
          } else {
            // child.material이 null이나 undefined일 경우 처리
            if (child.material) {
              child.material =
                toonMaterialMapping[child.material.name] ||
                new THREE.MeshToonMaterial({
                  color: child.material.color
                    ? child.material.color
                    : new THREE.Color(0xffffff),
                });
            }
          }
        }
      });
    }
  }, [actions, nodes]);

  return (
    <>
      <directionalLight
        position={[10, 11.5, 20]}
        intensity={1.5}
        shadow-camera-far={100}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <ambientLight intensity={1} color="#ffffff" />

      {/* 그룹 ref에 연결된 모델 내부의 메시들은 위 useEffect에서 toon 재질로 교체됩니다 */}
      <group ref={group} {...props} dispose={null}>
        <group name="Scene">
          <group name="Armature">
            {[
              ['beak', 'orange.cartoon'],
              ['body', 'white.cartoon'],
              ['bodyhip', 'white.cartoon'],
              ['Circle', 'eyes.cartoon'],
              ['Circle_1', 'pupils.cartoon'],
              ['hat', 'black.cartoon'],
              ['jacket', 'brown.cartoon'],
              ['jacketarms', 'brown.cartoon'],
              ['jacketzipper', 'black.cartoon'],
              ['Cube029', 'brown.cartoon'],
              ['Cube029_1', 'darkbrown.cartoon'],
              ['Cube029_2', 'darkbrown.cartoon'],
              ['Cube029_3', 'black.cartoon'],
              ['shoeduckfeet', 'orange.cartoon'],
              ['shoelaces', 'black.cartoon'],
              ['shoelining', 'darkbrown.cartoon'],
              ['shoestrap', 'black.cartoon'],
              ['wings', 'white.cartoon'],
            ].map(([name, materialKey]) => (
              <skinnedMesh
                key={name}
                name={name}
                geometry={nodes[name].geometry}
                material={materials[materialKey] || toonMaterialMapping[materialKey]}
                skeleton={nodes[name].skeleton}
              />
            ))}
            <primitive object={nodes.root} />
          </group>
        </group>
      </group>
    </>
  );
}
