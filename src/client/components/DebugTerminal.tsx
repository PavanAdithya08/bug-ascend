import React, { useState, useEffect } from 'react';

interface DebugTerminalProps {
  terminalMessages: Array<{
    message: string;
    timestamp: number;
  }>;
}

export const DebugTerminal: React.FC<DebugTerminalProps> = ({ terminalMessages }) => {
  const [blinkCursor, setBlinkCursor] = useState(true);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinkCursor(prev => !prev);
    }, 500);

    return () => {
      clearInterval(blinkInterval);
    };
  }, []);

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '10px',
    right: '10px',
    width: '15vw',
    height: '15vh',
    minWidth: '200px',
    minHeight: '120px',
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 100%)',
    border: '2px solid #39FF14',
    borderRadius: '4px',
    boxShadow: '0 0 15px #39FF14, inset 0 0 15px rgba(57, 255, 20, 0.1)',
    fontFamily: '"Courier New", "Roboto Mono", monospace',
    color: '#39FF14',
    padding: '8px',
    zIndex: 1001,
    backgroundImage: `
      radial-gradient(circle at 20% 30%, rgba(57, 255, 20, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(0, 255, 247, 0.03) 0%, transparent 50%)
    `
  };

  const headerStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#39FF14',
    textShadow: '0 0 5px #39FF14',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    borderBottom: '1px dashed #39FF14',
    paddingBottom: '4px'
  };

  const terminalContentStyle: React.CSSProperties = {
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    border: '1px solid #39FF14',
    borderRadius: '2px',
    padding: '6px',
    fontSize: '9px',
    color: '#39FF14',
    textShadow: '0 0 3px #39FF14',
    fontFamily: '"Courier New", monospace',
    height: 'calc(100% - 30px)',
    overflowY: 'auto',
    lineHeight: '1.2',
    whiteSpace: 'pre-wrap'
  };

  // Custom scrollbar styles
  const scrollbarStyles = `
    .debug-terminal-content::-webkit-scrollbar {
      width: 4px;
    }
    .debug-terminal-content::-webkit-scrollbar-track {
      background: rgba(57, 255, 20, 0.1);
    }
    .debug-terminal-content::-webkit-scrollbar-thumb {
      background: #39FF14;
      border-radius: 2px;
    }
    .debug-terminal-content::-webkit-scrollbar-thumb:hover {
      background: #4DFF20;
    }
  `;

  return (
    <div style={containerStyle}>
      <style>{scrollbarStyles}</style>
      <div style={headerStyle}>◈ DEBUG_LOG</div>
      <div style={terminalContentStyle} className="debug-terminal-content">
        {terminalMessages.length > 0 ? (
          terminalMessages
            .slice(-10)
            .map((msg, index) => (
              <div key={msg.timestamp} style={{ marginBottom: '2px' }}>
                {msg.message}
              </div>
            ))
        ) : (
          <div style={{ color: '#666', fontStyle: 'italic' }}>
            {">"} NO_BUGS_RESOLVED_YET{blinkCursor ? '▌' : ''}
          </div>
        )}
      </div>
    </div>
  );
};