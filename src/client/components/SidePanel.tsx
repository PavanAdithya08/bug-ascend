import React, { useState, useEffect } from 'react';
import { Player } from '../types/game';

// Canvas height constant for altitude calculation
const CANVAS_HEIGHT = 600;

interface SidePanelProps {
  player: Player;
  score: number;
  wave: number;
  distance: number;
  altitude: number;
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

export const SidePanel: React.FC<SidePanelProps> = ({ player, score, wave, distance, altitude, activePowerUps, terminalMessages }) => {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [blinkCursor, setBlinkCursor] = useState(true);

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    const blinkInterval = setInterval(() => {
      setBlinkCursor(prev => !prev);
    }, 500);

    return () => {
      clearInterval(timeInterval);
      clearInterval(blinkInterval);
    };
  }, []);

  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '180px',
    height: '90vh',
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 100%)',
    border: '2px solid #00FFF7',
    borderLeft: 'none',
    boxShadow: '0 0 20px #00FFF7, inset 0 0 20px rgba(0, 255, 247, 0.1)',
    fontFamily: '"Courier New", "Roboto Mono", monospace',
    color: '#00FFF7',
    padding: '15px',
    zIndex: 1000,
    overflowY: 'auto',
    backgroundImage: `
      radial-gradient(circle at 20% 30%, rgba(179, 0, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(57, 255, 20, 0.05) 0%, transparent 50%)
    `
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '25px',
    borderBottom: '1px dashed #00FFF7',
    paddingBottom: '15px'
  };

  const headerStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#B300FF',
    textShadow: '0 0 5px #B300FF',
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  };

  const barContainerStyle: React.CSSProperties = {
    width: '100%',
    height: '12px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    border: '1px solid #00FFF7',
    borderRadius: '2px',
    overflow: 'hidden',
    marginBottom: '8px',
    boxShadow: 'inset 0 0 5px rgba(0, 255, 247, 0.3)'
  };

  const healthFillStyle: React.CSSProperties = {
    width: `${(player.health / player.maxHealth) * 100}%`,
    height: '100%',
    background: player.health > player.maxHealth * 0.3 
      ? 'linear-gradient(90deg, #39FF14, #7FFF00)' 
      : 'linear-gradient(90deg, #FF2E63, #FF6B6B)',
    boxShadow: player.health > player.maxHealth * 0.3 
      ? '0 0 10px #39FF14' 
      : '0 0 10px #FF2E63',
    transition: 'all 0.3s ease'
  };

  const shieldFillStyle: React.CSSProperties = {
    width: `${(player.shield / player.maxShield) * 100}%`,
    height: '100%',
    background: 'linear-gradient(90deg, #00FFF7, #4DFFFF)',
    boxShadow: '0 0 10px #00FFF7',
    transition: 'all 0.3s ease'
  };

  const statStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#39FF14',
    marginBottom: '5px',
    textShadow: '0 0 3px #39FF14'
  };

  const powerUpStyle: React.CSSProperties = {
    fontSize: '11px',
    color: '#B300FF',
    marginBottom: '5px',
    padding: '3px 6px',
    border: '1px dashed #B300FF',
    borderRadius: '3px',
    backgroundColor: 'rgba(179, 0, 255, 0.1)',
    textShadow: '0 0 3px #B300FF'
  };

  const statusTerminalStyle: React.CSSProperties = {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    border: '1px solid #39FF14',
    borderRadius: '3px',
    padding: '8px',
    fontSize: '10px',
    color: '#39FF14',
    textShadow: '0 0 3px #39FF14',
    fontFamily: '"Courier New", monospace'
  };

  const bugTerminalStyle: React.CSSProperties = {
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    border: '1px solid #39FF14',
    borderRadius: '3px',
    padding: '5px',
    fontSize: '9px',
    color: '#39FF14',
    textShadow: '0 0 3px #39FF14',
    fontFamily: '"Courier New", monospace',
    height: '100px',
    overflowY: 'auto',
    lineHeight: '1.2',
    whiteSpace: 'pre-wrap'
  };

  const terminalStyle: React.CSSProperties = {
    marginBottom: '15px',
    fontSize: '11px',
    color: '#39FF14',
    textShadow: '0 0 3px #39FF14'
  };

  return (
    <div style={panelStyle}>
      {/* Terminal Header */}
      <div style={terminalStyle}>
        <div>SYSTEM_STATUS: ACTIVE</div>
        <div>TIME: {currentTime}</div>
        <div>USER: PILOT_001{blinkCursor ? '▌' : ' '}</div>
      </div>

      {/* Health System */}
      <div style={sectionStyle}>
        <div style={headerStyle}>◈ VITAL SIGNS</div>
        <div style={statStyle}>
          <span>HEALTH:</span>
          <span>{player.health}/{player.maxHealth}</span>
        </div>
        <div style={barContainerStyle}>
          <div style={healthFillStyle} />
        </div>
        
        <div style={statStyle}>
          <span>SHIELD:</span>
          <span>{Math.floor(player.shield)}/{player.maxShield}</span>
        </div>
        <div style={barContainerStyle}>
          <div style={shieldFillStyle} />
        </div>
      </div>

      {/* Combat Stats */}
      <div style={sectionStyle}>
        <div style={headerStyle}>◈ COMBAT DATA</div>
        <div style={statStyle}>
          <span>SCORE:</span>
          <span>{score.toLocaleString()}</span>
        </div>
        <div style={statStyle}>
          <span>WAVE:</span>
          <span>{wave}</span>
        </div>
        <div style={statStyle}>
          <span>DISTANCE:</span>
          <span>{Math.floor(distance)}m</span>
        </div>
        <div style={statStyle}>
          <span>ALTITUDE:</span>
          <span>{Math.min(Math.floor(distance), 9999)}m</span>
        </div>
        <div style={statStyle}>
          <span>DIFFICULTY:</span>
          <span>{Math.floor(distance / 100)}x</span>
        </div>
      </div>

      {/* Active Power-ups */}
      <div style={sectionStyle}>
        <div style={headerStyle}>◈ ACTIVE MODS</div>
        {activePowerUps.length > 0 ? (
          activePowerUps.map((powerUp, index) => (
            <div key={index} style={powerUpStyle}>
              {powerUp.type.toUpperCase()}: {Math.ceil(powerUp.timeLeft / 1000)}s
              <div style={{
                width: `${(powerUp.timeLeft / powerUp.maxDuration) * 100}%`,
                height: '2px',
                backgroundColor: '#B300FF',
                marginTop: '2px',
                boxShadow: '0 0 3px #B300FF'
              }} />
            </div>
          ))
        ) : (
          <div style={{ fontSize: '11px', color: '#666', fontStyle: 'italic' }}>
            NO_MODS_ACTIVE
          </div>
        )}
      </div>

      {/* Terminal Messages */}
      <div style={sectionStyle}>
        <div style={statusTerminalStyle}>
          <div style={{ ...terminalStyle, height: '120px', overflowY: 'auto' }}>
            <div>{">"} INITIALIZING COMBAT_MODE...</div>
            <div>{">"} WEAPONS_SYSTEM: ONLINE</div>
            <div>{">"} SHIELD_GENERATOR: ACTIVE</div>
            <div>{">"} TARGETING_SYSTEM: LOCKED</div>
            <div>{">"} AWAITING_ORDERS{blinkCursor ? '▌' : ''}</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={sectionStyle}>
        <div style={headerStyle}>◈ CONTROLS</div>
        <div style={{ fontSize: '9px', color: '#00FFF7', lineHeight: '1.4' }}>
          <div>A/← D/→ W/↑: NAVIGATE</div>
          <div>SPACE/CLICK: ENGAGE</div>
          <div>ESC: ABORT_MISSION</div>
          <div style={{ color: '#FF2E63', marginTop: '4px' }}>
            <div>⚠ NO_RETREAT_MODE</div>
          </div>
        </div>
      </div>
    </div>
  );
};