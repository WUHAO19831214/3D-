import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface SceneProps {
  angleL: number;
  angleM: number;
  angleR: number;
  nameL: string;
  nameM: string;
  nameR: string;
  ampL: number;
  ampM: number;
  ampR: number;
}

// Custom hook to create a wave geometry that updates over time
const Wave = ({ startZ, endZ, amplitude, anglePhase, isUnpolarized = false, color = '#00ffff' }: { 
  startZ: number, endZ: number, amplitude: number, anglePhase: number, isUnpolarized?: boolean, color?: string 
}) => {
  const lineRef = useRef<THREE.Line>(null);
  const vectorsRef = useRef<THREE.LineSegments>(null);
  
  const pointsCount = 150;
  const vectorsCount = 20;

  const { lineGeom, vectorsGeom } = useMemo(() => {
    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array((pointsCount + 1) * 3), 3));
    
    const vg = new THREE.BufferGeometry();
    vg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vectorsCount * 2 * 3), 3));
    
    return { lineGeom: lg, vectorsGeom: vg };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 5;
    const k = 2 * Math.PI / 3; // Spatial frequency

    const positions = lineGeom.attributes.position.array as Float32Array;
    for (let i = 0; i <= pointsCount; i++) {
        const u = i / pointsCount;
        const z = startZ + u * (endZ - startZ);
        const idx = i * 3;
        
        if (isUnpolarized) {
            // Unpolarized: rapidly rotating complex wave
            const r = 1.0 * Math.sin(k * z - t);
            // Twisting phase
            const phi = z * 5 + t * 0.5;
            
            positions[idx] = r * Math.cos(phi);                           // x
            positions[idx + 1] = r * Math.sin(phi);                       // y
            positions[idx + 2] = z;                                       // z
        } else {
            // Polarized: linear sine wave
            const currentAmp = Math.abs(amplitude); 
            // the amplitude sign just flips phase, which happens naturally if we do amplitude * sin
            // But if we want continuous wave, we keep amplitude sign.
            const r = amplitude * Math.sin(k * z - t);
            const rad = anglePhase * Math.PI / 180;
            // 0 degrees is vertical (along Y axis)
            positions[idx] = r * Math.sin(rad);       // x (horizontal)
            positions[idx + 1] = r * Math.cos(rad);   // y (vertical)
            positions[idx + 2] = z;                   // z
        }
    }
    lineGeom.attributes.position.needsUpdate = true;

    // Update vectors
    const vPositions = vectorsGeom.attributes.position.array as Float32Array;
    for (let i = 0; i < vectorsCount; i++) {
      const u = i / (vectorsCount - 1);
      // Don't draw vectors at the very ends to avoid visual artifacts overlapping with polarizers
      if(u < 0.05 || u > 0.95) {
         vPositions[i*6] = vPositions[i*6+1] = vPositions[i*6+2] = vPositions[i*6+3] = vPositions[i*6+4] = vPositions[i*6+5] = 0;
         continue;
      }
      const z = startZ + u * (endZ - startZ);
      
      let x = 0, y = 0;
      if (isUnpolarized) {
          const r = 1.0 * Math.sin(k * z - t);
          const phi = z * 5 + t * 0.5;
          x = r * Math.cos(phi);
          y = r * Math.sin(phi);
      } else {
          const r = amplitude * Math.sin(k * z - t);
          const rad = anglePhase * Math.PI / 180;
          x = r * Math.sin(rad);
          y = r * Math.cos(rad);
      }

      const idx = i * 6;
      // start point (on axis)
      vPositions[idx] = 0;
      vPositions[idx + 1] = 0;
      vPositions[idx + 2] = z;
      // end point (on wave)
      vPositions[idx + 3] = x;
      vPositions[idx + 4] = y;
      vPositions[idx + 5] = z;
    }
    vectorsGeom.attributes.position.needsUpdate = true;
  });

  return (
    <group>
      <line ref={lineRef} geometry={lineGeom}>
        <lineBasicMaterial color={color} linewidth={2} toneMapped={false} />
      </line>
      <lineSegments ref={vectorsRef} geometry={vectorsGeom}>
        <lineBasicMaterial color={color} transparent opacity={0.4} toneMapped={false} />
      </lineSegments>
    </group>
  );
};

const PolarizerFrame = ({ position, angle, color, name }: { position: [number, number, number], angle: number, color: string, name: string }) => {
  return (
    <group position={position}>
      {/* Outer rim */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2.2, 2.2, 0.1, 32]} />
        <meshStandardMaterial color="#ddd" roughness={0.2} metalness={0.1} transparent opacity={0.6} />
        <mesh rotation={[Math.PI / 2, 0, 0]}>
           <torusGeometry args={[2.2, 0.05, 16, 32]} />
           <meshStandardMaterial color="#ccc" />
        </mesh>
      </mesh>
      
      {/* Glass/Film */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2.1, 2.1, 0.05, 32]} />
        <meshPhysicalMaterial 
          color="#ffffff" 
          transparent={true} 
          opacity={0.15} 
          transmission={0.95} 
          roughness={0.0}
          ior={1.5}
        />
      </mesh>
      
      {/* Target Angle Slit */}
      {/* Slit line - Note negative rotation on Z to match visual math convention if needed, standard is positive CCW */}
      <mesh rotation={[0, 0, -angle * Math.PI / 180]}>
         <boxGeometry args={[0.08, 4.2, 0.1]} />
         <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>

      <Text position={[2.5, 2.5, 0]} fontSize={0.6} color="#1e293b" anchorX="center" anchorY="middle">
        {name}
      </Text>
      <Text position={[2.5, 1.8, 0]} fontSize={0.3} color="#334155" anchorX="center" anchorY="middle">
        {angle}°
      </Text>
    </group>
  );
}

export default function PolarizationScene({ angleL, angleM, angleR, nameL, nameM, nameR, ampL, ampM, ampR }: SceneProps) {
  return (
    <Canvas camera={{ position: [6, 4, 12], fov: 45 }}>
      <color attach="background" args={['#f8fafc']} /> {/* Slate 50 */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      
      <OrbitControls makeDefault />

      {/* Z Axis reference line */}
      <line>
         <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={2} array={new Float32Array([0, 0, -10, 0, 0, 10])} itemSize={3} />
         </bufferGeometry>
         <lineBasicMaterial color="#cbd5e1" transparent opacity={0.5} />
      </line>

      {/* Unpolarized light (before P1) */}
      <Wave startZ={-9} endZ={-3} amplitude={1} anglePhase={0} isUnpolarized={true} color="#334155" />
      
      {/* Left Polarizer (z = -3) */}
      <PolarizerFrame position={[0, 0, -3]} angle={angleL} color="#3b82f6" name={nameL} />

      {/* Wave after Left */}
      <Wave startZ={-3} endZ={0} amplitude={ampL} anglePhase={angleL} color="#2563eb" />
      
      {/* Middle Polarizer (z = 0) */}
      <PolarizerFrame position={[0, 0, 0]} angle={angleM} color="#ca8a04" name={nameM} />

      {/* Wave after Middle */}
      <Wave startZ={0} endZ={3} amplitude={ampM} anglePhase={angleM} color="#d97706" />

      {/* Right Polarizer (z = 3) */}
      <PolarizerFrame position={[0, 0, 3]} angle={angleR} color="#ef4444" name={nameR} />

      {/* Wave after Right */}
      <Wave startZ={3} endZ={9} amplitude={ampR} anglePhase={angleR} color="#dc2626" />

    </Canvas>
  );
}
