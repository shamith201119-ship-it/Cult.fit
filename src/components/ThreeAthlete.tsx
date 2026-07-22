import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial, Environment } from "@react-three/drei";
import * as THREE from "three";

interface AthleteProps {
  scrollProgress: number; // 0 to 5 for the 6 scenes
  mouse: { x: number; y: number };
}

// Custom Humanoid Rigged SkinnedMesh Athlete with Three.js AnimationMixer
function RiggedAthlete({ scrollProgress, mouse }: AthleteProps) {
  const groupRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  // Materials for premium sculptural Awwwards luxury brand look
  const chromeMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: 0x1a1a1a,
      metalness: 0.98,
      roughness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      reflectivity: 1.0,
      flatShading: false,
    });
  }, []);

  const carbonMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0x080808,
      metalness: 0.9,
      roughness: 0.35,
    });
  }, []);

  const glowMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: 0xff3b00,
      toneMapped: false,
    });
  }, []);

  // Construct highly detailed bone hierarchy & skinned mesh segments procedurally
  const { skeleton, bones, meshes, rootBone, headBone, chestBone, pelvisBone, spineBone, leftShoulder, leftElbow, rightShoulder, rightElbow } = useMemo(() => {
    // 1. Core skeleton bones
    const root = new THREE.Bone();
    root.name = "root";

    const pelvis = new THREE.Bone();
    pelvis.name = "pelvis";
    root.add(pelvis);

    const spine = new THREE.Bone();
    spine.name = "spine";
    spine.position.y = 0.32;
    pelvis.add(spine);

    const chest = new THREE.Bone();
    chest.name = "chest";
    chest.position.y = 0.32;
    spine.add(chest);

    const neck = new THREE.Bone();
    neck.name = "neck";
    neck.position.y = 0.2;
    chest.add(neck);

    const head = new THREE.Bone();
    head.name = "head";
    head.position.y = 0.12;
    neck.add(head);

    // Left Arm Chain
    const lShoulder = new THREE.Bone();
    lShoulder.name = "leftShoulder";
    lShoulder.position.set(-0.35, 0.15, 0);
    chest.add(lShoulder);

    const lElbow = new THREE.Bone();
    lElbow.name = "leftElbow";
    lElbow.position.set(-0.08, -0.25, 0);
    lShoulder.add(lElbow);

    const lHand = new THREE.Bone();
    lHand.name = "leftHand";
    lHand.position.set(0, -0.22, 0);
    lElbow.add(lHand);

    // Right Arm Chain
    const rShoulder = new THREE.Bone();
    rShoulder.name = "rightShoulder";
    rShoulder.position.set(0.35, 0.15, 0);
    chest.add(rShoulder);

    const rElbow = new THREE.Bone();
    rElbow.name = "rightElbow";
    rElbow.position.set(0.08, -0.25, 0);
    rShoulder.add(rElbow);

    const rHand = new THREE.Bone();
    rHand.name = "rightHand";
    rHand.position.set(0, -0.22, 0);
    rElbow.add(rHand);

    // Left Thigh & Shin
    const lThigh = new THREE.Bone();
    lThigh.name = "leftThigh";
    lThigh.position.set(-0.16, -0.15, 0);
    pelvis.add(lThigh);

    const lShin = new THREE.Bone();
    lShin.name = "leftShin";
    lShin.position.set(0, -0.35, 0);
    lThigh.add(lShin);

    const lFoot = new THREE.Bone();
    lFoot.name = "leftFoot";
    lFoot.position.set(0, -0.35, 0.04);
    lShin.add(lFoot);

    // Right Thigh & Shin
    const rThigh = new THREE.Bone();
    rThigh.name = "rightThigh";
    rThigh.position.set(0.16, -0.15, 0);
    pelvis.add(rThigh);

    const rShin = new THREE.Bone();
    rShin.name = "rightShin";
    rShin.position.set(0, -0.35, 0);
    rThigh.add(rShin);

    const rFoot = new THREE.Bone();
    rFoot.name = "rightFoot";
    rFoot.position.set(0, -0.35, 0.04);
    rShin.add(rFoot);

    const bonesList = [
      root, pelvis, spine, chest, neck, head,
      lShoulder, lElbow, lHand,
      rShoulder, rElbow, rHand,
      lThigh, lShin, lFoot,
      rThigh, rShin, rFoot
    ];

    const skeletonInstance = new THREE.Skeleton(bonesList);

    // 2. Skinned Meshes for athletic segments
    const meshesList: THREE.SkinnedMesh[] = [];

    const titaniumPBR = new THREE.MeshPhysicalMaterial({
      color: 0x161616,
      metalness: 0.98,
      roughness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      reflectivity: 1.0,
    });

    // Unified Torso Skinned Mesh
    const torsoGeom = new THREE.CylinderGeometry(0.32, 0.18, 0.75, 16, 16);
    torsoGeom.translate(0, 0.35, 0);
    const tPos = torsoGeom.attributes.position;
    const tIndices: number[] = [];
    const tWeights: number[] = [];
    for (let i = 0; i < tPos.count; i++) {
      const y = tPos.getY(i);
      if (y < 0.2) {
        tIndices.push(1, 2, 0, 0); // pelvis, spine
        tWeights.push(0.7, 0.3, 0, 0);
      } else if (y < 0.5) {
        tIndices.push(2, 3, 0, 0); // spine, chest
        tWeights.push(0.5, 0.5, 0, 0);
      } else {
        tIndices.push(3, 4, 0, 0); // chest, neck
        tWeights.push(0.8, 0.2, 0, 0);
      }
    }
    torsoGeom.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(tIndices, 4));
    torsoGeom.setAttribute("skinWeight", new THREE.Float32BufferAttribute(tWeights, 4));
    const torsoMesh = new THREE.SkinnedMesh(torsoGeom, titaniumPBR);
    torsoMesh.add(root);
    torsoMesh.bind(skeletonInstance);
    meshesList.push(torsoMesh);

    // Arms Skinned Meshes
    const armLGeom = new THREE.CylinderGeometry(0.1, 0.06, 0.48, 12, 12);
    armLGeom.translate(0, -0.24, 0);
    const alPos = armLGeom.attributes.position;
    const alIndices: number[] = [];
    const alWeights: number[] = [];
    for (let i = 0; i < alPos.count; i++) {
      const y = alPos.getY(i);
      const factor = -y / 0.48;
      alIndices.push(6, 7, 0, 0); // lShoulder, lElbow
      alWeights.push(1 - factor, factor, 0, 0);
    }
    armLGeom.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(alIndices, 4));
    armLGeom.setAttribute("skinWeight", new THREE.Float32BufferAttribute(alWeights, 4));
    const armLMesh = new THREE.SkinnedMesh(armLGeom, titaniumPBR);
    armLMesh.bind(skeletonInstance);
    meshesList.push(armLMesh);

    const armRGeom = new THREE.CylinderGeometry(0.1, 0.06, 0.48, 12, 12);
    armRGeom.translate(0, -0.24, 0);
    const arPos = armRGeom.attributes.position;
    const arIndices: number[] = [];
    const arWeights: number[] = [];
    for (let i = 0; i < arPos.count; i++) {
      const y = arPos.getY(i);
      const factor = -y / 0.48;
      arIndices.push(9, 10, 0, 0); // rShoulder, rElbow
      arWeights.push(1 - factor, factor, 0, 0);
    }
    armRGeom.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(arIndices, 4));
    armRGeom.setAttribute("skinWeight", new THREE.Float32BufferAttribute(arWeights, 4));
    const armRMesh = new THREE.SkinnedMesh(armRGeom, titaniumPBR);
    armRMesh.bind(skeletonInstance);
    meshesList.push(armRMesh);

    // Legs Skinned Meshes
    const legLGeom = new THREE.CylinderGeometry(0.14, 0.08, 0.72, 12, 12);
    legLGeom.translate(0, -0.36, 0);
    const llPos = legLGeom.attributes.position;
    const llIndices: number[] = [];
    const llWeights: number[] = [];
    for (let i = 0; i < llPos.count; i++) {
      const y = llPos.getY(i);
      const factor = -y / 0.72;
      llIndices.push(12, 13, 0, 0); // leftThigh, leftShin
      llWeights.push(1 - factor, factor, 0, 0);
    }
    legLGeom.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(llIndices, 4));
    legLGeom.setAttribute("skinWeight", new THREE.Float32BufferAttribute(llWeights, 4));
    const legLMesh = new THREE.SkinnedMesh(legLGeom, titaniumPBR);
    legLMesh.bind(skeletonInstance);
    meshesList.push(legLMesh);

    const legRGeom = new THREE.CylinderGeometry(0.14, 0.08, 0.72, 12, 12);
    legRGeom.translate(0, -0.36, 0);
    const rlPos = legRGeom.attributes.position;
    const rlIndices: number[] = [];
    const rlWeights: number[] = [];
    for (let i = 0; i < rlPos.count; i++) {
      const y = rlPos.getY(i);
      const factor = -y / 0.72;
      rlIndices.push(15, 16, 0, 0); // rightThigh, rightShin
      rlWeights.push(1 - factor, factor, 0, 0);
    }
    legRGeom.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(rlIndices, 4));
    legRGeom.setAttribute("skinWeight", new THREE.Float32BufferAttribute(rlWeights, 4));
    const legRMesh = new THREE.SkinnedMesh(legRGeom, titaniumPBR);
    legRMesh.bind(skeletonInstance);
    meshesList.push(legRMesh);

    return {
      skeleton: skeletonInstance,
      bones: bonesList,
      meshes: meshesList,
      rootBone: root,
      headBone: head,
      chestBone: chest,
      pelvisBone: pelvis,
      spineBone: spine,
      leftShoulder: lShoulder,
      leftElbow: lElbow,
      rightShoulder: rShoulder,
      rightElbow: rElbow
    };
  }, []);

  // Set up genuine Three.js AnimationMixer for continuous high-fidelity biological breathing & chest dynamics
  useEffect(() => {
    if (!groupRef.current) return;

    const mixer = new THREE.AnimationMixer(groupRef.current);

    const times = [0, 2.5, 5]; // 5 second smooth breath loop

    // Chest expansion scale
    const chestScaleTrack = new THREE.VectorKeyframeTrack(
      "chest.scale",
      times,
      [
        1, 1, 1,
        1.035, 1.045, 1.025, // Inhale
        1, 1, 1              // Exhale
      ]
    );

    // Spine breathing arch
    const spineRotTrack = new THREE.QuaternionKeyframeTrack(
      "spine.quaternion",
      times,
      [
        0, 0, 0, 1,
        0.012, 0, 0, 0.999, // slight chest swell arch
        0, 0, 0, 1
      ]
    );

    // Natural head breathing nod
    const headRotTrack = new THREE.QuaternionKeyframeTrack(
      "head.quaternion",
      times,
      [
        0, 0, 0, 1,
        -0.015, 0, 0, 0.999, // head rolls forward slightly as body opens up
        0, 0, 0, 1
      ]
    );

    const breathingClip = new THREE.AnimationClip("breathing", 5, [
      chestScaleTrack,
      spineRotTrack,
      headRotTrack
    ]);

    const breathingAction = mixer.clipAction(breathingClip);
    breathingAction.play();

    mixerRef.current = mixer;

    return () => {
      mixer.stopAllAction();
    };
  }, [rootBone]);

  // Combine independent skeletal AnimationMixer tracks with fine-grained real-time scroll & cursor matrix poses!
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // 1. Update standard continuous skeletal AnimationMixer
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }

    // 2. Scroll Pose Interpolation (Translating scenes smoothly)
    const lerpFactor = 0.08;

    // Pelvis translations
    if (pelvisBone) {
      let targetX = 0;
      let targetZ = 0;
      let targetY = -0.55;
      let targetRotY = 0;

      if (scrollProgress >= 0 && scrollProgress < 1) {
        const p = scrollProgress;
        targetX = THREE.MathUtils.lerp(0, 0.9, p);
      } else if (scrollProgress >= 1 && scrollProgress < 2) {
        const p = scrollProgress - 1;
        targetX = THREE.MathUtils.lerp(0.9, 1.15, p);
        targetRotY = THREE.MathUtils.lerp(0, -0.35, p);
      } else if (scrollProgress >= 2 && scrollProgress < 3) {
        const p = scrollProgress - 2;
        targetX = THREE.MathUtils.lerp(1.15, 1.25, p);
        targetRotY = THREE.MathUtils.lerp(-0.35, -0.15, p);
      } else if (scrollProgress >= 3 && scrollProgress < 4) {
        const p = scrollProgress - 3;
        targetX = THREE.MathUtils.lerp(1.25, 0.75, p);
        targetY = THREE.MathUtils.lerp(-0.55, -0.6, p); // squat/athletic compression
        targetRotY = THREE.MathUtils.lerp(-0.15, 0.3, p);
      } else if (scrollProgress >= 4 && scrollProgress < 5) {
        const p = scrollProgress - 4;
        targetX = THREE.MathUtils.lerp(0.75, 0.95, p);
        targetRotY = THREE.MathUtils.lerp(0.3, -0.1, p);
      } else if (scrollProgress >= 5) {
        const p = scrollProgress - 5;
        targetX = THREE.MathUtils.lerp(0.95, 0, p);
        targetZ = THREE.MathUtils.lerp(0, 1.35, p); // walks right into extreme focal view
        targetY = THREE.MathUtils.lerp(-0.55, -0.45, p);
        targetRotY = THREE.MathUtils.lerp(-0.1, 0, p);
      }

      pelvisBone.position.x = THREE.MathUtils.lerp(pelvisBone.position.x, targetX, lerpFactor);
      pelvisBone.position.z = THREE.MathUtils.lerp(pelvisBone.position.z, targetZ, lerpFactor);
      pelvisBone.position.y = THREE.MathUtils.lerp(pelvisBone.position.y, targetY, lerpFactor);
      pelvisBone.rotation.y = THREE.MathUtils.lerp(pelvisBone.rotation.y, targetRotY, lerpFactor);
    }

    // Pose shoulder & arm angles (Quaternion rotations over continuous tracks)
    let targetLS_Z = 0;
    let targetLS_X = 0;
    let targetLE_Z = -0.35;

    let targetRS_Z = 0;
    let targetRS_X = 0;
    let targetRE_Z = 0.35;

    let targetHeadX = 0;
    let targetHeadY = 0;

    if (scrollProgress < 1) {
      const p = scrollProgress;
      targetLS_Z = THREE.MathUtils.lerp(-0.1, -0.22, p);
      targetLE_Z = THREE.MathUtils.lerp(-0.3, -0.42, p);
      targetRS_Z = THREE.MathUtils.lerp(0.1, 0.22, p);
      targetRE_Z = THREE.MathUtils.lerp(0.3, 0.42, p);
    } else if (scrollProgress >= 1 && scrollProgress < 2) {
      const p = scrollProgress - 1;
      targetLS_Z = THREE.MathUtils.lerp(-0.22, -0.4, p);
      targetLS_X = THREE.MathUtils.lerp(0, 0.2, p);
      targetLE_Z = THREE.MathUtils.lerp(-0.42, -0.15, p);
      targetRS_Z = THREE.MathUtils.lerp(0.22, 0.4, p);
      targetRS_X = THREE.MathUtils.lerp(0, -0.2, p);
      targetRE_Z = THREE.MathUtils.lerp(0.42, 0.15, p);
    } else if (scrollProgress >= 2 && scrollProgress < 3) {
      const p = scrollProgress - 2;
      // Cross Arms pose
      targetLS_Z = THREE.MathUtils.lerp(-0.4, -0.85, p);
      targetLS_X = THREE.MathUtils.lerp(0.2, 0.85, p);
      targetLE_Z = THREE.MathUtils.lerp(-0.15, -1.3, p);

      targetRS_Z = THREE.MathUtils.lerp(0.4, 0.85, p);
      targetRS_X = THREE.MathUtils.lerp(-0.2, 0.85, p);
      targetRE_Z = THREE.MathUtils.lerp(0.15, 1.3, p);

      targetHeadY = THREE.MathUtils.lerp(0, -0.38, p);
    } else if (scrollProgress >= 3 && scrollProgress < 4) {
      const p = scrollProgress - 3;
      // Wrist strapping stance
      targetLS_Z = THREE.MathUtils.lerp(-0.85, -0.45, p);
      targetLS_X = THREE.MathUtils.lerp(0.85, 0.5, p);
      targetLE_Z = THREE.MathUtils.lerp(-1.3, -0.95, p);

      targetRS_Z = THREE.MathUtils.lerp(0.85, 0.25, p);
      targetRS_X = THREE.MathUtils.lerp(0.85, 0.65, p);
      targetRE_Z = THREE.MathUtils.lerp(1.3, 0.75, p);

      targetHeadY = THREE.MathUtils.lerp(-0.38, 0.12, p);
      targetHeadX = THREE.MathUtils.lerp(0, 0.18, p);
    } else if (scrollProgress >= 4 && scrollProgress < 5) {
      const p = scrollProgress - 4;
      // Shoulder rolling / Looking Up to heaven lights
      targetLS_Z = THREE.MathUtils.lerp(-0.45, -0.25, p);
      targetLS_X = THREE.MathUtils.lerp(0.5, -0.15 + Math.sin(t * 3.8) * 0.18, p);
      targetLE_Z = THREE.MathUtils.lerp(-0.95, -0.25, p);

      targetRS_Z = THREE.MathUtils.lerp(0.25, 0.25, p);
      targetRS_X = THREE.MathUtils.lerp(0.65, -0.15 - Math.sin(t * 3.8) * 0.18, p);
      targetRE_Z = THREE.MathUtils.lerp(0.75, 0.25, p);

      targetHeadX = THREE.MathUtils.lerp(0.18, -0.45, p); // dramatic upper focal glance
      targetHeadY = THREE.MathUtils.lerp(0.12, 0, p);
    } else if (scrollProgress >= 5) {
      const p = scrollProgress - 5;
      // Walks forward closer to the screen
      targetLS_Z = THREE.MathUtils.lerp(-0.25, -0.12, p);
      targetLS_X = THREE.MathUtils.lerp(-0.15, 0.25, p);
      targetLE_Z = THREE.MathUtils.lerp(-0.25, -0.4, p);

      targetRS_Z = THREE.MathUtils.lerp(0.25, 0.12, p);
      targetRS_X = THREE.MathUtils.lerp(-0.15, -0.25, p);
      targetRE_Z = THREE.MathUtils.lerp(0.25, 0.4, p);

      targetHeadX = THREE.MathUtils.lerp(-0.45, -0.05, p);
    }

    // Apply rotations with smooth organic damping
    if (leftShoulder) {
      leftShoulder.rotation.z = THREE.MathUtils.lerp(leftShoulder.rotation.z, targetLS_Z, lerpFactor);
      leftShoulder.rotation.x = THREE.MathUtils.lerp(leftShoulder.rotation.x, targetLS_X, lerpFactor);
    }
    if (leftElbow) {
      leftElbow.rotation.z = THREE.MathUtils.lerp(leftElbow.rotation.z, targetLE_Z, lerpFactor);
    }
    if (rightShoulder) {
      rightShoulder.rotation.z = THREE.MathUtils.lerp(rightShoulder.rotation.z, targetRS_Z, lerpFactor);
      rightShoulder.rotation.x = THREE.MathUtils.lerp(rightShoulder.rotation.x, targetRS_X, lerpFactor);
    }
    if (rightElbow) {
      rightElbow.rotation.z = THREE.MathUtils.lerp(rightElbow.rotation.z, targetRE_Z, lerpFactor);
    }

    // Mix interactive cursor displacement into the final head look target
    if (headBone) {
      const finalHeadX = targetHeadX + mouse.y * 0.12;
      const finalHeadY = targetHeadY + mouse.x * 0.14;
      headBone.rotation.x = THREE.MathUtils.lerp(headBone.rotation.x, finalHeadX, lerpFactor);
      headBone.rotation.y = THREE.MathUtils.lerp(headBone.rotation.y, finalHeadY, lerpFactor);
    }
  });

  return (
    <group ref={groupRef}>
      {/* 1. Rigged bone primitive hierarchy root */}
      <primitive object={rootBone} />

      {/* 2. Procedural Rigged SkinnedMesh body segments */}
      {meshes.map((mesh, idx) => (
        <primitive key={idx} object={mesh} />
      ))}

      {/* 3. Sculptural visual chest overlays bound to chest bone for flawless athletic posture deforming */}
      {chestBone && (
        <primitive object={chestBone}>
          {/* Futuristic glowing core representing athletic bio-energy */}
          <mesh position={[0, 0.08, 0.22]} material={glowMaterial}>
            <sphereGeometry args={[0.045, 16, 16]} />
          </mesh>
          {/* Muscular pectoral plates that contract and expand organically */}
          <mesh position={[-0.14, 0.15, 0.18]} rotation={[0.05, 0.1, 0]} material={chromeMaterial}>
            <sphereGeometry args={[0.15, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          </mesh>
          <mesh position={[0.14, 0.15, 0.18]} rotation={[0.05, -0.1, 0]} material={chromeMaterial}>
            <sphereGeometry args={[0.15, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          </mesh>
          {/* Carbon spinal column protector plate on the back */}
          <mesh position={[0, 0.0, -0.16]} material={carbonMaterial}>
            <boxGeometry args={[0.07, 0.45, 0.08]} />
          </mesh>
        </primitive>
      )}

      {/* 4. Elegant sculpted visor & head details bound directly to head bone */}
      {headBone && (
        <primitive object={headBone}>
          {/* Main sleek sculptural athletic helmet face */}
          <mesh position={[0, 0.06, 0.02]} material={chromeMaterial}>
            <sphereGeometry args={[0.16, 32, 32]} />
          </mesh>
          {/* Sleek carbon fiber jaw contour */}
          <mesh position={[0, -0.06, 0.07]} rotation={[0.25, 0, 0]} material={carbonMaterial}>
            <boxGeometry args={[0.12, 0.05, 0.13]} />
          </mesh>
          {/* High-End orange/amber neon glowing energy visor */}
          <mesh position={[0, 0.08, 0.115]} rotation={[-0.1, 0, 0]} material={glowMaterial}>
            <boxGeometry args={[0.2, 0.024, 0.06]} />
          </mesh>
        </primitive>
      )}
    </group>
  );
}

// Cinematic Camera Controller reacting to scroll and mouse
function CinematicCamera({ scrollProgress, mouse }: AthleteProps) {
  const { camera } = useThree();

  useFrame(() => {
    // Standard base positions for camera per scene
    let targetX = 0;
    let targetY = 0.3;
    let targetZ = 3.6;
    let targetFov = 40;

    // Camera paths based on scroll:
    if (scrollProgress >= 0 && scrollProgress < 1) {
      // Scene 1: Camera floats in center, slightly low angle looking up
      const p = scrollProgress;
      targetX = THREE.MathUtils.lerp(0, 0.3, p);
      targetY = THREE.MathUtils.lerp(0.3, 0.4, p);
      targetZ = THREE.MathUtils.lerp(3.6, 3.4, p);
    } else if (scrollProgress >= 1 && scrollProgress < 2) {
      // Scene 2: Camera pans left (to look at athlete shifted right), zoom out slightly for depth
      const p = scrollProgress - 1;
      targetX = THREE.MathUtils.lerp(0.3, -0.4, p);
      targetY = THREE.MathUtils.lerp(0.4, 0.3, p);
      targetZ = THREE.MathUtils.lerp(3.4, 3.7, p);
    } else if (scrollProgress >= 2 && scrollProgress < 3) {
      // Scene 3: Extreme macro view on crossed arms, tight focal zoom
      const p = scrollProgress - 2;
      targetX = THREE.MathUtils.lerp(-0.4, 0.2, p);
      targetY = THREE.MathUtils.lerp(0.3, 0.1, p);
      targetZ = THREE.MathUtils.lerp(3.7, 2.5, p); // Close-up
    } else if (scrollProgress >= 3 && scrollProgress < 4) {
      // Scene 4: Ground-level dramatic low angle, brighter lights
      const p = scrollProgress - 3;
      targetX = THREE.MathUtils.lerp(0.2, -0.5, p);
      targetY = THREE.MathUtils.lerp(0.1, -0.2, p); // very low angle
      targetZ = THREE.MathUtils.lerp(2.5, 3.2, p);
    } else if (scrollProgress >= 4 && scrollProgress < 5) {
      // Scene 5: High angle looking down at shoulders rolling
      const p = scrollProgress - 4;
      targetX = THREE.MathUtils.lerp(-0.5, 0.3, p);
      targetY = THREE.MathUtils.lerp(-0.2, 0.6, p); // elevated camera
      targetZ = THREE.MathUtils.lerp(3.2, 3.0, p);
    } else if (scrollProgress >= 5) {
      // Scene 6: Dramatic close-up zoom forward (tracking walking athlete)
      const p = scrollProgress - 5;
      targetX = THREE.MathUtils.lerp(0.3, 0.0, p);
      targetY = THREE.MathUtils.lerp(0.6, 0.2, p);
      targetZ = THREE.MathUtils.lerp(3.0, 1.8, p); // Extreme zoom
    }

    // Add subtle ambient camera breathing + organic mouse lag
    const breathOffset = Math.sin(Date.now() * 0.001) * 0.04;
    const smoothFactor = 0.06;

    const finalX = targetX + mouse.x * 0.3;
    const finalY = targetY + mouse.y * 0.25 + breathOffset;
    const finalZ = targetZ;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, finalX, smoothFactor);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, finalY, smoothFactor);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, finalZ, smoothFactor);
    
    // Always keep focus point locked on the chest/torso area of the athlete
    const focusY = THREE.MathUtils.lerp(0.1, -0.1, scrollProgress / 5);
    camera.lookAt(new THREE.Vector3(0, focusY, 0));
  });

  return null;
}

