'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Float } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

// Constants for absolute accessibility
const GRAB_DISTANCE = 3.5; // Massive increase to make it super easy
const BOX_SIZE = 0.8;
const FLOOR_Y = BOX_SIZE / 2;
const ARM1_LENGTH = 6.5; 
const ARM2_LENGTH = 6.0; 

const RobotArmModel = ({ 
  controls, 
  pickedId, 
  gripperRef,
  rotations,
  setRotations
}: { 
  controls: { [key: string]: boolean }, 
  pickedId: string | null,
  gripperRef: React.RefObject<THREE.Group>,
  rotations: { base: number, arm1: number, arm2: number },
  setRotations: React.Dispatch<React.SetStateAction<{ base: number, arm1: number, arm2: number }>>
}) => {
  const baseRef = useRef<THREE.Group>(null);
  const arm1Ref = useRef<THREE.Group>(null);
  const arm2Ref = useRef<THREE.Group>(null);
  const fingerLeftRef = useRef<THREE.Group>(null);
  const fingerRightRef = useRef<THREE.Group>(null);
  const ghostRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const speed = 2.0;
    let newRotations = { ...rotations };

    if (controls['KeyA']) newRotations.base += speed * delta;
    if (controls['KeyD']) newRotations.base -= speed * delta;
    if (controls['KeyW']) newRotations.arm1 -= speed * delta;
    if (controls['KeyS']) newRotations.arm1 += speed * delta;
    if (controls['KeyE']) newRotations.arm2 -= speed * delta;
    if (controls['KeyR']) newRotations.arm2 += speed * delta;

    // Optimized constraints for absolute floor reach
    newRotations.arm1 = THREE.MathUtils.clamp(newRotations.arm1, -Math.PI / 1.05, 0.8);
    newRotations.arm2 = THREE.MathUtils.clamp(newRotations.arm2, 0.02, Math.PI * 1.2);

    setRotations(newRotations);

    if (baseRef.current) baseRef.current.rotation.y = newRotations.base;
    if (arm1Ref.current) arm1Ref.current.rotation.z = newRotations.arm1;
    if (arm2Ref.current) arm2Ref.current.rotation.z = newRotations.arm2;

    if (fingerLeftRef.current && fingerRightRef.current) {
      // Realistic squeeze: when picked, fingers should be almost parallel or slightly angled in
      const targetFingerRot = pickedId ? 0.02 : 0.7;
      fingerLeftRef.current.rotation.z = THREE.MathUtils.lerp(fingerLeftRef.current.rotation.z, targetFingerRot, 0.15);
      fingerRightRef.current.rotation.z = THREE.MathUtils.lerp(fingerRightRef.current.rotation.z, -targetFingerRot, 0.15);
    }

    if (ghostRef.current) {
      ghostRef.current.rotation.y += 0.005;
      ghostRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.03);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Ghost Prisma Ring */}
      <group ref={ghostRef} position={[0, 4, -4]} rotation={[Math.PI / 8, 0, 0]}>
        <mesh>
          <torusGeometry args={[6, 0.03, 16, 100]} />
          <meshStandardMaterial color="#d4b99b" transparent opacity={0.05} metalness={1} />
        </mesh>
      </group>

      {/* Industrial Base */}
      <mesh castShadow receiveShadow position={[0, 0.25, 0]}>
        <cylinderGeometry args={[2.5, 2.8, 0.5, 32]} />
        <meshStandardMaterial color="#1a1614" metalness={0.9} roughness={0.1} />
      </mesh>

      <group ref={baseRef} position={[0, 0.5, 0]}>
        {/* Swivel Axis */}
        <mesh castShadow position={[0, 0.4, 0]}>
          <cylinderGeometry args={[1.4, 1.6, 0.8, 32]} />
          <meshStandardMaterial color="#2a2421" metalness={1} roughness={0.2} />
        </mesh>

        {/* Joint 1 - Shoulder */}
        <group position={[0, 0.6, 0]} ref={arm1Ref}>
          <mesh position={[0, ARM1_LENGTH / 2, 0]} castShadow>
            <boxGeometry args={[0.6, ARM1_LENGTH, 0.6]} />
            <meshStandardMaterial color="#d4b99b" metalness={0.3} roughness={0.7} />
          </mesh>
          
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.6, 0.6, 1.2, 16]} />
            <meshStandardMaterial color="#8c7355" metalness={0.9} />
          </mesh>

          {/* Joint 2 - Elbow */}
          <group position={[0, ARM1_LENGTH, 0]} ref={arm2Ref}>
            <mesh position={[0, ARM2_LENGTH / 2, 0]} castShadow>
              <boxGeometry args={[0.5, ARM2_LENGTH, 0.5]} />
              <meshStandardMaterial color="#d4b99b" metalness={0.3} roughness={0.7} />
            </mesh>

            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.5, 0.5, 1.0, 16]} />
              <meshStandardMaterial color="#8c7355" metalness={0.9} />
            </mesh>

            {/* Heavy Duty Gripper */}
            <group position={[0, ARM2_LENGTH, 0]} ref={gripperRef}>
              <mesh castShadow>
                <boxGeometry args={[1.0, 0.7, 1.0]} />
                <meshStandardMaterial color="#1a1614" metalness={1} roughness={0.1} />
              </mesh>
              
              {/* Palm / Sensor */}
              <mesh position={[0, 0, 0.55]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} />
                <meshStandardMaterial color="#d4b99b" emissive="#d4b99b" emissiveIntensity={3} />
              </mesh>

              {/* THE HOLDING POINT (Invisible marker between fingers) */}
              <group position={[0, 0.8, 0]} name="gripper-tip" />

              {/* Functional Fingers */}
              <group position={[0, 0.4, 0]}>
                <group ref={fingerLeftRef} position={[-0.4, 0, 0]}>
                  <mesh castShadow position={[0, 0.5, 0]}>
                    <boxGeometry args={[0.2, 1.0, 0.5]} />
                    <meshStandardMaterial color="#2a2421" metalness={1} roughness={0.1} />
                  </mesh>
                  {/* Grip Pad */}
                  <mesh position={[0.12, 0.5, 0]}>
                    <boxGeometry args={[0.05, 0.8, 0.4]} />
                    <meshStandardMaterial color="#8c7355" metalness={0.5} roughness={0.5} />
                  </mesh>
                </group>
                <group ref={fingerRightRef} position={[0.4, 0, 0]}>
                  <mesh castShadow position={[0, 0.5, 0]}>
                    <boxGeometry args={[0.2, 1.0, 0.5]} />
                    <meshStandardMaterial color="#2a2421" metalness={1} roughness={0.1} />
                  </mesh>
                  {/* Grip Pad */}
                  <mesh position={[-0.12, 0.5, 0]}>
                    <boxGeometry args={[0.05, 0.8, 0.4]} />
                    <meshStandardMaterial color="#8c7355" metalness={0.5} roughness={0.5} />
                  </mesh>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};

