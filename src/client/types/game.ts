export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export interface GameObject {
  id: string;
  position: Position;
  velocity: Velocity;
  width: number;
  height: number;
  active: boolean;
}

export interface Player extends GameObject {
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  lastShot: number;
  shootCooldown: number;
}

export interface Enemy extends GameObject {
  type: EnemyType;
  health: number;
  damage: number;
  points: number;
  lastShot: number;
  shootCooldown: number;
}

export interface Projectile extends GameObject {
  damage: number;
  isPlayerProjectile: boolean;
  createdAt: number;
}

export interface PowerUp extends GameObject {
  type: PowerUpType;
  effect: PowerUpEffect;
}

export interface ActivePowerUp {
  type: string;
  timeLeft: number;
  maxDuration: number;
}

export interface TerminalMessage {
  message: string;
  timestamp: number;
}

export interface Particle extends GameObject {
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface TemporaryText extends GameObject {
  text: string;
  life: number;
  maxLife: number;
}

export interface GameState {
  player: Player;
  camera: {
    x: number;
    y: number;
    targetY: number;
  };
  enemies: Enemy[];
  projectiles: Projectile[];
  powerUps: PowerUp[];
  particles: Particle[];
  activePowerUps: ActivePowerUp[];
  temporaryTexts: TemporaryText[];
  terminalMessages: TerminalMessage[];
  score: number;
  wave: number;
  distance: number;
  gameOver: boolean;
  paused: boolean;
  lastUpdate: number;
}

export type EnemyType = 'bug' | 'alien';
export type PowerUpType = 'health' | 'shield' | 'weapon' | 'speed';

export interface PowerUpEffect {
  healthBoost?: number;
  shieldBoost?: number;
  weaponUpgrade?: boolean;
  speedBoost?: number;
  duration?: number;
}

export interface GameConfig {
  canvas: {
    width: number;
    height: number;
  };
  player: {
    speed: number;
    maxHealth: number;
    maxShield: number;
    shootCooldown: number;
  };
  enemy: {
    spawnRate: number;
    maxEnemies: number;
  };
  physics: {
    friction: number;
    acceleration: number;
  };
}