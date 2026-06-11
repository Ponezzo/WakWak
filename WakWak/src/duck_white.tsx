import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF, useAnimations } from '@react-three/drei';

// 각 메시별 기본 색상 정의
const defaultColors = {
  beak: '#F46E27',           // 부리
  feet: '#F46E27',           // 발
  body: '#FFF8D4',           // 몸통
  bodyhip: '#FFF8D4',        // 엉덩이 부분
  wings: '#FFF8D4',          // 날개
  eyes: '#000000',           // 눈
  pupils: '#FFFFFF',         // 동공
  ///////////////////////////////////////
  hat: '#373635',           // 모자
  glasses : '#F46E27',
  glasseslens: '#F46E27',
  jacket: '#574336',         // 재킷 몸통
  jacketarms: '#574336',     // 재킷 팔
  jacketzipper: '#373635',   // 재킷 지퍼
  shoes: '#574336',          // 신발
  shoelaces: '#373635',      // 신발끈
  shoelining: '#45352B',     // 신발 안감
  shoestrap: '#373635',      // 신발 스트랩
  cube029: '#574336',        // Cube029 파트
  cube029_1: '#45352B',      // Cube029_1 파트
  cube029_2: '#45352B',      // Cube029_2 파트
  cube029_3: '#373635',      // Cube029_3 파트
};

// 메시 이름과 재질 키 매핑
const meshMaterialMapping = {
  'beak': 'beak.material',
  'shoeduckfeet': 'feet.material',
  'feet': 'feet.material',
  'body': 'body.material',
  'bodyhip': 'bodyhip.material',
  'wings': 'wings.material',
  'Circle': 'eyes.material',
  'Circle_1': 'pupils.material',
  // 'hat': 'hat.material',
  // 'glasses': 'glasses.material',
  // 'glasseslens': 'glasseslens.material',
  // 'jacket': 'jacket.material',
  // 'jacketarms': 'jacketarms.material',
  // 'jacketzipper': 'jacketzipper.material',
  // 'Cube029': 'cube029.material',
  // 'Cube029_1': 'cube029_1.material',
  // 'Cube029_2': 'cube029_2.material',
  // 'Cube029_3': 'cube029_3.material',
  // 'shoelaces': 'shoelaces.material',
  // 'shoelining': 'shoelining.material',
  // 'shoestrap': 'shoestrap.material',
};

// 재질 키와 색상 속성 매핑
const materialColorMapping = {
  'beak.material': 'beak',
  'feet.material': 'feet',
  'body.material': 'body',
  'bodyhip.material': 'bodyhip',
  'wings.material': 'wings',
  'eyes.material': 'eyes',
  'pupils.material': 'pupils',
  'hat.material': 'hat',
  'glasses.material': 'glasses',
  'glasseslens.material': 'glasseslens',
  'jacket.material': 'jacket',
  'jacketarms.material': 'jacketarms',
  'jacketzipper.material': 'jacketzipper',
  'cube029.material': 'cube029',
  'cube029_1.material': 'cube029_1',
  'cube029_2.material': 'cube029_2',
  'cube029_3.material': 'cube029_3',
  'shoelaces.material': 'shoelaces',
  'shoelining.material': 'shoelining',
  'shoestrap.material': 'shoestrap',
};

export default function Model({ colors = {}, ...props }) {
  const group = useRef();
  const { nodes, materials, animations } = useGLTF(require('../src/duck.glb'), true);
  const { actions } = useAnimations(animations, group);
  
  // 재질 참조를 저장할 ref
  const materialsRef = useRef({});

  // 최종 색상 계산
  const finalColors = useMemo(() => ({ ...defaultColors, ...colors }), [colors]);

  // 초기 재질 설정
  useEffect(() => {
    // 최초 한 번만 재질 생성
    if (Object.keys(materialsRef.current).length === 0) {
      // 모든 고유한 재질 키에 대해 새로운 재질 생성
      const uniqueMaterials = [...new Set(Object.values(meshMaterialMapping))];
      uniqueMaterials.forEach((materialKey) => {
        materialsRef.current[materialKey] = new THREE.MeshToonMaterial();
      });
    }

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
  }, [actions, nodes]);

  // 색상이 변경될 때만 재질의 색상 업데이트
  useEffect(() => {
    Object.entries(materialsRef.current).forEach(([materialKey, material]) => {
      const colorKey = materialColorMapping[materialKey];
      if (colorKey && finalColors[colorKey]) {
        material.color.set(finalColors[colorKey]);
      }
    });
  }, [finalColors]);

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

      <group ref={group} {...props} dispose={null}>
        <group name="Scene">
          <group name="Armature">
            {Object.entries(meshMaterialMapping).map(([meshName, materialKey]) => (
              nodes[meshName] && (
                <skinnedMesh
                  key={meshName}
                  name={meshName}
                  geometry={nodes[meshName].geometry}
                  material={materialsRef.current[materialKey]}
                  skeleton={nodes[meshName].skeleton}
                />
              )
            ))}
            <primitive object={nodes.root} />
          </group>
        </group>
      </group>
    </>
  );
}