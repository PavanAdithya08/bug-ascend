import { GameState, Player, Enemy, Projectile, PowerUp, Particle, GameConfig, Position, ActivePowerUp } from '../types/game';

const TERMINAL_MESSAGES = [
  "✅ Fixed: Mismatched div tag in line 432",
  "✅ Resolved: Missing semicolon caused quantum instability",
  "✅ Patched: API call to localhost in production",
  "✅ Corrected: CSS class \"centered\" now actually centers",
  "✅ Removed: Console.log(\"debug\") spam in loop",
  "✅ Fixed: Button no longer submits 7 times",
  "✅ Patched: JS function returns undefined happiness",
  "✅ Corrected: Loop now exits. Eventually.",
  "✅ Fixed: Image no longer floats into the void",
  "✅ Resolved: Login now works without summoning demons",
  "✅ Patched: Duck typing no longer confuses actual ducks",
  "✅ Corrected: Recursion function now has a base case",
  "✅ Resolved: AI no longer tries to marry the compiler",
  "✅ Fixed: Shadow DOM no longer causes actual nightmares",
  "✅ Removed: Infinite scroll on 404 page",
  "✅ Fixed: Feature flag now does something",
  "✅ Fixed: Random bug that only appears during demos",
  "✅ Corrected: Null no longer equals 0 == false == \"bug\"",
  "✅ Fixed: Removed duplicate bugs from the changelog",
  "✅ Resolved: Quantum entangled state between checkboxes"
];

export class GameEngine {
  private config: GameConfig;

  constructor(config: GameConfig) {
    this.config = config;
  }

  public createInitialState(): GameState {
    const player: Player = {
      id: 'player',
      position: { 
        x: this.config.canvas.width / 2,
        y: 1000 // Start at base altitude
      },
      velocity: { x: 0, y: 0 },
      width: 40,
      height: 40,
      active: true,
      health: this.config.player.maxHealth,
      maxHealth: this.config.player.maxHealth,
      shield: this.config.player.maxShield,
      maxShield: this.config.player.maxShield,
      lastShot: 0,
      shootCooldown: this.config.player.shootCooldown,
    };

    return {
      player,
      camera: {
        x: 0,
        y: player.position.y - this.config.canvas.height * 0.7, // Position camera to show player in lower part of screen
        targetY: player.position.y - this.config.canvas.height * 0.7,
      },
      enemies: [],
      projectiles: [],
      powerUps: [],
      particles: [],
      activePowerUps: [],
      temporaryTexts: [],
      terminalMessages: [],
      score: 0,
      wave: 1,
      distance: 0,
      gameOver: false,
      paused: false,
      lastUpdate: Date.now(),
    };
  }

  public updateGame(state: GameState, deltaTime: number, input: any): GameState {
    if (state.gameOver || state.paused) return state;

    const newState = { ...state };
    const currentTime = Date.now();

    // Update player
    this.updatePlayer(newState, deltaTime, input, currentTime);

    // Update enemies
    this.updateEnemies(newState, deltaTime, currentTime);

    // Update projectiles
    this.updateProjectiles(newState, deltaTime);

    // Update particles
    this.updateParticles(newState, deltaTime);

    // Update power-ups
    this.updatePowerUps(newState, deltaTime);

    // Update active power-up effects
    this.updateActivePowerUps(newState, deltaTime);

    // Update temporary texts
    this.updateTemporaryTexts(newState, deltaTime);

    // Update terminal messages (remove old ones)
    this.updateTerminalMessages(newState, currentTime);

    // Update camera
    this.updateCamera(newState, deltaTime);

    // Check collisions
    this.checkCollisions(newState);

    // Spawn enemies
    this.spawnEnemies(newState, currentTime);

    // Spawn power-ups
    this.spawnPowerUps(newState, currentTime);

    // Check wave progression
    this.checkWaveProgression(newState);

    return newState;
  }

