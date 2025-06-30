import React from 'react';
import { Player, PowerUp } from '../types/game';
import { SidePanel } from './SidePanel';

interface GameLayoutProps {
  player: Player;
  score: number;
  wave: number;
  distance: number;
  altitude: number;
  children: React.ReactNode;
  terminalMessages: Array<{
    message: string;
    timestamp: number;
  }>;
  activePowerUps: Array<{
    type: string;
    timeLeft: number;
    maxDuration: number;
  }>;
}

export const GameLayout: React.FC<GameLayoutProps> = ({
  player,
  score,
  wave,
  distance,
  altitude,
  children,
  terminalMessages,
  activePowerUps,
}) => {
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)',
    overflow: 'hidden',
    backgroundImage: `
      radial-gradient(circle at 20% 30%, rgba(179, 0, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(57, 255, 20, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 60% 20%, rgba(0, 255, 247, 0.08) 0%, transparent 50%),
      repeating-linear-gradient(
        90deg,
        transparent,
        transparent 98px,
        rgba(0, 255, 247, 0.02) 100px
      )
    `,
  };

  const gameAreaStyle: React.CSSProperties = {
    width: 'calc(100% - 180px)',
    height: '100%',
    position: 'relative',
    marginLeft: '180px',
  };

  return (
    <div style={containerStyle}>
      <SidePanel 
        player={player} 
        score={score} 
        wave={wave} 
        distance={distance}
        altitude={altitude}
        terminalMessages={terminalMessages}
        activePowerUps={activePowerUps}
      />
      <div style={gameAreaStyle}>
        {children}
      </div>
    </div>
  );
};