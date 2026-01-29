import React, { useState, useEffect, useCallback } from 'react';

const GAME_TYPES = {
  TWO_PLAYERS: 0,
  VERSUS_COMPUTER: 1
};

const PLAYER_TURNS = {
  HUMAN: 0,
  COMPUTER: 1
};

const DIFFICULTY_LEVELS = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD'
};

const TicTacToe = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameType, setGameType] = useState(null);
  const [currentIcon, setCurrentIcon] = useState(0);
  const [playerTurn, setPlayerTurn] = useState(0);
  const [cells, setCells] = useState(new Array(9).fill(null));
  const [gameState, setGameState] = useState({
    position: "",
    iconType: null,
    isTie: null,
  });
  const [showDifficultyMenu, setShowDifficultyMenu] = useState(false);
  const [difficulty, setDifficulty] = useState(DIFFICULTY_LEVELS.HARD);

  const checkGameState = (cells) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (cells[a] !== null && cells[a] === cells[b] && cells[a] === cells[c]) {
        let position = "";
        if (i >= 0 && i <= 2) position = `h h${i}`;
        else if (i >= 3 && i <= 5) position = `v v${i - 3}`;
        else position = `d${i - 6}`;

        return { position, iconType: cells[a], isTie: null };
      }
    }

    const isMoveLeft = cells.some(cell => cell === null);
    return { position: "", iconType: null, isTie: isMoveLeft ? null : true };
  };

  const findBestMove = useCallback((cells, computerType) => {
    // Difficulty Logic
    if (difficulty === DIFFICULTY_LEVELS.EASY) {
      // Random move
      const availableMoves = cells.map((cell, index) => cell === null ? index : null).filter(val => val !== null);
      if (availableMoves.length === 0) return null;
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    if (difficulty === DIFFICULTY_LEVELS.MEDIUM) {
      // 60% chance to play optimally, 40% random
      if (Math.random() > 0.6) {
        const availableMoves = cells.map((cell, index) => cell === null ? index : null).filter(val => val !== null);
        if (availableMoves.length === 0) return null;
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
      }
    }

    // HARD (Minimax)
    const evaluate = (cells) => {
      const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
      ];

      for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (cells[a] !== null && cells[a] === cells[b] && cells[a] === cells[c]) {
          return cells[a] === computerType ? 10 : -10;
        }
      }
      return 0;
    };

    const minimax = (cells, depth, isMax) => {
      const score = evaluate(cells);
      if (score === 10) return score - depth;
      if (score === -10) return score + depth;
      if (!cells.some(cell => cell === null)) return 0;

      let best = isMax ? -1000 : 1000;

      for (let i = 0; i < 9; i++) {
        if (cells[i] === null) {
          const nextCells = [...cells];
          nextCells[i] = isMax ? computerType : 1 - computerType;
          const val = minimax(nextCells, depth + 1, !isMax);
          best = isMax ? Math.max(best, val) : Math.min(best, val);
        }
      }
      return best;
    };

    let bestVal = -1000;
    let bestMove = null;

    for (let i = 0; i < 9; i++) {
      if (cells[i] === null) {
        const nextCells = [...cells];
        nextCells[i] = computerType;
        const moveVal = minimax(nextCells, 0, false);
        if (moveVal > bestVal) {
          bestVal = moveVal;
          bestMove = i;
        }
      }
    }
    return bestMove;
  }, [difficulty]);

  const startGame = (type) => {
    const randomIcon = Math.floor(Math.random() * 2);
    const randomTurn = Math.floor(Math.random() * 2);

    setGameType(type);
    setGameStarted(true);
    setCurrentIcon(randomIcon);
    setPlayerTurn(randomTurn);
    setCells(new Array(9).fill(null));
    setGameState({ position: "", iconType: null, isTie: null });
  };

  const handleAiClick = () => {
    setShowDifficultyMenu(true);
  };

  const startGameWithDifficulty = (level) => {
    setDifficulty(level);
    startGame(GAME_TYPES.VERSUS_COMPUTER);
    setShowDifficultyMenu(false);
  };

  const handleCellClick = (index) => {
    if (gameState.position !== "" || cells[index] !== null) return;
    if (gameType === GAME_TYPES.VERSUS_COMPUTER && playerTurn === PLAYER_TURNS.COMPUTER) return;

    const newCells = [...cells];
    newCells[index] = currentIcon;
    setCells(newCells);

    const newGameState = checkGameState(newCells);
    setGameState(newGameState);
    setCurrentIcon(1 - currentIcon);
    setPlayerTurn(1 - playerTurn);
  };

  useEffect(() => {
    if (gameStarted && gameType === GAME_TYPES.VERSUS_COMPUTER &&
      playerTurn === PLAYER_TURNS.COMPUTER && gameState.position === "") {
      const timer = setTimeout(() => {
        const bestMove = findBestMove(cells, currentIcon);
        if (bestMove !== null) {
          const newCells = [...cells];
          newCells[bestMove] = currentIcon;
          setCells(newCells);

          const newGameState = checkGameState(newCells);
          setGameState(newGameState);
          setCurrentIcon(1 - currentIcon);
          setPlayerTurn(1 - playerTurn);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [playerTurn, gameStarted, gameType, gameState.position, cells, currentIcon, difficulty, findBestMove]);

  const resetGame = () => {
    setGameStarted(false);
    setGameType(null);
    setCells(new Array(9).fill(null));
    setGameState({ position: "", iconType: null, isTie: null });
    setShowDifficultyMenu(false);
  };

  const getWinnerText = () => {
    if (gameState.isTie) return "It's a Tie!";
    if (gameState.iconType !== null) {
      const winner = gameState.iconType === 0 ? 'O' : 'X';
      return `Player ${winner} Wins!`;
    }
    return `Current Player: ${currentIcon === 0 ? 'O' : 'X'}`;
  };

  if (!gameStarted) {
    return (
      <div style={styles.container}>
        <style>{keyframes}</style>
        <div style={styles.startScreen}>
          <h1 style={styles.title}>Tic-Tac-Toe</h1>
          <p style={styles.subtitle}>{showDifficultyMenu ? 'Select Difficulty' : 'Choose your game mode'}</p>

          <div style={styles.buttonContainer}>
            {!showDifficultyMenu ? (
              <>
                <button
                  onClick={() => startGame(GAME_TYPES.TWO_PLAYERS)}
                  style={{ ...styles.modeButton, ...styles.twoPlayerButton }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
                >
                  <div style={styles.buttonIcon}>👥</div>
                  <div style={styles.buttonTitle}>2 Players</div>
                  <div style={styles.buttonSubtitle}>Play with a friend</div>
                </button>

                <button
                  onClick={handleAiClick}
                  style={{ ...styles.modeButton, ...styles.aiButton }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
                >
                  <div style={styles.buttonIcon}>🤖</div>
                  <div style={styles.buttonTitle}>Vs AI</div>
                  <div style={styles.buttonSubtitle}>Challenge the computer</div>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => startGameWithDifficulty(DIFFICULTY_LEVELS.EASY)}
                  style={{ ...styles.modeButton, ...styles.easyButton }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
                >
                  <div style={styles.buttonTitle}>Easy</div>
                  <div style={styles.buttonSubtitle}>For beginners</div>
                </button>

                <button
                  onClick={() => startGameWithDifficulty(DIFFICULTY_LEVELS.MEDIUM)}
                  style={{ ...styles.modeButton, ...styles.mediumButton }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
                >
                  <div style={styles.buttonTitle}>Medium</div>
                  <div style={styles.buttonSubtitle}>A balanced challenge</div>
                </button>

                <button
                  onClick={() => startGameWithDifficulty(DIFFICULTY_LEVELS.HARD)}
                  style={{ ...styles.modeButton, ...styles.hardButton }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
                >
                  <div style={styles.buttonTitle}>Hard</div>
                  <div style={styles.buttonSubtitle}>Unbeatable AI</div>
                </button>

                <button
                  onClick={() => setShowDifficultyMenu(false)}
                  style={{ ...styles.backButton, width: '100%', marginTop: '10px' }}
                >
                  Back
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const getBoardClass = () => {
    let className = gameState.position !== "" ? 'full' : '';
    if (gameState.position) {
      className += ' ' + gameState.position.split(' ').join(' ');
    }
    return className;
  };

  return (
    <div style={styles.container}>
      <style>{keyframes}</style>
      <div style={styles.main}>
        <div style={styles.header}>
          <div style={styles.modeIndicator}>
            {gameType === GAME_TYPES.TWO_PLAYERS ? '2 Players Mode' : 'Vs AI Mode'}
          </div>
          <button onClick={resetGame} style={styles.backButton}>
            Back
          </button>
        </div>

        <div style={styles.info}>
          {getWinnerText()}
        </div>

        <div style={{ ...styles.board, ...(gameState.position !== "" && styles.boardFull) }} className={getBoardClass()}>
          {gameState.position && <div style={styles.winningLine(gameState.position)} />}

          <div style={styles.boardRow}>
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                onClick={() => handleCellClick(i)}
                style={{
                  ...styles.cell,
                  ...(cells[i] === 0 && styles.cellPlayer1),
                  ...(cells[i] === 1 && styles.cellPlayer2),
                }}
                className={`cell cell-${i} ${cells[i] !== null ? 'done' : ''}`}
              >
                {cells[i] === 0 ? 'O' : cells[i] === 1 ? 'X' : ''}
              </button>
            ))}
          </div>
          <div style={styles.boardRow}>
            {[3, 4, 5].map((i) => (
              <button
                key={i}
                onClick={() => handleCellClick(i)}
                style={{
                  ...styles.cell,
                  ...(cells[i] === 0 && styles.cellPlayer1),
                  ...(cells[i] === 1 && styles.cellPlayer2),
                }}
                className={`cell cell-${i} ${cells[i] !== null ? 'done' : ''}`}
              >
                {cells[i] === 0 ? 'O' : cells[i] === 1 ? 'X' : ''}
              </button>
            ))}
          </div>
          <div style={styles.boardRow}>
            {[6, 7, 8].map((i) => (
              <button
                key={i}
                onClick={() => handleCellClick(i)}
                style={{
                  ...styles.cell,
                  ...(cells[i] === 0 && styles.cellPlayer1),
                  ...(cells[i] === 1 && styles.cellPlayer2),
                }}
                className={`cell cell-${i} ${cells[i] !== null ? 'done' : ''}`}
              >
                {cells[i] === 0 ? 'O' : cells[i] === 1 ? 'X' : ''}
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => startGame(gameType)} style={styles.newGameButton}>
          New Game
        </button>
      </div>
    </div>
  );
};

const keyframes = `
  @keyframes gradientBG {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.9; transform: scale(1.02); }
  }
  
  @keyframes cellAppear {
    0% { transform: scale(0) rotate(-180deg); opacity: 0; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  
  @keyframes winningCell {
    0% { transform: scale(1); box-shadow: 0 0 30px rgba(0, 210, 255, 0.8); }
    100% { transform: scale(1.05); box-shadow: 0 0 40px rgba(0, 210, 255, 1); }
  }
`;

const styles = {
  container: {
    background: 'linear-gradient(-45deg, #0f0c29, #302b63, #24243e, #0f0c29)',
    backgroundSize: '400% 400%',
    borderRadius: '20px',
    animation: 'gradientBG 15s ease infinite',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '30px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  startScreen: {
    textAlign: 'center',
    maxWidth: '300px',
    width: '100%',
  },
  title: {
    fontSize: '3rem',
    fontWeight: '900',
    background: 'linear-gradient(90deg, #00d2ff 0%, #3a7bd5 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '10px',
    filter: 'drop-shadow(0 0 20px rgba(0, 210, 255, 0.5))',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '1rem',
    marginBottom: '30px',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  modeButton: {
    background: 'rgba(0, 0, 0, 0.45)',
    backdropFilter: 'blur(15px)',
    border: '2px solid rgba(0, 210, 255, 0.3)',
    borderRadius: '15px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
  },
  twoPlayerButton: {
    borderColor: 'rgba(255, 105, 180, 0.5)',
  },
  aiButton: {
    borderColor: 'rgba(0, 210, 255, 0.5)',
  },
  easyButton: {
    borderColor: 'rgba(0, 255, 136, 0.5)',
  },
  mediumButton: {
    borderColor: 'rgba(255, 170, 0, 0.5)',
  },
  hardButton: {
    borderColor: 'rgba(255, 0, 85, 0.5)',
  },
  buttonIcon: {
    fontSize: '2rem',
    marginBottom: '5px',
  },
  buttonTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'white',
    marginBottom: '5px',
  },
  buttonSubtitle: {
    fontSize: '0.8rem',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  main: {
    maxWidth: '300px',
    width: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  modeIndicator: {
    background: 'rgba(0, 0, 0, 0.45)',
    backdropFilter: 'blur(15px)',
    border: '1px solid rgba(0, 210, 255, 0.3)',
    borderRadius: '15px',
    padding: '12px 24px',
    color: '#00d2ff',
    fontWeight: '700',
    fontSize: '1.1rem',
  },
  backButton: {
    background: 'rgba(0, 0, 0, 0.45)',
    backdropFilter: 'blur(15px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '15px',
    padding: '12px 24px',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontWeight: '600',
  },
  info: {
    backdropFilter: 'blur(15px)',
    border: '1px solid rgba(0, 210, 255, 0.3)',
    borderRadius: '20px',
    padding: '20px 40px',
    marginBottom: '40px',
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
    letterSpacing: '0.5px',
    background: 'linear-gradient(90deg, #00d2ff 0%, #3a7bd5 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    filter: 'drop-shadow(0 0 10px rgba(0, 210, 255, 0.3))',
    animation: 'pulse 2s ease-in-out infinite',
  },
  board: {
    display: 'grid',
    gridTemplateRows: 'repeat(3, 1fr)',
    gap: '15px',
    width: '100%',
    maxWidth: '300px',
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(0, 210, 255, 0.3)',
    borderRadius: '24px',
    padding: '20px',
    boxShadow: '0 8px 50px rgba(0, 210, 255, 0.2)',
    transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    position: 'relative',
    margin: '0 auto',
  },
  boardFull: {
    transform: 'scale(1.02)',
    borderColor: '#00d2ff',
    boxShadow: '0 0 50px rgba(0, 210, 255, 0.5)',
  },
  boardRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
  },
  cell: {
    width: '100%',
    aspectRatio: '1 / 1',
    maxWidth: '90px',
    maxHeight: '90px',
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(5px)',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    fontSize: '2.5rem',
    fontWeight: '900',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellPlayer1: {
    background: 'linear-gradient(135deg, rgba(0, 210, 255, 0.2) 0%, rgba(58, 123, 213, 0.2) 100%)',
    borderColor: '#00d2ff',
    color: 'white',
    cursor: 'not-allowed',
    textShadow: '0 0 15px rgba(0, 210, 255, 0.8)',
    animation: 'cellAppear 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  cellPlayer2: {
    background: 'linear-gradient(135deg, rgba(255, 85, 85, 0.2) 0%, rgba(255, 0, 0, 0.2) 100%)',
    borderColor: '#ff5555',
    color: 'white',
    cursor: 'not-allowed',
    textShadow: '0 0 15px rgba(255, 85, 85, 0.8)',
    animation: 'cellAppear 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  winningLine: (position) => {
    const baseStyle = {
      content: '""',
      position: 'absolute',
      backgroundColor: '#FFFFFF',
      transition: '0.7s',
    };

    // Parse position string
    if (position.includes('h')) {
      const row = position.charAt(position.length - 1);
      // Adjusted positions to account for gaps: row 0 = ~20%, row 1 = 50%, row 2 = ~80%
      const top = row === '0' ? '20%' : row === '1' ? '50%' : '80%';
      return {
        ...baseStyle,
        width: '100%',
        height: '3px',
        left: 0,
        top,
        transform: 'translateY(-50%)',
      };
    }

    if (position.includes('v')) {
      const col = position.charAt(position.length - 1);
      // Adjusted positions to account for gaps: col 0 = ~20%, col 1 = 50%, col 2 = ~80%
      const left = col === '0' ? '20%' : col === '1' ? '50%' : '80%';
      return {
        ...baseStyle,
        height: '100%',
        width: '3px',
        top: 0,
        left,
        transform: 'translateX(-50%)',
      };
    }

    if (position.includes('d')) {
      const diagonal = position.charAt(1);
      if (diagonal === '0') {
        // Top-left to bottom-right diagonal (cells 0, 4, 8)
        return {
          ...baseStyle,
          height: '128%',
          width: '3px',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%) rotate(-45deg)',
          transformOrigin: 'center',
        };
      } else {
        // Top-right to bottom-left diagonal (cells 2, 4, 6)
        return {
          ...baseStyle,
          height: '128%',
          width: '3px',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%) rotate(45deg)',
          transformOrigin: 'center',
        };
      }
    }

    return baseStyle;
  },
  newGameButton: {
    width: '100%',
    marginTop: '30px',
    background: 'linear-gradient(135deg, rgba(0, 210, 255, 0.3) 0%, rgba(58, 123, 213, 0.3) 100%)',
    backdropFilter: 'blur(15px)',
    border: '2px solid #00d2ff',
    borderRadius: '20px',
    padding: '15px',
    color: 'white',
    fontSize: '1.2rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 30px rgba(0, 210, 255, 0.3)',
  },
};

export default TicTacToe;