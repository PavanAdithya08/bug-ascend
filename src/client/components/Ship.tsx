import React, { useState, useEffect } from 'react';
import { Player } from '../types/game';
import shipImage from '../assets/player assets/ship_E.png';

interface ShipProps {
  player: Player;
  camera: { x: number; y: number };
  canvasWidth: number;
  canvasHeight: number;
}

export const Ship: React.FC<ShipProps> = ({ player, camera, canvasWidth, canvasHeight }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageError(true);
    img.src = shipImage;
  }, []);

  const shipStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${((player.position.x - camera.x) / canvasWidth) * 100}%`,
    top: `${((player.position.y - camera.y) / canvasHeight) * 100}%`,
    width: `${(player.width / canvasWidth) * 100}%`,
    height: `${(player.height / canvasHeight) * 100}%`,
    transform: 'translate(-50%, -50%)',
    transition: 'none',
    zIndex: 10,
  };

  if (imageLoaded && !imageError) {
    return (
      <img
        src={shipImage}
        alt="Player Ship"
        style={shipStyle}
        draggable={false}
        onError={() => setImageError(true)}
      />
    );
  }

  // Fallback: Red triangle
  return (
    <div
      style={{
        ...shipStyle,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: `${(player.width / canvasWidth) * 100 * 0.3}vw solid transparent`,
          borderRight: `${(player.width / canvasWidth) * 100 * 0.3}vw solid transparent`,
          borderBottom: `${(player.height / canvasHeight) * 100 * 0.8}vh solid #ff4444`,
          filter: player.health < player.maxHealth * 0.3 ? 'brightness(0.7)' : 'none',
        }}
      />
    </div>
  );
};