  private updatePlayer(state: GameState, deltaTime: number, input: any, currentTime: number): void {
    const player = state.player;
    let speed = 250; // Increased base speed for better movement feel
    
    // Apply speed boost from power-ups
    const speedBoost = state.activePowerUps.find(p => p.type === 'speed');
    if (speedBoost) {
      speed *= 1.5;
    }

    // Handle movement
    if (input.left && player.position.x > player.width / 2) {
      player.velocity.x = Math.max(player.velocity.x - 900 * deltaTime, -speed); // Higher acceleration
    } else if (input.right && player.position.x < this.config.canvas.width - player.width / 2) {
      player.velocity.x = Math.min(player.velocity.x + 900 * deltaTime, speed); // Higher acceleration
    } else {
      player.velocity.x *= this.config.physics.friction;
    }

    if (input.up) {
      player.velocity.y = Math.max(player.velocity.y - 900 * deltaTime, -1200); // Higher acceleration, max velocity cap
    } else {
      player.velocity.y *= this.config.physics.friction;
    }

    // Update player altitude and distance tracking
    if (player.velocity.y < 0) {
      // Scale velocity by deltaTime and altitude multiplier for realistic height gain
      // Multiplier of 0.1 allows reaching higher altitudes while maintaining game feel
      state.distance += Math.abs(player.velocity.y * deltaTime) * 0.1;
    }

    // Update position
    player.position.x += player.velocity.x * deltaTime;
    player.position.y += player.velocity.y * deltaTime;

    // Clamp to bounds
    player.position.x = Math.max(player.width / 2, Math.min(this.config.canvas.width - player.width / 2, player.position.x));
    // Allow unlimited vertical movement in both directions for endless gameplay
    // No Y bounds - player can move infinitely up or down

    // Handle shooting
    let shootCooldown = player.shootCooldown;
    const weaponBoost = state.activePowerUps.find(p => p.type === 'weapon');
    if (weaponBoost) {
      shootCooldown *= 0.5; // Faster shooting
    }
    
    if (input.shoot && currentTime - player.lastShot > shootCooldown) {
      this.createPlayerProjectile(state, player.position);
      
      // Triple shot with weapon boost
      if (weaponBoost) {
        this.createPlayerProjectile(state, { x: player.position.x - 15, y: player.position.y });
        this.createPlayerProjectile(state, { x: player.position.x + 15, y: player.position.y });
      }
      
      player.lastShot = currentTime;
    }

    // Regenerate shield
    if (player.shield < player.maxShield) {
      player.shield = Math.min(player.maxShield, player.shield + 0.5 * deltaTime);
    }
  }

  private updateEnemies(state: GameState, deltaTime: number, currentTime: number): void {
    state.enemies = state.enemies.filter(enemy => {
      if (!enemy.active) return false;

      // Update movement patterns
      switch (enemy.type) {
        case 'bug':
          enemy.velocity.y = 50 + state.wave * 5;
          enemy.velocity.x = Math.sin(enemy.position.y * 0.01) * 30;
          break;
        case 'alien':
          enemy.velocity.y = 40 + state.wave * 3;
          enemy.velocity.x = Math.cos(enemy.position.y * 0.008) * 50;
          
          // Aliens can shoot
          if (currentTime - enemy.lastShot > enemy.shootCooldown && enemy.position.y > 100) {
            this.createEnemyProjectile(state, enemy.position);
            enemy.lastShot = currentTime;
          }
          break;
      }

      // Update position
      enemy.position.x += enemy.velocity.x * deltaTime;
      enemy.position.y += enemy.velocity.y * deltaTime;

      // Remove if off screen
      if (enemy.position.y > state.camera.y + this.config.canvas.height + enemy.height) {
        enemy.active = false;
        return false;
      }

      return true;
    });
  }

