import React, { useRef, useEffect } from "react";
import { View, PanResponder, Dimensions, Text } from "react-native";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import * as THREE from "three";

interface Props {
  mapUri: string | null;
  posX: number;
  posY: number;
  altitude: number;
  heading?: number; // 0 = North, 90 = East, clockwise
}

const { width: W, height: H } = Dimensions.get("window");
const VIEW_H = H * 0.6;

export function Map3DView({ mapUri, posX, posY, altitude, heading = 0 }: Props) {
  const rendererRef   = useRef<Renderer | null>(null);
  const cameraRef     = useRef<THREE.PerspectiveCamera | null>(null);
  const userDotRef    = useRef<THREE.Mesh | null>(null);
  const arrowGroupRef = useRef<THREE.Group | null>(null);
  const glowRingRef   = useRef<THREE.Mesh | null>(null);
  const animFrameRef  = useRef<number>(0);

  // Refs so animate loop (single closure) always reads fresh values
  const posXRef    = useRef(posX);
  const posYRef    = useRef(posY);
  const altRef     = useRef(altitude);
  const headingRef = useRef(heading);

  useEffect(() => { posXRef.current = posX; },    [posX]);
  useEffect(() => { posYRef.current = posY; },    [posY]);
  useEffect(() => { altRef.current = altitude; }, [altitude]);
  useEffect(() => { headingRef.current = heading; }, [heading]);

  const camTheta  = useRef(Math.PI / 4);
  const camPhi    = useRef(Math.PI / 3);
  const camRadius = useRef(15);
  const lastTouch = useRef<{ x: number; y: number } | null>(null);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      lastTouch.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
    },
    onPanResponderMove: (e) => {
      if (!lastTouch.current) return;
      const dx = e.nativeEvent.pageX - lastTouch.current.x;
      const dy = e.nativeEvent.pageY - lastTouch.current.y;
      camTheta.current -= dx * 0.005;
      camPhi.current = Math.max(0.2, Math.min(Math.PI / 2 - 0.05, camPhi.current - dy * 0.005));
      lastTouch.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
    },
  });

  const onContextCreate = async (gl: any) => {
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.setClearColor(0x0b1120);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / VIEW_H, 0.1, 1000);
    cameraRef.current = camera;

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Floor / map image
    if (mapUri) {
      const texture = await new THREE.TextureLoader().loadAsync(mapUri);
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 20),
        new THREE.MeshLambertMaterial({ map: texture, side: THREE.DoubleSide }),
      );
      floor.rotation.x = -Math.PI / 2;
      scene.add(floor);
    } else {
      scene.add(new THREE.GridHelper(20, 20, 0x1e3a5f, 0x1e3a5f));
    }

    // Thin walls
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.2 });
    const wh = 3;
    [
      { pos: [0, wh / 2, -10] as [number,number,number], size: [20, wh, 0.15] as [number,number,number] },
      { pos: [0, wh / 2, 10]  as [number,number,number], size: [20, wh, 0.15] as [number,number,number] },
      { pos: [-10, wh / 2, 0] as [number,number,number], size: [0.15, wh, 20] as [number,number,number] },
      { pos: [10, wh / 2, 0]  as [number,number,number], size: [0.15, wh, 20] as [number,number,number] },
    ].forEach(({ pos, size }) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(...size), wallMat);
      wall.position.set(...pos);
      scene.add(wall);
    });

    // ── User position sphere ───────────────────────────────────────────────
    const userDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 20, 20),
      new THREE.MeshBasicMaterial({ color: 0x3b82f6 }),
    );
    scene.add(userDot);
    userDotRef.current = userDot;

    // ── Direction arrow (cone pointing horizontal) ─────────────────────────
    // ConeGeometry points +Y by default; rotate X by +90° to point toward +Z.
    // Then Group rotation.y controls which compass direction it faces.
    // Heading formula: rotY = π - heading*π/180
    //   h=0(N,-Z): π - 0 = π → points -Z ✓
    //   h=90(E,+X): π - π/2 = π/2 → points +X ✓
    //   h=180(S,+Z): π - π = 0 → points +Z ✓
    const arrowCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.2, 0.55, 8),
      new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.9 }),
    );
    arrowCone.rotation.x = Math.PI / 2; // point toward +Z
    arrowCone.position.z = 0.3;         // tip 0.3 units in front

    const arrowGroup = new THREE.Group();
    arrowGroup.add(arrowCone);
    scene.add(arrowGroup);
    arrowGroupRef.current = arrowGroup;

    // ── Glow ring on the floor ─────────────────────────────────────────────
    const glowRing = new THREE.Mesh(
      new THREE.RingGeometry(0.32, 0.52, 32),
      new THREE.MeshBasicMaterial({
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
      }),
    );
    glowRing.rotation.x = -Math.PI / 2;
    scene.add(glowRing);
    glowRingRef.current = glowRing;

    // ── Render loop ────────────────────────────────────────────────────────
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      const px3 = posXRef.current * 2;
      const py3 = 0.3 + altRef.current * 0.1;
      const pz3 = -posYRef.current * 2;

      if (userDotRef.current) {
        userDotRef.current.position.set(px3, py3, pz3);
      }

      if (arrowGroupRef.current) {
        arrowGroupRef.current.position.set(px3, py3, pz3);
        arrowGroupRef.current.rotation.y = Math.PI - headingRef.current * (Math.PI / 180);
      }

      if (glowRingRef.current) {
        glowRingRef.current.position.set(px3, 0.02, pz3);
      }

      if (cameraRef.current) {
        const r = camRadius.current;
        cameraRef.current.position.set(
          r * Math.sin(camPhi.current) * Math.sin(camTheta.current),
          r * Math.cos(camPhi.current),
          r * Math.sin(camPhi.current) * Math.cos(camTheta.current),
        );
        cameraRef.current.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    animate();
  };

  useEffect(() => () => cancelAnimationFrame(animFrameRef.current), []);

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      <GLView style={{ width: W, height: VIEW_H }} onContextCreate={onContextCreate} />
      <View style={{ alignItems: "center", paddingVertical: 8 }}>
        <Text style={{ color: "#4a6a8a", fontSize: 12 }}>Geser untuk memutar tampilan 3D</Text>
      </View>
    </View>
  );
}
