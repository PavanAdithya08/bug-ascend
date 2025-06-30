import React from 'react';
import { PowerUp as PowerUpType } from '../types/game';

interface PowerUpProps {
  powerUp: PowerUpType;
  camera: { x: number; y: number };
  canvasWidth: number;
  canvasHeight: number;
}

const powerUpEmojis = {
  health: '💊',
  shield: '🛡️',
  weapon: '⚡',
  speed: '🚀',
};

export const PowerUp: React.FC<PowerUpProps> = ({ powerUp, camera, canvasWidth, canvasHeight }) => {
  const powerUpStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${((powerUp.position.x - camera.x) / canvasWidth) * 100}%`,
    top: `${((powerUp.position.y - camera.y) / canvasHeight) * 100}%`,
    width: `${(powerUp.width / canvasWidth) * 100}%`,
    height: `${(powerUp.height / canvasHeight) * 100}%`,
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: `${Math.min((powerUp.width / canvasWidth) * 100, (powerUp.height / canvasHeight) * 100) * 0.8}vmin`,
    zIndex: 7,
    animation: 'powerUpFloat 2s ease-in-out infinite, powerUpGlow 1.5s ease-in-out infinite alternate',
    filter: 'drop-shadow(0 0 8px #00FFF7)',
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const glowStyle: React.CSSProperties = {
    position: 'absolute',
    width: '120%',
    height: '120%',
    border: '2px solid #00FFF7',
    borderRadius: '50%',
    animation: 'powerUpRing 2s linear infinite',
    opacity: 0.6,
  };

  return (
    <div style={powerUpStyle}>
      <style>
        {`
          @keyframes powerUpFloat {
            0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
            50% { transform: translate(-50%, -50%) translateY(-5px); }
          }
          @keyframes powerUpGlow {
            0% { filter: drop-shadow(0 0 8px #00FFF7); }
            100% { filter: drop-shadow(0 0 15px #00FFF7) drop-shadow(0 0 25px #00FFF7); }
          }
          @keyframes powerUpRing {
            0% { transform: scale(0.8) rotate(0deg); opacity: 0.8; }
            50% { transform: scale(1.2) rotate(180deg); opacity: 0.3; }
            100% { transform: scale(0.8) rotate(360deg); opacity: 0.8; }
          }
        `}
      </style>
      <div style={containerStyle}>
        <div style={glowStyle} />
        {powerUpEmojis[powerUp.type]}
      </div>
    </div>
  );
};