import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF, useAnimations } from '@react-three/drei';

// Define default colors for each mesh
const defaultColors = {
  beak: '#F46E27',
  body: '#FFF8D4',
  bodyhip: '#FFF8D4',
  eyes: '#000000',
  Circle: '#000000',
  Circle_1: '#000000',
  feet: '#F46E27',
  glasses: '#DFCDB0',
  glasseslens: '#FFF8D4',
  hat: '#88552F',
  jacket: '#A36F47',
  jacketarms: '#A36F47',
  jacketzipper: '#DFCDB0',
  shirt: '#C8AA68',
  shirtarms: '#DFCDB0',
  wings: '#FFF8D4',
  pupils: '#FFFFFF',
  shoelaces: '#C8AA68',
  shoelining: '#88552F',
  cube029: '#A36F47', //신발 몸통 뒷 쪽
  cube029_1: '#88552F', // 신발 몸통 앞 쪽
  cube029_2: '#88552F', // 신발 혀
  cube029_3: '#DFCDB0', // 신발 밑창
  ////////////////////////// 동작 X
  shoestrap: '#F46E27',
  shoes: '#F46E27',
};

// Map mesh names to material keys
const meshMaterialMapping = {
  'beak': 'beak.material',
  'body': 'body.material',
  // 'beenie': 'hat.material',
  'bodyhip': 'bodyhip.material',
  'eyes': 'eyes.material',
  // 'Circle': 'Circle.material',
  // 'Circle_1': 'Circle_1.material',
  // 'feet': 'feet.material',
  'glasses': 'glasses.material',
  'glasseslens': 'glasseslens.material',
  'hat': 'hat.material',
  'jacket': 'jacket.material',
  'jacketarms': 'jacketarms.material',
  'jacketzipper': 'jacketzipper.material',
  // 'shirt': 'shirt.material',
  'shirtarms': 'shirtarms.material',
  'Cube029': 'cube029.material',
  'Cube029_1': 'cube029_1.material',
  'Cube029_2': 'cube029_2.material',
  'Cube029_3': 'cube029_3.material',
  'shoeduckfeet': 'feet.material',
  'shoelaces': 'shoelaces.material',
  'shoelining': 'shoelining.material',
  'shoestrap': 'shoestrap.material',
  'wings': 'wings.material',
};

// Map material keys to color properties
const materialColorMapping = {
  'beak.material': 'beak',
  'body.material': 'body',
  'bodyhip.material': 'bodyhip',
  'eyes.material': 'eyes',
  'Circle.material': 'Circle',
  'Circle_1.material': 'Circle_1',
  'feet.material': 'feet',
  'glasses.material': 'glasses',
  'glasseslens.material': 'glasseslens',
  'hat.material': 'hat',
  'jacket.material': 'jacket',
  'jacketarms.material': 'jacketarms',
  'jacketzipper.material': 'jacketzipper',
  'shirt.material': 'shirt',
  'shirtarms.material': 'shirtarms',
  'cube029.material': 'cube029',
  'cube029_1.material': 'cube029_1',
  'cube029_2.material': 'cube029_2',
  'cube029_3.material': 'cube029_3',
  'shoelaces.material': 'shoelaces',
  'shoelining.material': 'shoelining',
  'shoestrap.material': 'shoestrap',
  'wings.material': 'wings',
};

export default function Model({ colors = {}, ...props }) {
  const group = useRef();
  const { nodes, materials, animations } = useGLTF(require('../src/duck.glb'));
  const { actions } = useAnimations(animations, group);
  
  // Reference for materials
  const materialsRef = useRef({});

  // Calculate final colors
  const finalColors = useMemo(() => ({ ...defaultColors, ...colors }), [colors]);

  // Initial material setup
  useEffect(() => {
    if (Object.keys(materialsRef.current).length === 0) {
      const uniqueMaterials = [...new Set(Object.values(meshMaterialMapping))];
      uniqueMaterials.forEach((materialKey) => {
        materialsRef.current[materialKey] = new THREE.MeshToonMaterial();
      });
    }

    // Set up animations
    if (actions) {
      Object.values(actions).forEach((action) => {
        action.timeScale = 1;
        action.play();
      });
    }

    // Recalculate vertex normals
    Object.values(nodes).forEach((node) => {
      if (node.geometry) node.geometry.computeVertexNormals();
    });
  }, [actions, nodes]);

  // Update material colors when colors change
  useEffect(() => {
    Object.entries(materialsRef.current).forEach(([materialKey, material]) => {
      const colorKey = materialColorMapping[materialKey];
      if (colorKey && finalColors[colorKey]) {
        if (colorKey === 'glasseslens') {
          material.color.set(finalColors[colorKey]);
          material.transparent = true;
          material.opacity = 0.5;
          material.alphaTest = 0.1;
        } else {
          material.color.set(finalColors[colorKey]);
        }
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