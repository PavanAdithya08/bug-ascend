import React from 'react';
import { Projectile } from '../types/game';

interface LaserProps {
  projectile: Projectile;
  camera: { x: number; y: number };
  canvasWidth: number;
  canvasHeight: number;
}

export const Laser: React.FC<LaserProps> = ({ projectile, camera, canvasWidth, canvasHeight }) => {
  const currentTime = Date.now();
  const age = currentTime - projectile.createdAt;
  const maxAge = 2000; // 2 seconds
  
  // Calculate fade effect - starts fading at 1.5 seconds
  const fadeStartTime = 1500;
  let opacity = 1;
  if (age > fadeStartTime) {
    const fadeProgress = (age - fadeStartTime) / (maxAge - fadeStartTime);
    opacity = Math.max(0, 1 - fadeProgress);
  }

  const laserStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${((projectile.position.x - camera.x) / canvasWidth) * 100}%`,
    top: `${((projectile.position.y - camera.y) / canvasHeight) * 100}%`,
    width: `${(projectile.width / canvasWidth) * 100}%`,
    height: `${(projectile.height / canvasHeight) * 100}%`,
    transform: 'translate(-50%, -50%)',
    backgroundColor: projectile.isPlayerProjectile ? '#00ff88' : '#ff4444',
    borderRadius: '50%',
    boxShadow: projectile.isPlayerProjectile 
      ? '0 0 8px #00ff88, 0 0 16px #00ff88' 
      : '0 0 8px #ff4444, 0 0 16px #ff4444',
    zIndex: 8,
    opacity: opacity,
    transition: age > fadeStartTime ? 'opacity 0.3s ease-out' : 'none',
  };

  return <div style={laserStyle} />;
};