'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  useGLTF,
  Text,
  Float,
  Html,
  Environment,
  BakeShadows,
  AccumulativeShadows,
  RandomizedLight,
  Center,
  MeshTransmissionMaterial,
} from '@react-three/drei';
import { useSpring, animated, config } from '@react-spring/three';
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { suspend } from 'suspend-react';

const AnimatedMaterial = animated(MeshTransmissionMaterial);

// Component to show a marker with information
function DiagnosticMarker({ position, info, color, isActive, onClick }) {
  const [hovered, setHovered] = useState(false);

  const { scale } = useSpring({
    scale: hovered || isActive ? 1.5 : 1,
    config: config.wobbly,
  });

  const { opacity, emissive } = useSpring({
    opacity: hovered || isActive ? 1 : 0.7,
    emissive: hovered || isActive ? 0.4 : 0.1,
    config: { tension: 300, friction: 40 },
  });

  return (
    <Float speed={5} rotationIntensity={0.2} floatIntensity={isActive ? 2 : 0.5} position={position}>
      <animated.mesh
        scale={scale}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.15, 16, 16]} />
        <AnimatedMaterial
          color={color}
          roughness={0.1}
          opacity={opacity}
          emissive={color}
          emissiveIntensity={emissive}
          transmission={0.6}
          distortion={0.5}
          temporalDistortion={0.2}
          thickness={1}
        />
      </animated.mesh>

      {isActive && (
        <Html position={[0, 0.3, 0]} center distanceFactor={8}>
          <div className="bg-black/80 backdrop-blur-sm text-white p-2 rounded-lg shadow-xl w-48 pointer-events-none">
            <div className="font-bold mb-1 text-cyan-300">{info.title}</div>
            <div className="text-xs text-gray-300">{info.description}</div>
          </div>
        </Html>
      )}
    </Float>
  );
}

// Component to show 3D human body with health markers
function DiagnosticModel({ activePoint, setActivePoint, diagnosisType }) {
  const groupRef = useRef();

  // Define diagnostic markers based on diagnosis type
  const diagnosticPoints = {
    diabetes: [
      {
        position: [0, 0.5, 0.8],
        info: {
          title: 'Pancreas',
          description: 'The pancreas produces insulin, crucial for regulating blood glucose levels.',
        },
        color: '#15E3E3',
      },
      {
        position: [0.8, 0, 0.3],
        info: {
          title: 'Cardiovascular',
          description: 'Diabetes affects blood vessels and increases risk of heart disease.',
        },
        color: '#ff4dac',
      },
      {
        position: [-0.8, -0.2, 0.3],
        info: {
          title: 'Kidney',
          description: 'Prolonged high blood glucose can damage kidney function.',
        },
        color: '#4d94ff',
      },
      {
        position: [0, -1, 0.5],
        info: {
          title: 'Feet',
          description: 'Poor circulation and nerve damage can affect extremities.',
        },
        color: '#fff800',
      },
    ],
    cardiovascular: [
      {
        position: [0, 0.8, 0.5],
        info: {
          title: 'Heart',
          description: 'The central organ of the cardiovascular system.',
        },
        color: '#ff4d4d',
      },
      {
        position: [0.8, 0.3, 0.3],
        info: {
          title: 'Arteries',
          description: 'Blood vessels that can develop atherosclerosis.',
        },
        color: '#15E3E3',
      },
      {
        position: [-0.8, 0.3, 0.3],
        info: {
          title: 'Lungs',
          description: 'Connected to heart function and oxygen circulation.',
        },
        color: '#4d94ff',
      },
    ],
    mental: [
      {
        position: [0, 1, 0.3],
        info: {
          title: 'Brain',
          description: 'Central to mental health and neurochemical balance.',
        },
        color: '#15E3E3',
      },
      {
        position: [0, 0.3, 0.8],
        info: {
          title: 'Nervous System',
          description: 'Controls stress responses and emotional regulation.',
        },
        color: '#fff800',
      },
    ],
  };

  // Choose points based on diagnosis type
  const points = diagnosticPoints[diagnosisType] || diagnosticPoints.diabetes;

  // Rotate the model slightly on each frame
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime() * 0.1;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, Math.sin(t) * 0.5, 0.05);
    }
  });

  // Placeholder cylinder mesh for the human body
  // In a real implementation, you would use a proper 3D model loaded with useGLTF
  return (
    <group ref={groupRef}>
      <Center>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.7, 0.7, 2.5, 32]} />
          <MeshTransmissionMaterial
            color="#888888"
            roughness={0.3}
            opacity={0.6}
            transmission={0.7}
            thickness={1}
            chromaticAberration={0.06}
          />
        </mesh>

        <mesh position={[0, 1.5, 0]} castShadow>
          <sphereGeometry args={[0.5, 32, 32]} />
          <MeshTransmissionMaterial
            color="#909090"
            roughness={0.3}
            opacity={0.6}
            transmission={0.7}
            thickness={1}
            chromaticAberration={0.06}
          />
        </mesh>

        {/* Diagnostic markers */}
        {points.map((point, index) => (
          <DiagnosticMarker
            key={index}
            position={point.position}
            info={point.info}
            color={point.color}
            isActive={activePoint === index}
            onClick={() => setActivePoint(activePoint === index ? null : index)}
          />
        ))}
      </Center>
    </group>
  );
}

// Main visualization component
export function DiagnosticVisualization({ diagnosisType = 'diabetes' }) {
  const [activePoint, setActivePoint] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="w-full h-[500px] relative rounded-xl overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 1 : 0 }}
      transition={{ duration: 1 }}
    >
      <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }}>
        <color attach="background" args={['#060a10']} />

        <ambientLight intensity={0.2} />
        <spotLight position={[5, 5, 5]} angle={0.3} penumbra={1} intensity={1} castShadow color="#ffffff" />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#15E3E3" />

        <AccumulativeShadows temporal frames={60} alphaTest={0.85} scale={10} position={[0, -1.5, 0]}>
          <RandomizedLight amount={8} radius={6} intensity={0.55} ambient={0.25} position={[5, 5, -8]} />
        </AccumulativeShadows>

        <DiagnosticModel activePoint={activePoint} setActivePoint={setActivePoint} diagnosisType={diagnosisType} />

        <OrbitControls enablePan={false} enableZoom={true} minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 1.5} />

        <EffectComposer>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} />
          <Noise opacity={0.02} />
        </EffectComposer>

        <BakeShadows />
      </Canvas>

      <div className="absolute bottom-4 left-4 right-4 text-xs text-white/50 text-center bg-black/20 backdrop-blur-sm py-2 px-4 rounded-full">
        Click on markers to learn more • Drag to rotate view • Scroll to zoom
      </div>
    </motion.div>
  );
}