  private updateProjectiles(state: GameState, deltaTime: number): void {
    const currentTime = Date.now();
    
    state.projectiles = state.projectiles.filter(projectile => {
      if (!projectile.active) return false;

      projectile.position.x += projectile.velocity.x * deltaTime;
      projectile.position.y += projectile.velocity.y * deltaTime;

      // Remove projectiles after 2 seconds if they haven't collided
      if (currentTime - projectile.createdAt > 2000) {
        return false;
      }

      // Remove if off screen
      if (projectile.position.y < state.camera.y - projectile.height || 
          projectile.position.y > state.camera.y + this.config.canvas.height + projectile.height ||
          projectile.position.x < -projectile.width ||
          projectile.position.x > this.config.canvas.width + projectile.width) {
        return false;
      }

      return true;
    });
  }

  private updateParticles(state: GameState, deltaTime: number): void {
    state.particles = state.particles.filter(particle => {
      particle.life -= deltaTime;
      particle.position.x += particle.velocity.x * deltaTime;
      particle.position.y += particle.velocity.y * deltaTime;
      
      return particle.life > 0;
    });
  }

  private updatePowerUps(state: GameState, deltaTime: number): void {
    state.powerUps = state.powerUps.filter(powerUp => {
      if (!powerUp.active) return false;

      // Gentle floating movement
      powerUp.position.y += powerUp.velocity.y * deltaTime;
      powerUp.position.x += Math.sin(powerUp.position.y * 0.01) * 20 * deltaTime;

      // Remove if off screen
      if (powerUp.position.y > state.camera.y + this.config.canvas.height + powerUp.height) {
        return false;
      }

      return true;
    });
  }

  private updateActivePowerUps(state: GameState, deltaTime: number): void {
    state.activePowerUps = state.activePowerUps.filter(powerUp => {
      powerUp.timeLeft -= deltaTime * 1000;
      return powerUp.timeLeft > 0;
    });
  }

  private updateTemporaryTexts(state: GameState, deltaTime: number): void {
    state.temporaryTexts = state.temporaryTexts.filter(text => {
      text.life -= deltaTime;
      text.position.x += text.velocity.x * deltaTime;
      text.position.y += text.velocity.y * deltaTime;
      
      return text.life > 0;
    });
  }

  private updateTerminalMessages(state: GameState, currentTime: number): void {
    // Remove messages older than 20 seconds
    state.terminalMessages = state.terminalMessages.filter(msg => 
      currentTime - msg.timestamp < 20000
    );
  }

  private updateCamera(state: GameState, deltaTime: number): void {
    const camera = state.camera;
    const player = state.player;
    
    // Track camera position based on player height
    camera.targetY = player.position.y - (this.config.canvas.height * 0.7);
    
    // Smooth camera movement
    const cameraSpeed = 3.0; // Adjust for camera responsiveness
    const yDiff = camera.targetY - camera.y;
    camera.y += yDiff * cameraSpeed * deltaTime;
  }

  private checkCollisions(state: GameState): void {
    // Player projectiles vs enemies
    state.projectiles.forEach(projectile => {
      if (!projectile.isPlayerProjectile || !projectile.active) return;

      state.enemies.forEach(enemy => {
        if (!enemy.active) return;

        if (this.checkBoxCollision(projectile, enemy)) {
          projectile.active = false;
          enemy.health -= projectile.damage;
          
          this.createExplosionParticles(state, enemy.position);

          if (enemy.health <= 0) {
            enemy.active = false;
            state.score += enemy.points;
            
            // Create +1 text effect
            this.createPointsText(state, enemy.position, `+${enemy.points}`);
            
            // Add terminal message
            const randomMessage = TERMINAL_MESSAGES[Math.floor(Math.random() * TERMINAL_MESSAGES.length)];
            state.terminalMessages.push({
              message: randomMessage,
              timestamp: Date.now()
            });
          }
        }
      });
    });

    // Enemy projectiles vs player
    state.projectiles.forEach(projectile => {
      if (projectile.isPlayerProjectile || !projectile.active) return;

      if (this.checkBoxCollision(projectile, state.player)) {
        projectile.active = false;
        this.damagePlayer(state, projectile.damage);
        this.createExplosionParticles(state, state.player.position);
      }
    });

    // Enemies vs player
    state.enemies.forEach(enemy => {
      if (!enemy.active) return;

      if (this.checkBoxCollision(enemy, state.player)) {
        enemy.active = false;
        this.damagePlayer(state, enemy.damage);
        this.createExplosionParticles(state, state.player.position);
      }
    });

    // Player vs power-ups
    state.powerUps.forEach(powerUp => {
      if (!powerUp.active) return;

      if (this.checkBoxCollision(powerUp, state.player)) {
        powerUp.active = false;
        this.applyPowerUp(state, powerUp);
        this.createPowerUpParticles(state, powerUp.position);
      }
    });
  }

