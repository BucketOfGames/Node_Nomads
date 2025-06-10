import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../stores/gameStore';
import { GameNode, GameEdge } from '../types/game';

const NodeComponent: React.FC<{ 
  node: GameNode; 
  onClick: (nodeId: string) => void;
  playerFaction?: string;
}> = ({ node, onClick, playerFaction }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Determine node color based on ownership
  const getNodeColor = () => {
    if (!node.owner_id) return '#444444'; // Neutral - dark gray
    if (playerFaction === 'red') {
      return node.owner_id ? '#ef4444' : '#444444'; // Red or neutral
    } else {
      return node.owner_id ? '#3b82f6' : '#444444'; // Blue or neutral
    }
  };

  const nodeColor = getNodeColor();
  const radius = 0.75 + (node.fortify_lvl * 0.1);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle pulsing animation for owned nodes
      if (node.owner_id) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
        meshRef.current.scale.setScalar(scale);
      }
      
      // Hover effect
      if (hovered) {
        meshRef.current.scale.multiplyScalar(1.1);
      }
    }
  });

  return (
    <group position={[node.x, node.y, 0]}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick(node.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <circleGeometry args={[radius, 16]} />
        <meshBasicMaterial 
          color={nodeColor} 
          transparent 
          opacity={hovered ? 0.9 : 0.7}
        />
      </mesh>
      
      {/* Fortification rings */}
      {node.fortify_lvl > 0 && (
        <mesh>
          <ringGeometry args={[radius + 0.2, radius + 0.3, 16]} />
          <meshBasicMaterial color={nodeColor} transparent opacity={0.5} />
        </mesh>
      )}

      {/* Charge indicator */}
      {node.charge > 0 && (
        <Text
          position={[0, 0, 0.1]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {node.charge}
        </Text>
      )}
    </group>
  );
};

const EdgeComponent: React.FC<{ 
  edge: GameEdge; 
  nodes: GameNode[];
  onClick: (srcId: string, dstId: string) => void;
  playerFaction?: string;
}> = ({ edge, nodes, onClick, playerFaction }) => {
  const lineRef = useRef<THREE.Line>(null);
  const [hovered, setHovered] = useState(false);

  const srcNode = nodes.find(n => n.id === edge.src_id);
  const dstNode = nodes.find(n => n.id === edge.dst_id);

  if (!srcNode || !dstNode) return null;

  const points = [
    new THREE.Vector3(srcNode.x, srcNode.y, -0.1),
    new THREE.Vector3(dstNode.x, dstNode.y, -0.1)
  ];

  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  // Determine edge color
  const getEdgeColor = () => {
    if (!edge.owner_id) return '#666666';
    return playerFaction === 'red' ? '#ef4444' : '#3b82f6';
  };

  return (
    <line
      ref={lineRef}
      geometry={geometry}
      onClick={(e) => {
        e.stopPropagation();
        onClick(edge.src_id, edge.dst_id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      <lineBasicMaterial 
        color={getEdgeColor()} 
        linewidth={hovered ? 6 : 4}
        transparent
        opacity={hovered ? 0.9 : 0.6}
      />
    </line>
  );
};

const GameCamera: React.FC<{ playerNodes: GameNode[] }> = ({ playerNodes }) => {
  const { camera } = useThree();

  useEffect(() => {
    if (playerNodes.length > 0) {
      // Center camera on player's nodes
      const avgX = playerNodes.reduce((sum, node) => sum + node.x, 0) / playerNodes.length;
      const avgY = playerNodes.reduce((sum, node) => sum + node.y, 0) / playerNodes.length;
      
      camera.position.set(avgX, avgY, 20);
    } else {
      // Default position
      camera.position.set(0, 0, 20);
    }
  }, [playerNodes, camera]);

  return null;
};

export const GameScene: React.FC = () => {
  const { 
    nodes, 
    edges, 
    player, 
    captureNode, 
    fortifyNode, 
    raidEdge 
  } = useGameStore();

  const handleNodeClick = async (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node || !player) return;

    if (!node.owner_id) {
      // Capture neutral node
      await captureNode(nodeId);
    } else if (node.owner_id === player.id) {
      // Fortify owned node
      await fortifyNode(nodeId);
    }
  };

  const handleEdgeClick = async (srcId: string, dstId: string) => {
    const edge = edges.find(e => e.src_id === srcId && e.dst_id === dstId);
    if (!edge || !player) return;

    // Only allow raiding rival edges
    if (edge.owner_id && edge.owner_id !== player.id) {
      await raidEdge(srcId, dstId);
    }
  };

  const playerNodes = nodes.filter(node => node.owner_id === player?.id);

  return (
    <div className="w-full h-full bg-gray-900">
      <Canvas camera={{ position: [0, 0, 20], fov: 75 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} />
        
        <GameCamera playerNodes={playerNodes} />
        
        {/* Render edges first (behind nodes) */}
        {edges.map((edge) => (
          <EdgeComponent
            key={`${edge.src_id}-${edge.dst_id}`}
            edge={edge}
            nodes={nodes}
            onClick={handleEdgeClick}
            playerFaction={player?.faction}
          />
        ))}
        
        {/* Render nodes */}
        {nodes.map((node) => (
          <NodeComponent
            key={node.id}
            node={node}
            onClick={handleNodeClick}
            playerFaction={player?.faction}
          />
        ))}
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={false}
          minZoom={0.5}
          maxZoom={10}
          panSpeed={2}
          zoomSpeed={1.5}
        />
      </Canvas>
    </div>
  );
};