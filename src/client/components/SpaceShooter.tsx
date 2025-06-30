import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameEngine } from './GameEngine';
import { GameState, GameConfig } from '../types/game';
import { Ship } from './Ship';
import { Bug } from './Bug';
import { Laser } from './Laser';
import { PowerUp } from './PowerUp';
import { GameOverScreen } from './GameOverScreen';
import { GameLayout } from './GameLayout';
import { DebugTerminal } from './DebugTerminal';
import { AudioManager } from '../utils/AudioManager';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const gameConfig: GameConfig = {
  canvas: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  },
  player: {
    speed: 200,
    maxHealth: 3,
    maxShield: 1,
    shootCooldown: 200,
  },
  enemy: {
    spawnRate: 0.02,
    maxEnemies: 8,
  },
  physics: {
    friction: 0.85,
    acceleration: 800,
  },
};

export const SpaceShooter: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [input, setInput] = useState({
    left: false,
    right: false,
    up: false,
    shoot: false,
  });

  const gameEngineRef = useRef<GameEngine | null>(null);
  const audioManagerRef = useRef<AudioManager | null>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    gameEngineRef.current = new GameEngine(gameConfig);
    audioManagerRef.current = new AudioManager();
    setGameState(gameEngineRef.current.createInitialState());
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.code) {
      case 'ArrowLeft':
      case 'KeyA':
        setInput(prev => ({ ...prev, left: true }));
        break;
      case 'ArrowRight':
      case 'KeyD':
        setInput(prev => ({ ...prev, right: true }));
        break;
      case 'ArrowUp':
      case 'KeyW':
        setInput(prev => ({ ...prev, up: true }));
        break;
      case 'Space':
        event.preventDefault();
        setInput(prev => ({ ...prev, shoot: true }));
        break;
    }
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    switch (event.code) {
      case 'ArrowLeft':
      case 'KeyA':
        setInput(prev => ({ ...prev, left: false }));
        break;
      case 'ArrowRight':
      case 'KeyD':
        setInput(prev => ({ ...prev, right: false }));
        break;
      case 'ArrowUp':
      case 'KeyW':
        setInput(prev => ({ ...prev, up: false }));
        break;
      case 'Space':
        setInput(prev => ({ ...prev, shoot: false }));
        break;
    }
  }, []);

  const handleMouseDown = useCallback(() => {
    setInput(prev => ({ ...prev, shoot: true }));
  }, []);

  const handleMouseUp = useCallback(() => {
    setInput(prev => ({ ...prev, shoot: false }));
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleKeyDown, handleKeyUp, handleMouseDown, handleMouseUp]);

  const gameLoop = useCallback((currentTime: number) => {
    if (!gameState || !gameEngineRef.current) return;

    const deltaTime = Math.min((currentTime - lastTimeRef.current) / 1000, 0.016);
    lastTimeRef.current = currentTime;

    const newState = gameEngineRef.current.updateGame(gameState, deltaTime, input);
    
    // Play audio effects
    if (audioManagerRef.current) {
      if (input.shoot && currentTime - gameState.player.lastShot > gameState.player.shootCooldown) {
        audioManagerRef.current.playShoot();
      }
      
      // Check for enemy deaths for explosion sounds
      const deadEnemies = gameState.enemies.filter(enemy => enemy.active).length - 
                         newState.enemies.filter(enemy => enemy.active).length;
      
      if (deadEnemies > 0) {
        audioManagerRef.current.playExplosion();
      }
    }

    setGameState(newState);

    if (!newState.gameOver) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
  }, [gameState, input]);

  useEffect(() => {
    if (gameState && !gameState.gameOver) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameLoop, gameState]);

  const handleRestart = useCallback(() => {
    if (gameEngineRef.current) {
      setGameState(gameEngineRef.current.createInitialState());
      lastTimeRef.current = 0;
    }
  }, []);

  if (!gameState) {
    return <div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>Loading...</div>;
  }

  return (
    <GameLayout
      player={gameState.player}
      score={gameState.score}
      wave={gameState.wave}
      distance={gameState.distance}
      altitude={gameState.player.position.y}
      activePowerUps={gameState.activePowerUps}
      terminalMessages={gameState.terminalMessages}
    >
      <Ship
        player={gameState.player}
        camera={gameState.camera}
        canvasWidth={CANVAS_WIDTH}
        canvasHeight={CANVAS_HEIGHT}
      />
      
      {gameState.enemies.map(enemy => (
        <Bug
          key={enemy.id}
          enemy={enemy}
          camera={gameState.camera}
          canvasWidth={CANVAS_WIDTH}
          canvasHeight={CANVAS_HEIGHT}
        />
      ))}
      
      {gameState.projectiles.map(projectile => (
        <Laser
          key={projectile.id}
          projectile={projectile}
          camera={gameState.camera}
          canvasWidth={CANVAS_WIDTH}
          canvasHeight={CANVAS_HEIGHT}
        />
      ))}
      
      {gameState.powerUps.map(powerUp => (
        <PowerUp
          key={powerUp.id}
          powerUp={powerUp}
          camera={gameState.camera}
          canvasWidth={CANVAS_WIDTH}
          canvasHeight={CANVAS_HEIGHT}
        />
      ))}
      
      {gameState.particles.map(particle => (
        <div
          key={particle.id}
          style={{
            position: 'absolute',
            left: `${((particle.position.x - gameState.camera.x) / CANVAS_WIDTH) * 100}%`,
            top: `${((particle.position.y - gameState.camera.y) / CANVAS_HEIGHT) * 100}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: particle.life / particle.maxLife,
            zIndex: 6,
          }}
        />
      ))}
      
      {gameState.temporaryTexts.map(text => (
        <div
          key={text.id}
          style={{
            position: 'absolute',
            left: `${((text.position.x - gameState.camera.x) / CANVAS_WIDTH) * 100}%`,
            top: `${((text.position.y - gameState.camera.y) / CANVAS_HEIGHT) * 100}%`,
            transform: 'translate(-50%, -50%)',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#00FFF7',
            textShadow: '0 0 8px #00FFF7, 0 0 16px #00FFF7',
            opacity: text.life / text.maxLife,
            zIndex: 9,
            pointerEvents: 'none',
            fontFamily: '"Courier New", "Roboto Mono", monospace',
          }}
        >
          {text.text}
        </div>
      ))}
      
      {gameState.gameOver && (
        <GameOverScreen
          score={gameState.score}
          wave={gameState.wave}
          distance={gameState.distance}
          onRestart={handleRestart}
          canvasWidth={CANVAS_WIDTH}
          canvasHeight={CANVAS_HEIGHT}
        />
      )}
      
      <DebugTerminal terminalMessages={gameState.terminalMessages} />
    </GameLayout>
  );
};