  private checkBoxCollision(obj1: any, obj2: any): boolean {
    return obj1.position.x < obj2.position.x + obj2.width &&
           obj1.position.x + obj1.width > obj2.position.x &&
           obj1.position.y < obj2.position.y + obj2.height &&
           obj1.position.y + obj1.height > obj2.position.y;
  }

  private damagePlayer(state: GameState, damage: number): void {
    const player = state.player;
    
    if (player.shield > 0) {
      const shieldDamage = Math.min(player.shield, damage);
      player.shield -= shieldDamage;
      damage -= shieldDamage;
    }
    
    if (damage > 0) {
      player.health -= damage;
      if (player.health <= 0) {
        state.gameOver = true;
      }
    }
  }

  private applyPowerUp(state: GameState, powerUp: PowerUp): void {
    const player = state.player;
    
    switch (powerUp.type) {
      case 'health':
        player.health = Math.min(player.maxHealth, player.health + powerUp.effect.healthBoost!);
        break;
      case 'shield':
        player.shield = Math.min(player.maxShield, player.shield + powerUp.effect.shieldBoost!);
        break;
      case 'weapon':
        state.activePowerUps.push({
          type: 'weapon',
          timeLeft: powerUp.effect.duration!,
          maxDuration: powerUp.effect.duration!,
        });
        break;
      case 'speed':
        state.activePowerUps.push({
          type: 'speed',
          timeLeft: powerUp.effect.duration!,
          maxDuration: powerUp.effect.duration!,
        });
        break;
    }
  }

  private createPointsText(state: GameState, position: Position, text: string): void {
    const pointsText: TemporaryText = {
      id: `points_${Date.now()}_${Math.random()}`,
      position: { ...position },
      velocity: { x: 0, y: -80 },
      width: 20,
      height: 15,
      active: true,
      text: text,
      life: 1.5,
      maxLife: 1.5,
    };

    state.temporaryTexts.push(pointsText);
  }

  private createPlayerProjectile(state: GameState, position: Position): void {
    const projectile: Projectile = {
      id: `projectile_${Date.now()}_${Math.random()}`,
      position: { x: position.x, y: position.y - 20 },
      velocity: { x: 0, y: -400 },
      width: 4,
      height: 12,
      active: true,
      damage: 1,
      isPlayerProjectile: true,
    };

    state.projectiles.push(projectile);
  }

  private createEnemyProjectile(state: GameState, position: Position): void {
    const projectile: Projectile = {
      id: `enemy_projectile_${Date.now()}_${Math.random()}`,
      position: { x: position.x, y: position.y + 20 },
      velocity: { x: 0, y: 200 },
      width: 6,
      height: 10,
      active: true,
      damage: 1,
      isPlayerProjectile: false,
    };

    state.projectiles.push(projectile);
  }