// Custom interactive shader-based dust and smoke particle system
const smokeVertexShader = `
  uniform float uPixelRatio;

  attribute float aLife;
  attribute float aAngle;
  attribute float aSize;
  attribute float aType;

  varying float vLife;
  varying float vAngle;
  varying float vType;

  void main() {
    vLife = aLife;
    vAngle = aAngle;
    vType = aType;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size attenuation depending on camera distance
    float finalSize = aSize;
    if (aType == 0.0) {
      gl_PointSize = finalSize * (320.0 / -mvPosition.z) * uPixelRatio;
    } else {
      gl_PointSize = finalSize * (420.0 / -mvPosition.z) * uPixelRatio;
    }
  }
`;

const smokeFragmentShader = `
  uniform float uTime;

  varying float vLife;
  varying float vAngle;
  varying float vType;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
               mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
  }

  void main() {
    vec2 coords = gl_PointCoord - 0.5;
    float dist = length(coords);
    if (dist > 0.5) discard;

    if (vType == 0.0) {
      // Ambient sparking embers
      float alpha = smoothstep(0.5, 0.1, dist);
      float sparkle = 0.5 + 0.5 * sin(uTime * 4.5 + coords.x * 25.0);
      vec3 color = vec3(1.0, 0.42, 0.05); // neon orange amber
      gl_FragColor = vec4(color, alpha * 0.75 * sparkle * vLife);
    } else {
      // Volumetric additive self-illuminated solar smoke
      float c = cos(vAngle);
      float s = sin(vAngle);
      vec2 rotatedCoords = vec2(coords.x * c - coords.y * s, coords.x * s + coords.y * c);

      float mask = smoothstep(0.5, 0.05, dist);

      vec2 noiseUV = (rotatedCoords + 0.5) * 4.0;
      float n1 = noise(noiseUV + vec2(uTime * 0.35, uTime * -0.15));
      float n2 = noise(noiseUV * 2.0 - vec2(uTime * 0.1, uTime * 0.25));
      float fbmNoise = mix(n1, n2, 0.45);

      float smokeAlpha = mask * (0.18 + 0.82 * fbmNoise);

      float lifeFactor = vLife;
      float fadeIn = smoothstep(0.0, 0.22, 1.0 - lifeFactor);
      float fadeOut = smoothstep(0.0, 0.8, lifeFactor);
      smokeAlpha *= fadeIn * fadeOut;

      // Beautiful amber/neon color spectrum: white-hot core -> electric amber -> deep smoldering red/orange edges
      vec3 coreColor = vec3(1.0, 0.88, 0.55);
      vec3 midColor = vec3(1.0, 0.3, 0.02);
      vec3 edgeColor = vec3(0.52, 0.03, 0.0);
      
      vec3 smokeColor = mix(
        mix(edgeColor, midColor, smoothstep(0.48, 0.18, dist)),
        coreColor,
        smoothstep(0.18, 0.0, dist) * 0.85
      );

      gl_FragColor = vec4(smokeColor, smokeAlpha * 0.38);
    }
  }
`;

