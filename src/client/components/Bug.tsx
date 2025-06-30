import React from 'react';
import { Enemy } from '../types/game';

interface BugProps {
  enemy: Enemy;
  camera: { x: number; y: number };
  canvasWidth: number;
  canvasHeight: number;
}

export const Bug: React.FC<BugProps> = ({ enemy, camera, canvasWidth, canvasHeight }) => {
  const bugStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${((enemy.position.x - camera.x) / canvasWidth) * 100}%`,
    top: `${((enemy.position.y - camera.y) / canvasHeight) * 100}%`,
    width: `${(enemy.width / canvasWidth) * 100}%`,
    height: `${(enemy.height / canvasHeight) * 100}%`,
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: `${Math.min((enemy.width / canvasWidth) * 100, (enemy.height / canvasHeight) * 100) * 0.8}vmin`,
    zIndex: 5,
    filter: enemy.health < 2 ? 'brightness(0.7)' : 'none',
  };

  const emoji = enemy.type === 'bug' ? '🪲' : '👾';

  return (
    <div style={bugStyle}>
      {emoji}
    </div>
  );
};