const InteractiveBox = ({ 
  id, 
  initialPosition, 
  pickedId, 
  setPickedId,
  allBoxesRef
}: { 
  id: string, 
  initialPosition: [number, number, number], 
  pickedId: string | null, 
  setPickedId: (id: string | null) => void,
  allBoxesRef: React.MutableRefObject<Map<string, THREE.Mesh>>
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    if (meshRef.current) allBoxesRef.current.set(id, meshRef.current);
    return () => { allBoxesRef.current.delete(id); };
  }, [id, allBoxesRef]);

  useFrame((state) => {
    const gripper = state.scene.getObjectByName('gripper-tip');
    if (!gripper || !meshRef.current) return;

    const gripperWorldPos = new THREE.Vector3();
    gripper.getWorldPosition(gripperWorldPos);
    
    const boxWorldPos = new THREE.Vector3();
    meshRef.current.getWorldPosition(boxWorldPos);

    const distance = gripperWorldPos.distanceTo(boxWorldPos);
    setIsNear(distance < GRAB_DISTANCE);

    if (pickedId === id) {
      meshRef.current.position.lerp(gripperWorldPos, 0.3);
      const gripperWorldQuat = new THREE.Quaternion();
      gripper.getWorldQuaternion(gripperWorldQuat);
      meshRef.current.quaternion.slerp(gripperWorldQuat, 0.3);
    } else {
      let targetY = FLOOR_Y;
      allBoxesRef.current.forEach((otherMesh, otherId) => {
        if (otherId === id) return;
        const distXZ = Math.sqrt(
          Math.pow(meshRef.current!.position.x - otherMesh.position.x, 2) + 
          Math.pow(meshRef.current!.position.z - otherMesh.position.z, 2)
        );
        if (distXZ < BOX_SIZE * 0.95 && otherMesh.position.y < meshRef.current!.position.y) {
          targetY = Math.max(targetY, otherMesh.position.y + BOX_SIZE);
        }
      });

      if (meshRef.current.position.y > targetY) {
        // Slow realistic descent (air resistance/smooth drop)
        meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.05);
      } else {
        meshRef.current.position.y = targetY;
      }
      
      const uprightQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), meshRef.current.rotation.y);
      meshRef.current.quaternion.slerp(uprightQuat, 0.1);
    }
  });

  useEffect(() => {
    const onAction = () => {
      if (isNear && !pickedId) setPickedId(id);
      else if (pickedId === id) setPickedId(null);
    };
    window.addEventListener('grab-action', onAction);
    return () => window.removeEventListener('grab-action', onAction);
  }, [isNear, pickedId, id, setPickedId]);

  return (
    <mesh ref={meshRef} position={initialPosition} castShadow receiveShadow>
        <boxGeometry args={[BOX_SIZE, BOX_SIZE, BOX_SIZE]} />
        <meshStandardMaterial 
          color={pickedId === id ? "#d4b99b" : (isNear ? "#f5ebe0" : "#8c7355")} 
          metalness={0.9} 
          roughness={0.1}
          emissive={pickedId === id ? "#d4b99b" : (isNear ? "#d4b99b" : "#000")}
          emissiveIntensity={pickedId === id ? 1.5 : (isNear ? 0.8 : 0)}
        />
        {/* Visual Grab Indicator Sphere */}
        {isNear && !pickedId && (
          <mesh>
            <sphereGeometry args={[BOX_SIZE * 0.8, 16, 16]} />
            <meshStandardMaterial color="#d4b99b" transparent opacity={0.2} wireframe />
          </mesh>
        )}
      </mesh>
  );
};

