import React, { useState, useEffect } from 'react';

interface PersonalBest {
  score: number;
  distance: number;
}

interface GlobalTopScore {
  userId: string;
  score: number;
  distance: number;
}

interface GameOverScreenProps {
  score: number;
  wave: number;
  distance: number;
  onRestart: () => void;
  canvasWidth: number;
  canvasHeight: number;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  wave,
  distance,
  onRestart,
  canvasWidth,
  canvasHeight,
}) => {
  const [personalBest, setPersonalBest] = useState<PersonalBest>({ score: 0, distance: 0 });
  const [globalTopScores, setGlobalTopScores] = useState<GlobalTopScore[]>([]);
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);

  useEffect(() => {
    const fetchHighScores = async () => {
      try {
        // First, submit the current score and distance
        await fetch('/api/score', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ score, distance }),
        });

        // Then fetch the updated high scores
        const response = await fetch('/api/highscore');
        const result = await response.json();
        
        if (result.status === 'success') {
          const currentPersonalBest = result.personalBest || { score: 0, distance: 0 };
          const currentGlobalTopScores = result.globalTopScores || [];
          
          setPersonalBest(currentPersonalBest);
          setGlobalTopScores(currentGlobalTopScores);
          
          // Check if this is a new personal best
          const isNewPB = score > currentPersonalBest.score || 
                         (score === currentPersonalBest.score && distance > currentPersonalBest.distance);
          setIsNewHighScore(isNewPB);
        }
      } catch (error) {
        console.error('Failed to fetch high scores:', error);
      }
    };

    fetchHighScores();
  }, [score, distance]);

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: '180px',
    width: 'calc(100% - 180px)',
    height: '100%',
    background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.95) 0%, rgba(26, 10, 46, 0.95) 100%)',
    border: '2px solid #FF2E63',
    boxShadow: '0 0 30px #FF2E63, inset 0 0 30px rgba(255, 46, 99, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontFamily: '"Courier New", "Roboto Mono", monospace',
    zIndex: 100,
    animation: 'fadeIn 0.5s ease-in',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: `${Math.min(canvasWidth, canvasHeight) * 0.08}px`,
    fontWeight: 'bold',
    color: '#FF2E63',
    textShadow: '0 0 20px #FF2E63, 0 0 40px #FF2E63',
    marginBottom: '20px',
    textTransform: 'uppercase',
    letterSpacing: '3px',
  };

  const statsStyle: React.CSSProperties = {
    fontSize: `${Math.min(canvasWidth, canvasHeight) * 0.04}px`,
    marginBottom: '30px',
    textAlign: 'center',
    color: '#00FFF7',
    textShadow: '0 0 10px #00FFF7',
  };

  const buttonStyle: React.CSSProperties = {
    fontSize: `${Math.min(canvasWidth, canvasHeight) * 0.02}px`,
    padding: '8px 15px',
    background: 'linear-gradient(135deg, #B300FF 0%, #00FFF7 100%)',
    color: '#000',
    border: '2px solid #00FFF7',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontFamily: '"Courier New", "Roboto Mono", monospace',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    boxShadow: '0 0 20px #00FFF7, 0 4px 8px rgba(0,0,0,0.3)',
    transition: 'all 0.2s',
  };

  return (
    <div style={overlayStyle}>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
        `}
      </style>
      
      <div style={titleStyle}>GAME OVER</div>
      
      <div style={statsStyle}>
        <div>FINAL_SCORE: {score.toLocaleString()}</div>
        <div>WAVE_REACHED: {wave}</div>
        <div>DISTANCE_TRAVELED: {Math.floor(distance)}m</div>
        <div>PERSONAL_BEST: {Math.max(personalBest.score, score).toLocaleString()}</div>
        <div style={{ marginTop: '10px', fontSize: '0.8em', color: '#39FF14' }}>
          {isNewHighScore ? '[NEW_HIGH_SCORE_ACHIEVED!]' : '[MISSION_STATUS: TERMINATED]'}
        </div>
        
        {globalTopScores.length > 0 && (
          <div style={{ marginTop: '15px', fontSize: '0.7em', color: '#00FFF7' }}>
            <div style={{ color: '#B300FF', fontWeight: 'bold', marginBottom: '5px' }}>
              [GLOBAL_LEADERBOARD]
            </div>
            {globalTopScores.slice(0, 3).map((entry, index) => (
              <div key={index} style={{ marginBottom: '3px' }}>
                #{index + 1}: {entry.score.toLocaleString()} pts ({Math.floor(entry.distance)}m)
              </div>
            ))}
          </div>
        )}
      </div>
      
      <button
        style={buttonStyle}
        onClick={onRestart}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #00FFF7 0%, #B300FF 100%)';
          e.currentTarget.style.boxShadow = '0 0 30px #B300FF, 0 4px 12px rgba(0,0,0,0.4)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #B300FF 0%, #00FFF7 100%)';
          e.currentTarget.style.boxShadow = '0 0 20px #00FFF7, 0 4px 8px rgba(0,0,0,0.3)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        RESTART_MISSION
      </button>
    </div>
  );
};