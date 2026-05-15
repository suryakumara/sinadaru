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
}

const { width: W, height: H } = Dimensions.get("window");
const VIEW_H = H * 0.6;

export function Map3DView({ mapUri, posX, posY, altitude }: Props) {
  const rendererRef  = useRef<Renderer | null>(null);
  const cameraRef    = useRef<THREE.PerspectiveCamera | null>(null);
  const userDotRef   = useRef<THREE.Mesh | null>(null);
  const animFrameRef = useRef<number>(0);
  const glRef        = useRef<any>(null);

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
    glRef.current = gl;
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.setClearColor(0x1e293b);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / VIEW_H, 0.1, 1000);
    cameraRef.current = camera;

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    if (mapUri) {
      const texture = await new THREE.TextureLoader().loadAsync(mapUri);
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 20),
        new THREE.MeshLambertMaterial({ map: texture, side: THREE.DoubleSide }),
      );
      floor.rotation.x = -Math.PI / 2;
      scene.add(floor);
    } else {
      const grid = new THREE.GridHelper(20, 20, 0x334155, 0x334155);
      scene.add(grid);
    }

    const wallMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.3 });
    const wh = 3;
    [
      { pos: [0, wh / 2, -10] as [number,number,number], size: [20, wh, 0.2] as [number,number,number] },
      { pos: [0, wh / 2, 10]  as [number,number,number], size: [20, wh, 0.2] as [number,number,number] },
      { pos: [-10, wh / 2, 0] as [number,number,number], size: [0.2, wh, 20] as [number,number,number] },
      { pos: [10, wh / 2, 0]  as [number,number,number], size: [0.2, wh, 20] as [number,number,number] },
    ].forEach(({ pos, size }) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(...size), wallMat);
      wall.position.set(...pos);
      scene.add(wall);
    });

    const userDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x3b82f6 }),
    );
    scene.add(userDot);
    userDotRef.current = userDot;

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      if (userDotRef.current) {
        userDotRef.current.position.set(posX * 2, 0.3 + altitude * 0.1, -posY * 2);
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

  useEffect(() => {
    if (userDotRef.current) {
      userDotRef.current.position.set(posX * 2, 0.3 + altitude * 0.1, -posY * 2);
    }
  }, [posX, posY, altitude]);

  useEffect(() => () => cancelAnimationFrame(animFrameRef.current), []);

  return (
    <View className="flex-1" {...panResponder.panHandlers}>
      <GLView style={{ width: W, height: VIEW_H }} onContextCreate={onContextCreate} />
      <View className="items-center py-2">
        <Text className="text-slate-400 text-xs">Geser untuk memutar tampilan 3D</Text>
      </View>
    </View>
  );
}
