import { useState, useEffect, useRef } from 'react';
import './App.css';
import { Button, MainMenu, Rules } from './components';

export enum ButtonState {
  Pressable = 'pressable',
  WasPressed = 'was-pressed',
  Disabled = 'disabled',
  Error = 'error',
}

export interface ButtonData {
  id: number;
  label: string;
  state: ButtonState;
}

interface MovePredicate {
  (buttonId: number, currentButtons: ButtonData[], movesHistory: number[]): boolean;
  description: string;
}

interface CompletionPredicate {
  (currentButtons: ButtonData[], movesHistory: number[]): boolean;
  description: string;
}

interface LevelDefinition {
  movePredicate: MovePredicate;
  completionPredicate: CompletionPredicate;
}

const alwaysTrueMovePredicate: MovePredicate = Object.assign(
  (_buttonId: number, _currentButtons: ButtonData[], _movesHistory: number[]) => true,
  { description: 'Any button can be pressed in any order.' }
);

const sequentialMovePredicate: MovePredicate = Object.assign(
  (buttonId: number, _currentButtons: ButtonData[], movesHistory: number[]) => {
    if (movesHistory.length === 0) {
      // First move: any button is legal
      return true;
    } else if (movesHistory.length === 1) {
      // Second move: establishes direction
      const firstButton = movesHistory[0];
      return buttonId === firstButton + 1 || buttonId === firstButton - 1;
    } else {
      // Subsequent moves: follow established direction
      const lastPressedButtonId = movesHistory[movesHistory.length - 1];
      const secondToLastButtonId = movesHistory[movesHistory.length - 2];
      const establishedDirection = lastPressedButtonId - secondToLastButtonId;
      return buttonId === lastPressedButtonId + establishedDirection;
    }
  },
  { description: 'Buttons must be pressed in sequential order.' }
);

const nonAdjacentMovePredicate: MovePredicate = Object.assign(
  (buttonId: number, _currentButtons: ButtonData[], movesHistory: number[]) => {
    if (movesHistory.length === 0) return true; // First move is always legal
    const lastPressedButtonId = movesHistory[movesHistory.length - 1];
    return !(buttonId === lastPressedButtonId - 1 || buttonId === lastPressedButtonId + 1);
  },
  { description: 'Buttons must be pressed in a non-adjacent order.' }
);

const allButtonsPressedCompletionPredicate: CompletionPredicate = Object.assign(
  (currentButtons: ButtonData[], _movesHistory: number[]) => currentButtons.every(button => button.state === ButtonState.WasPressed),
  { description: 'All buttons must be pressed.' }
);

const createSpecificSequenceCompletionPredicate = (requiredButtonIds: number[]): CompletionPredicate => {
  return Object.assign(
    (_currentButtons: ButtonData[], movesHistory: number[]) => {
      if (movesHistory.length !== requiredButtonIds.length) {
        return false;
      }
      for (let i = 0; i < requiredButtonIds.length; i++) {
        if (movesHistory[i] !== requiredButtonIds[i]) {
          return false;
        }
      }
      return true;
    },
    { description: 'A specific sequence of buttons must be pressed.' }
  );
};

const createSpecificSequenceMovePredicate = (requiredButtonIds: number[]): MovePredicate => {
  return Object.assign(
    (buttonId: number, _currentButtons: ButtonData[], movesHistory: number[]) => {
      const nextExpectedButtonIndex = movesHistory.length;
      if (nextExpectedButtonIndex >= requiredButtonIds.length) {
        return false; // All required buttons already pressed
      }
      return buttonId === requiredButtonIds[nextExpectedButtonIndex];
    },
    { description: 'Buttons must be pressed in a specific order.' }
  );
};

export const levelDefinitions: { [key: number]: LevelDefinition } = {
  1: {
    movePredicate: alwaysTrueMovePredicate,
    completionPredicate: allButtonsPressedCompletionPredicate,
  },
  2: {
    movePredicate: alwaysTrueMovePredicate,
    completionPredicate: allButtonsPressedCompletionPredicate,
  },
  3: {
    movePredicate: sequentialMovePredicate,
    completionPredicate: allButtonsPressedCompletionPredicate,
  },
  4: {
    movePredicate: nonAdjacentMovePredicate,
    completionPredicate: allButtonsPressedCompletionPredicate,
  },
  5: {
    movePredicate: createSpecificSequenceMovePredicate([1, 3, 5]),
    completionPredicate: createSpecificSequenceCompletionPredicate([1, 3, 5]),
  },
};