  private createExplosionParticles(state: GameState, position: Position): void {
    for (let i = 0; i < 8; i++) {
      const particle: Particle = {
        id: `particle_${Date.now()}_${i}`,
        position: { ...position },
        velocity: {
          x: (Math.random() - 0.5) * 200,
          y: (Math.random() - 0.5) * 200,
        },
        width: 3,
        height: 3,
        active: true,
        life: 0.5 + Math.random() * 0.5,
        maxLife: 1,
        color: `hsl(${Math.random() * 60 + 10}, 100%, 60%)`,
        size: 2 + Math.random() * 3,
      };

      state.particles.push(particle);
    }
  }

  private createPowerUpParticles(state: GameState, position: Position): void {
    for (let i = 0; i < 12; i++) {
      const particle: Particle = {
        id: `powerup_particle_${Date.now()}_${i}`,
        position: { ...position },
        velocity: {
          x: (Math.random() - 0.5) * 300,
          y: (Math.random() - 0.5) * 300,
        },
        width: 4,
        height: 4,
        active: true,
        life: 0.8 + Math.random() * 0.4,
        maxLife: 1.2,
        color: '#00FFF7',
        size: 3 + Math.random() * 4,
      };

      state.particles.push(particle);
    }
  }

  private spawnEnemies(state: GameState, currentTime: number): void {
    // Calculate distance-based difficulty scaling - increase every 100m
    const distance100m = Math.floor(state.distance / 100);
    const difficultyMultiplier = 1 + (distance100m * 0.1); // 10% increase per 100m for more balanced progression
    
    const maxEnemies = Math.floor((this.config.enemy.maxEnemies + Math.floor(distance100m / 2)) * difficultyMultiplier);
    const adjustedSpawnRate = this.config.enemy.spawnRate * Math.min(difficultyMultiplier, 5.0); // Cap spawn rate multiplier at 5x
    
    if (state.enemies.length < maxEnemies && Math.random() < adjustedSpawnRate) {
      const enemyType = Math.random() < 0.7 ? 'bug' : 'alien';
      
      const enemy: Enemy = {
        id: `enemy_${currentTime}_${Math.random()}`,
        position: {
          x: Math.random() * (this.config.canvas.width - 60) + 30,
          y: state.camera.y - 30, // Spawn relative to camera
        },
        velocity: { x: 0, y: 0 },
        width: 30,
        height: 30,
        active: true,
        type: enemyType,
        health: enemyType === 'bug' ? 1 : 2,
        damage: enemyType === 'bug' ? 1 : 2,
        points: enemyType === 'bug' ? 10 : 25,
        lastShot: 0,
        shootCooldown: 2000 + Math.random() * 3000,
      };

      state.enemies.push(enemy);
    }
  }

  private spawnPowerUps(state: GameState, currentTime: number): void {
    // Spawn power-ups less frequently than enemies
    if (state.powerUps.length < 2 && Math.random() < 0.005) {
      const powerUpTypes: Array<PowerUp['type']> = ['health', 'shield', 'weapon', 'speed'];
      const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
      
      let effect;
      switch (type) {
        case 'health':
          effect = { healthBoost: 2 };
          break;
        case 'shield':
          effect = { shieldBoost: 2 };
          break;
        case 'weapon':
          effect = { weaponUpgrade: true, duration: 8000 };
          break;
        case 'speed':
          effect = { speedBoost: 1.5, duration: 6000 };
          break;
      }
      
      const powerUp: PowerUp = {
        id: `powerup_${Date.now()}_${Math.random()}`,
        position: {
          x: Math.random() * (this.config.canvas.width - 60) + 30,
          y: state.camera.y - 30, // Spawn relative to camera
        },
        velocity: { x: 0, y: 30 },
        width: 25,
        height: 25,
        active: true,
        type,
        effect,
      };

      state.powerUps.push(powerUp);
    }
  }

  private checkWaveProgression(state: GameState): void {
    if (state.enemies.length === 0 && state.score > state.wave * 100) {
      state.wave++;
    }
  }
}