export const RobotArm = () => {
  const [controls, setControls] = useState<{ [key: string]: boolean }>({});
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [rotations, setRotations] = useState({
    base: 0,
    arm1: -Math.PI / 4,
    arm2: Math.PI / 2,
  });
  
  const gripperRef = useRef<THREE.Group>(null);
  const allBoxesRef = useRef<Map<string, THREE.Mesh>>(new Map());

  const initialBoxes = useMemo(() => [
    { id: 'box-1', initialPosition: [6, FLOOR_Y, 0] as [number, number, number] },
    { id: 'box-2', initialPosition: [6, FLOOR_Y, BOX_SIZE + 0.1] as [number, number, number] },
    { id: 'box-3', initialPosition: [6, FLOOR_Y, -(BOX_SIZE + 0.1)] as [number, number, number] },
    { id: 'box-4', initialPosition: [6, FLOOR_Y + BOX_SIZE, BOX_SIZE / 2] as [number, number, number] },
    { id: 'box-5', initialPosition: [6, FLOOR_Y + BOX_SIZE, -BOX_SIZE / 2] as [number, number, number] },
    { id: 'box-6', initialPosition: [6, FLOOR_Y + BOX_SIZE * 2, 0] as [number, number, number] },
  ], []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setControls(prev => ({ ...prev, [e.code]: true }));
      if (e.code === 'KeyQ') window.dispatchEvent(new CustomEvent('grab-action'));
    };
    const handleKeyUp = (e: KeyboardEvent) => setControls(prev => ({ ...prev, [e.code]: false }));

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="w-full h-full relative bg-[#1a1614]">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault position={[25, 20, 25]} fov={30} />
        <OrbitControls 
          enablePan={false} 
          maxPolarAngle={Math.PI / 2.1} 
          minDistance={20} 
          maxDistance={50} 
          makeDefault
        />
        
        <ambientLight intensity={0.2} />
        <spotLight position={[30, 40, 30]} angle={0.2} penumbra={1} intensity={4000} castShadow shadow-mapSize={[2048, 2048]} />
        <pointLight position={[-20, 30, -20]} intensity={1000} color="#8c7355" />
        <directionalLight position={[10, 30, 10]} intensity={2} color="#f5ebe0" />

        <RobotArmModel 
          controls={controls} 
          pickedId={pickedId}
          gripperRef={gripperRef}
          rotations={rotations}
          setRotations={setRotations}
        />

        {initialBoxes.map(box => (
          <InteractiveBox 
            key={box.id} 
            {...box} 
            pickedId={pickedId} 
            setPickedId={setPickedId} 
            allBoxesRef={allBoxesRef}
          />
        ))}

        <Environment preset="night" />
        <ContactShadows position={[0, -0.01, 0]} opacity={0.6} scale={60} blur={2} far={15} />
        
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
          <planeGeometry args={[150, 150]} />
          <meshStandardMaterial color="#14110f" metalness={0.8} roughness={0.3} />
        </mesh>
        <gridHelper args={[100, 50, "#2a2421", "#1a1614"]} position={[0, 0, 0]} />
      </Canvas>

      {/* MINIMAL HUD */}
      <div className="absolute top-10 left-10 pointer-events-none select-none">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 opacity-60">
            <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(212,185,155,0.8)]" />
            <span className="text-[8px] font-mono text-primary font-bold tracking-[0.5em] uppercase">Core Protocol Active</span>
          </div>
          
          <div className="flex flex-col gap-1">
            <h3 className="text-5xl font-light text-foreground tracking-tighter serif italic leading-none">Prìsma(x)</h3>
            <p className="text-[9px] font-mono text-primary/60 uppercase tracking-[0.3em] ml-1">Embodied Intelligence // Deployment 03</p>
          </div>

          <div className="flex gap-12 mt-4">
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-mono text-foreground/40 uppercase tracking-widest">Cargo State</span>
              <span className="text-xs font-bold font-mono text-primary tracking-tighter">
                {pickedId ? "» ENGAGED" : "» VACANT"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-mono text-foreground/40 uppercase tracking-widest">Hydraulics</span>
              <span className="text-xs font-bold font-mono text-primary tracking-tighter">» NOMINAL</span>
            </div>
          </div>
        </div>
      </div>

      {/* MINIMAL CONTROLS */}
      <div className="absolute bottom-10 left-10 pointer-events-none flex flex-col gap-6">
        <div className="flex gap-2">
          {['W', 'A', 'S', 'D', 'E', 'R'].map(key => (
            <kbd key={key} className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 font-mono text-xs transition-all ${controls[`Key${key}`] ? 'bg-primary text-bg-dark border-primary shadow-[0_0_20px_rgba(212,185,155,0.4)]' : 'bg-bg-dark/60 text-primary border-primary/20'}`}>{key}</kbd>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <kbd className={`px-8 h-10 flex items-center justify-center rounded-lg border-2 font-mono text-xs transition-all ${controls['KeyQ'] ? 'bg-primary text-bg-dark border-primary shadow-[0_0_25px_rgba(212,185,155,0.5)]' : 'bg-bg-dark/60 text-primary border-primary/20'}`}>Q: ACTIVATE GRIPPER</kbd>
        </div>
      </div>
    </div>
  );
};