function App() {
  const [gameState, setGameState] = useState<'menu' | 'playing'>('menu');
  const [mainMenuSubView, setMainMenuSubView] = useState<'main' | 'levelSelect'>('main');
  const [level, setLevel] = useState(1);
  const [buttons, setButtons] = useState<ButtonData[]>([]);
  const [message, setMessage] = useState('');
  const [areButtonsClickable, setAreButtonsClickable] = useState(true);
  const [movesHistory, setMovesHistory] = useState<number[]>([]); // New state for move history
  const [isLevelFailed, setIsLevelFailed] = useState(false); // New state for level failure
  const levelCompletedRef = useRef(false);

  const [unlockedLevels, setUnlockedLevels] = useState<number[]>(() => {
    const storedLevels = localStorage.getItem('unlockedLevels');
    return storedLevels ? JSON.parse(storedLevels) : [1];
  });

  const totalLevels = 5;

  useEffect(() => {
    localStorage.setItem('unlockedLevels', JSON.stringify(unlockedLevels));
  }, [unlockedLevels]);

  useEffect(() => {
    if (gameState === 'playing') {
      levelCompletedRef.current = false; // Reset on level change
      setAreButtonsClickable(true); // Enable buttons for new level
      setMovesHistory([]); // Reset move history for new level
      setMessage(''); // Clear message when starting a new level
      setIsLevelFailed(false); // Reset level failed state

      if (level === 1) {
        setButtons([{ id: 1, label: '1', state: ButtonState.Pressable }]);
      } else if (level >= 2 && level <= totalLevels) {
        setButtons([
          { id: 1, label: '1', state: ButtonState.Pressable },
          { id: 2, label: '2', state: ButtonState.Pressable },
          { id: 3, label: '3', state: ButtonState.Pressable },
          { id: 4, label: '4', state: ButtonState.Pressable },
          { id: 5, label: '5', state: ButtonState.Pressable },
        ]);
      } else if (level > totalLevels) {
        // If all levels are completed, go back to menu
        setGameState('menu');
      }
    }
  }, [level, gameState, totalLevels]);

  const handleButtonClick = (buttonId: number) => {
    if (!areButtonsClickable) return; // Prevent clicks if buttons are not clickable

    const levelDef = levelDefinitions[level];
    if (!levelDef) return; // Should not happen

    setButtons(prevButtons => {
      const potentialMovesHistory = [...movesHistory, buttonId]; // Calculate potential history
      const isMoveLegal = levelDef.movePredicate ? levelDef.movePredicate(buttonId, prevButtons, movesHistory) : true;

      if (isMoveLegal) {
        const newButtons = prevButtons.map(button => {
          if (button.id === buttonId) {
            return { ...button, state: ButtonState.WasPressed };
          }
          return button;
        });

        setMovesHistory(potentialMovesHistory); // Update state with potential history

        const isLevelCompleted = levelDef.completionPredicate(newButtons, potentialMovesHistory); // Use potential history

        if (isLevelCompleted && !levelCompletedRef.current) {
          levelCompletedRef.current = true; // Mark level as completed
          setMessage(`Level ${level} Complete!`);
          setAreButtonsClickable(false); // Disable buttons after completion
          setUnlockedLevels(prev => {
            const newUnlocked = new Set([...prev, level + 1]);
            return Array.from(newUnlocked).sort((a, b) => a - b);
          });
        }
        return newButtons;
      } else {
        // Incorrect button pressed
        setMessage('Error: Incorrect button pressed!');
        setAreButtonsClickable(false); // Disable buttons on error
        const newButtons = prevButtons.map(button => {
          if (button.id === buttonId) {
            return { ...button, state: ButtonState.Error };
          }
          return button;
        });
        setIsLevelFailed(true); // Set level failed state
        return newButtons;
      }
    });
  };

  const handleRestartLevel = () => {
    setButtons(prevButtons => prevButtons.map(button => ({ ...button, state: ButtonState.Pressable })));
    setMovesHistory([]);
    setMessage('');
    setAreButtonsClickable(true);
    setIsLevelFailed(false);
  };

  const handleNextLevel = () => {
    if (level + 1 <= totalLevels) {
      setLevel(prevLevel => prevLevel + 1);
    } else {
      setGameState('menu'); // Go back to menu if all levels are completed
    }
  };

  const handleStartGame = () => {
    setLevel(1);
    setGameState('playing');
    setMainMenuSubView('main'); // Reset subview
  };

  const handleResumeGame = () => {
    const firstUncompletedLevel = Array.from({ length: totalLevels }, (_, i) => i + 1)
      .find(lvl => !unlockedLevels.includes(lvl) || (unlockedLevels.includes(lvl) && lvl === Math.max(...unlockedLevels)));
    setLevel(firstUncompletedLevel || 1);
    setGameState('playing');
    setMainMenuSubView('main'); // Reset subview
  };

  const handleShowLevelSelect = (view: 'main' | 'levelSelect') => {
    setMainMenuSubView(view);
  };

  const handleSelectLevel = (selectedLevel: number) => {
    setLevel(selectedLevel);
    setGameState('playing');
    setMainMenuSubView('main'); // Reset subview
  };

  return (
    <div className="App">
      {gameState === 'menu' ? (
        <MainMenu
          unlockedLevels={unlockedLevels}
          onStartGame={handleStartGame}
          onResumeGame={handleResumeGame}
          onShowLevelSelect={handleShowLevelSelect}
          onSelectLevel={handleSelectLevel}
          currentView={mainMenuSubView}
        />
      ) : (
        <div className="game-container">
          <div className="grid-item empty-area"></div>
          <div className="grid-item level-header"><h2>Level {level}</h2></div>
          <div className="grid-item rules-box"><Rules movePredicateDescription={levelDefinitions[level].movePredicate?.description} completionPredicateDescription={levelDefinitions[level].completionPredicate.description} /></div>
          <div className="grid-item puzzle-box">
            <div className="puzzle">
              {buttons.map(button => (
                <Button
                  key={button.id}
                  label={button.label}
                  state={button.state}
                  onClick={() => handleButtonClick(button.id)}
                  disabled={!areButtonsClickable} // Pass disabled prop to Button component
                />
              ))}
            </div>
          </div>
          <div className="grid-item message-box"><p className={`message ${message.includes('Error') ? 'error' : ''} ${message ? '' : 'hidden'}`}>{message}</p></div>
          <div className="grid-item main-menu-button-box">
            {isLevelFailed ? (
              <button
                onClick={handleRestartLevel}
                className="main-menu-button button--error"
              >
                Restart
              </button>
            ) : (
              <button
                onClick={handleNextLevel}
                disabled={!levelCompletedRef.current || level + 1 > totalLevels}
                className="main-menu-button"
              >
                Next Level
              </button>
            )}
            <button onClick={() => setGameState('menu')} className="main-menu-button">Main Menu</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;