function InterstellarDust({ mouse }: { mouse: { x: number; y: number } }) {
  const count = 1200;
  
  // Initialize state
  const stateData = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const lives = new Float32Array(count);
    const decays = new Float32Array(count);
    const sizes = new Float32Array(count);
    const angles = new Float32Array(count);
    const spins = new Float32Array(count);
    const types = new Float32Array(count);
    const velocities = new Float32Array(count * 3);

    // Initialize Ambient Dust (first 600 particles)
    for (let i = 0; i < 600; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;

      velocities[i * 3] = (Math.random() - 0.5) * 0.15;
      velocities[i * 3 + 1] = 0.08 + Math.random() * 0.18; // upward slow drift
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.15;

      lives[i] = 0.5 + Math.random() * 0.5;
      decays[i] = 0.0;
      sizes[i] = 0.015 + Math.random() * 0.025;
      angles[i] = Math.random() * Math.PI * 2;
      spins[i] = (Math.random() - 0.5) * 0.2;
      types[i] = 0.0; // Ambient Dust
    }

    // Initialize Mouse Trail (next 600 particles)
    for (let i = 600; i < count; i++) {
      positions[i * 3] = 999.0;
      positions[i * 3 + 1] = 999.0;
      positions[i * 3 + 2] = 999.0;

      velocities[i * 3] = 0.0;
      velocities[i * 3 + 1] = 0.0;
      velocities[i * 3 + 2] = 0.0;

      lives[i] = 0.0; // Inactive initially
      decays[i] = 0.45 + Math.random() * 0.45; // decays in ~1.1 to 2.2s
      sizes[i] = 0.18 + Math.random() * 0.16;
      angles[i] = Math.random() * Math.PI * 2;
      spins[i] = (Math.random() - 0.5) * 2.0;
      types[i] = 1.0; // Smoke Trail
    }

    return { positions, velocities, lives, decays, sizes, angles, spins, types };
  }, []);

  const pointsRef = useRef<THREE.Points>(null);
  const nextTrailIndexRef = useRef(600);
  const prevMouse3D = useRef<THREE.Vector3 | null>(null);
  const prevMouseVal = useRef({ x: 0, y: 0 });

  const uniforms = useMemo(() => {
    return {
      uTime: { value: 0 },
      uPixelRatio: { value: 1.0 },
    };
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const { camera } = state;
    const deltaSec = Math.min(0.03, delta); // Cap delta to avoid crazy skips when unfocused

    // 1. Project 2D screen mouse coordinates to 3D scene space on a plane facing camera
    const mouse3D = new THREE.Vector3(mouse.x, mouse.y, 0.5);
    mouse3D.unproject(camera);
    const dir = mouse3D.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z; // assuming plane at z=0 near athlete
    const currentMouse3D = camera.position.clone().add(dir.multiplyScalar(distance));

    // 2. Calculate mouse movement velocity in 3D space
    const mouseVel = new THREE.Vector3();
    if (prevMouse3D.current) {
      mouseVel.copy(currentMouse3D).sub(prevMouse3D.current).multiplyScalar(1 / Math.max(0.008, deltaSec));
    }

    // 3. Track mouse 2D speed to scale spawning volume
    const dx2d = mouse.x - prevMouseVal.current.x;
    const dy2d = mouse.y - prevMouseVal.current.y;
    const mouseSpeed = Math.sqrt(dx2d * dx2d + dy2d * dy2d);
    prevMouseVal.current = { x: mouse.x, y: mouse.y };

    // 4. Determine how many new smoke particles to spawn
    let spawnCount = 0;
    if (mouseSpeed > 0.002) {
      spawnCount = Math.min(8, Math.floor(mouseSpeed * 250.0) + 1);
    } else {
      // Small continuous emission when idle (20% chance per frame)
      if (Math.random() < 0.20) {
        spawnCount = 1;
      }
    }

    const spawnTrailParticle = (pos: THREE.Vector3, velX: number, velY: number, velZ: number) => {
      const idx = nextTrailIndexRef.current;
      
      // Spawn centered at target position with a bit of volumetric spread
      stateData.positions[idx * 3] = pos.x + (Math.random() - 0.5) * 0.15;
      stateData.positions[idx * 3 + 1] = pos.y + (Math.random() - 0.5) * 0.15;
      stateData.positions[idx * 3 + 2] = pos.z + (Math.random() - 0.5) * 0.15;

      // Transfer mouse physical velocity + push upwards
      stateData.velocities[idx * 3] = velX * 0.35 + (Math.random() - 0.5) * 0.35;
      stateData.velocities[idx * 3 + 1] = velY * 0.35 + 0.35 + Math.random() * 0.45; // upward buoyancy draft
      stateData.velocities[idx * 3 + 2] = velZ * 0.35 + (Math.random() - 0.5) * 0.35;

      stateData.lives[idx] = 1.0; // Reset life
      stateData.decays[idx] = 0.45 + Math.random() * 0.45;
      stateData.sizes[idx] = 0.18 + Math.random() * 0.18;
      stateData.angles[idx] = Math.random() * Math.PI * 2;
      stateData.spins[idx] = (Math.random() - 0.5) * 2.0;

      // Advance ring buffer index
      nextTrailIndexRef.current++;
      if (nextTrailIndexRef.current >= count) {
        nextTrailIndexRef.current = 600; // recycle pool
      }
    };

    // 5. Interpolate spawning to guarantee continuous ribbon look when dragging fast
    if (spawnCount > 0) {
      if (prevMouse3D.current) {
        for (let k = 0; k < spawnCount; k++) {
          const ratio = k / spawnCount;
          const interpPos = new THREE.Vector3().lerpVectors(prevMouse3D.current, currentMouse3D, ratio);
          spawnTrailParticle(interpPos, mouseVel.x, mouseVel.y, mouseVel.z);
        }
      } else {
        spawnTrailParticle(currentMouse3D, 0, 0, 0);
      }
    }

    // Save previous mouse position
    if (!prevMouse3D.current) {
      prevMouse3D.current = new THREE.Vector3();
    }
    prevMouse3D.current.copy(currentMouse3D);

    // 6. Update attributes of all active particles
    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position;
    const lifeAttr = geo.attributes.aLife;
    const sizeAttr = geo.attributes.aSize;
    const angleAttr = geo.attributes.aAngle;

    for (let i = 0; i < count; i++) {
      if (stateData.types[i] === 0.0) {
        // --- Ambient Dust Particle Physics ---
        // Float slowly
        stateData.positions[i * 3] += stateData.velocities[i * 3] * deltaSec;
        stateData.positions[i * 3 + 1] += stateData.velocities[i * 3 + 1] * deltaSec;
        stateData.positions[i * 3 + 2] += stateData.velocities[i * 3 + 2] * deltaSec;

        // Subtle swirling turbulence
        stateData.positions[i * 3] += Math.sin(state.clock.getElapsedTime() * 0.4 + i) * 0.003;
        stateData.positions[i * 3 + 2] += Math.cos(state.clock.getElapsedTime() * 0.4 + i) * 0.003;

        // Repel dust organically from mouse cursor 3D position
        const dx = stateData.positions[i * 3] - currentMouse3D.x;
        const dy = stateData.positions[i * 3 + 1] - currentMouse3D.y;
        const dz = stateData.positions[i * 3 + 2] - currentMouse3D.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < 1.4) {
          const pushForce = (1.4 - dist) * 0.035;
          stateData.positions[i * 3] += (dx / Math.max(0.01, dist)) * pushForce;
          stateData.positions[i * 3 + 1] += (dy / Math.max(0.01, dist)) * pushForce;
          stateData.positions[i * 3 + 2] += (dz / Math.max(0.01, dist)) * pushForce;
        }

        // Loop bounds
        if (stateData.positions[i * 3 + 1] > 3.0) stateData.positions[i * 3 + 1] = -3.0;
        if (stateData.positions[i * 3] > 4.5) stateData.positions[i * 3] = -4.5;
        if (stateData.positions[i * 3] < -4.5) stateData.positions[i * 3] = 4.5;
        if (stateData.positions[i * 3 + 2] > 3.0) stateData.positions[i * 3 + 2] = -3.0;
        if (stateData.positions[i * 3 + 2] < -3.0) stateData.positions[i * 3 + 2] = 3.0;

        // Sparkle oscillation
        stateData.lives[i] = 0.5 + 0.5 * Math.sin(state.clock.getElapsedTime() * 1.5 + i);

      } else {
        // --- Active Mouse Smoke Trail Particle Physics ---
        if (stateData.lives[i] > 0) {
          stateData.lives[i] -= stateData.decays[i] * deltaSec;

          if (stateData.lives[i] <= 0) {
            stateData.lives[i] = 0;
            // Move off screen
            stateData.positions[i * 3] = 999.0;
            stateData.positions[i * 3 + 1] = 999.0;
            stateData.positions[i * 3 + 2] = 999.0;
            stateData.sizes[i] = 0;
          } else {
            // Apply drift velocity
            stateData.positions[i * 3] += stateData.velocities[i * 3] * deltaSec;
            stateData.positions[i * 3 + 1] += stateData.velocities[i * 3 + 1] * deltaSec;
            stateData.positions[i * 3 + 2] += stateData.velocities[i * 3 + 2] * deltaSec;

            // Apply air resistance drag (gradual decelerate)
            stateData.velocities[i * 3] *= 0.94;
            stateData.velocities[i * 3 + 1] *= 0.94;
            stateData.velocities[i * 3 + 2] *= 0.94;

            // Upward float acceleration (heat buoyancy)
            stateData.velocities[i * 3 + 1] += 0.18 * deltaSec;

            // Swirling organic wind currents
            const swirlRate = 2.4;
            const swirlForce = 0.16;
            stateData.positions[i * 3] += Math.sin(state.clock.getElapsedTime() * swirlRate + i) * swirlForce * deltaSec;
            stateData.positions[i * 3 + 2] += Math.cos(state.clock.getElapsedTime() * swirlRate + i) * swirlForce * deltaSec;

            // Spin the puff
            stateData.angles[i] += stateData.spins[i] * deltaSec;

            // Billow outwards: expand size as life goes down
            const age = 1.0 - stateData.lives[i];
            stateData.sizes[i] = (0.16 + age * 0.58); // Expand up to 0.74 width
          }
        }
      }

      // Update geometry buffers
      const idx3 = i * 3;
      posAttr.setXYZ(i, stateData.positions[idx3], stateData.positions[idx3 + 1], stateData.positions[idx3 + 2]);
      lifeAttr.setX(i, stateData.lives[i]);
      sizeAttr.setX(i, stateData.sizes[i]);
      angleAttr.setX(i, stateData.angles[i]);
    }

    posAttr.needsUpdate = true;
    lifeAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;
    angleAttr.needsUpdate = true;

    // Update uniform values
    if (pointsRef.current) {
      const mat = pointsRef.current.material as THREE.ShaderMaterial;
      if (mat.uniforms) {
        if (mat.uniforms.uTime) mat.uniforms.uTime.value = state.clock.getElapsedTime();
        if (mat.uniforms.uPixelRatio) mat.uniforms.uPixelRatio.value = Math.min(2.0, state.viewport.dpr);
      }
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[stateData.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-aLife"
          args={[stateData.lives, 1]}
        />
        <bufferAttribute
          attach="attributes-aSize"
          args={[stateData.sizes, 1]}
        />
        <bufferAttribute
          attach="attributes-aAngle"
          args={[stateData.angles, 1]}
        />
        <bufferAttribute
          attach="attributes-aType"
          args={[stateData.types, 1]}
        />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={smokeVertexShader}
        fragmentShader={smokeFragmentShader}
        uniforms={uniforms}
      />
    </points>
  );
}

// Industrial Volumetric Fog & Atmospheric Light Rays
function VolumetricAtmosphere({ scrollProgress, mouse }: AthleteProps) {
  const lightRef = useRef<THREE.SpotLight>(null);
  const rimLightRef = useRef<THREE.DirectionalLight>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Light flicker/breathing
    if (lightRef.current) {
      // Brighter lights in Scene 4 (Science & Discipline)
      const baseIntensity = scrollProgress >= 3 && scrollProgress < 4 ? 35 : 22;
      lightRef.current.intensity = baseIntensity + Math.sin(t * 8) * 1.5 + Math.cos(t * 2.2) * 1.2;
      
      // Track mouse slightly for light ray bend
      lightRef.current.position.x = -2.5 + mouse.x * 0.6;
      lightRef.current.position.y = 3.5 + mouse.y * 0.4;
    }

    if (rimLightRef.current) {
      // Rim highlight updates based on scroll
      const rimIntensity = scrollProgress >= 4 ? 12 : 7.5;
      rimLightRef.current.intensity = rimIntensity + Math.sin(t * 2) * 0.4;
    }
  });

  return (
    <>
      {/* Cinematic Main Key Spotlight */}
      <spotLight
        ref={lightRef}
        color="#ff4400"
        position={[-2.5, 3.5, 3]}
        angle={0.4}
        penumbra={1}
        intensity={22}
        castShadow
        shadow-bias={-0.0001}
      />

      {/* Extreme Rim Spotlight from behind creating majestic silhouettes */}
      <directionalLight
        ref={rimLightRef}
        color="#ffffff"
        position={[2, 1, -2.5]}
        intensity={7.5}
      />

      {/* Ground Amber fill/glow */}
      <pointLight
        color="#ff7700"
        position={[0, -1.5, 0.5]}
        intensity={3.5}
        distance={4.5}
      />

      {/* Atmospheric blue/teal steel cool backdrop light */}
      <pointLight
        color="#0066aa"
        position={[-3, -1, -2]}
        intensity={5.0}
        distance={8}
      />
    </>
  );
}

export default function ThreeAthleteScene({ scrollProgress, mouse }: AthleteProps) {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-10 overflow-hidden">
      <Canvas
        className="w-full h-full pointer-events-none"
        shadows
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
      >
        {/* Soft elegant studio fill light */}
        <ambientLight intensity={0.16} />
        
        {/* Cinematic studio environment mapping for high-contrast PBR reflections */}
        <Environment preset="night" />

        {/* Live Animated Rigged Athlete */}
        <RiggedAthlete scrollProgress={scrollProgress} mouse={mouse} />

        {/* Ambient Drifting Spark Particles */}
        <InterstellarDust mouse={mouse} />

        {/* Dynamic Industrial Lights & Rim Highlights */}
        <VolumetricAtmosphere scrollProgress={scrollProgress} mouse={mouse} />

        {/* Cinematic Scroll Controlled Camera */}
        <CinematicCamera scrollProgress={scrollProgress} mouse={mouse} />
      </Canvas>
    </div>
  );
}
