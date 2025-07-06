import { useState, useEffect, useRef } from 'react';
import './App.css';
import { Button, MainMenu, Rules } from './components';
import { useHiddenRules } from './components/HiddenRulesContext';

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
  hiddenRuleId?: string; // Optional ID for hidden rules
}

interface CompletionPredicate {
  (currentButtons: ButtonData[], movesHistory: number[]): boolean;
  description: string;
  hiddenRuleId?: string; // Optional ID for hidden rules
}

interface LevelDefinition {
  movePredicate: MovePredicate;
  completionPredicate: CompletionPredicate;
}

const getInitialButtonsForLevel = (level: number): ButtonData[] => {
  if (level === 1) {
    return [{ id: 1, label: '', state: ButtonState.Pressable }];
  }
  if (level === 101) {
    return [{ id: 1, label: '1', state: ButtonState.Pressable }];
  }
  if (level === 106) {
    return Array.from({ length: 9 }, (_, i) => ({
      id: i + 1,
      label: `${i + 1}`,
      state: ButtonState.Pressable,
    }));
  }
  if (level >= 102 && level <= 105) {
    return Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      label: `${i + 1}`,
      state: ButtonState.Pressable,
    }));
  }
  return [];
};

const alwaysTrueMovePredicate: MovePredicate = Object.assign(
  (_buttonId: number, _currentButtons: ButtonData[], _movesHistory: number[]) => true,
  { description: '' }
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

const oddNumberMovePredicate: MovePredicate = Object.assign(
  (buttonId: number, _currentButtons: ButtonData[], _movesHistory: number[]) => {
    return buttonId % 2 !== 0;
  },
  { description: 'Only odd-numbered buttons can be pressed.' }
);

const allButtonsPressedCompletionPredicate: CompletionPredicate = Object.assign(
  (currentButtons: ButtonData[], _movesHistory: number[]) => currentButtons.every(button => button.state === ButtonState.WasPressed),
  { description: 'All buttons must be pressed.' }
);

const pressAllOddButtonsCompletionPredicate: CompletionPredicate = Object.assign(
  (currentButtons: ButtonData[]) => {
    const oddButtons = currentButtons.filter(button => button.id % 2 !== 0);
    return oddButtons.every(button => button.state === ButtonState.WasPressed);
  },
  { description: 'Press all the right buttons.' }
);



export const levelDefinitions: { [key: number]: LevelDefinition } = {
  1: {
    movePredicate: alwaysTrueMovePredicate,
    completionPredicate: Object.assign((currentButtons: ButtonData[], _movesHistory: number[]) => allButtonsPressedCompletionPredicate(currentButtons, _movesHistory), { description: 'Press the button.' }),
  },
  101: {
    movePredicate: alwaysTrueMovePredicate,
    completionPredicate: allButtonsPressedCompletionPredicate,
  },
  102: {
    movePredicate: alwaysTrueMovePredicate,
    completionPredicate: allButtonsPressedCompletionPredicate,
  },
  103: {
    movePredicate: sequentialMovePredicate,
    completionPredicate: allButtonsPressedCompletionPredicate,
  },
  104: {
    movePredicate: nonAdjacentMovePredicate,
    completionPredicate: allButtonsPressedCompletionPredicate,
  },
  105: {
    movePredicate: Object.assign((buttonId: number, currentButtons: ButtonData[], movesHistory: number[]) => oddNumberMovePredicate(buttonId, currentButtons, movesHistory), { description: oddNumberMovePredicate.description }),
    completionPredicate: pressAllOddButtonsCompletionPredicate,
  },
  106: {
    movePredicate: Object.assign((buttonId: number, currentButtons: ButtonData[], movesHistory: number[]) => oddNumberMovePredicate(buttonId, currentButtons, movesHistory), { hiddenRuleId: 'level6MoveRule', description: oddNumberMovePredicate.description }),
    completionPredicate: pressAllOddButtonsCompletionPredicate,
  },
};

function App() {
  const [gameState, setGameState] = useState<'menu' | 'playing'>('menu');
  const [mainMenuSubView, setMainMenuSubView] = useState<'main' | 'levelSelect'>('main');
  const [level, setLevel] = useState(101);
  const [buttons, setButtons] = useState<ButtonData[]>([]);
  const [message, setMessage] = useState('');
  const [areButtonsClickable, setAreButtonsClickable] = useState(true);
  const [movesHistory, setMovesHistory] = useState<number[]>([]); // New state for move history
  const [isLevelFailed, setIsLevelFailed] = useState(false); // New state for level failure
  const levelCompletedRef = useRef(false);

  const { revealRule } = useHiddenRules();

  const [unlockedLevels, setUnlockedLevels] = useState<number[]>([1, 101, 102, 103, 104, 105, 106]);

  useEffect(() => {
    const storedLevels = localStorage.getItem('unlockedLevels');
    if (storedLevels) {
      setUnlockedLevels(prev => {
        const newUnlocked = new Set(prev);
        JSON.parse(storedLevels).forEach((level: number) => newUnlocked.add(level));
        return Array.from(newUnlocked).sort((a, b) => a - b);
      });
    }
  }, []);

  const totalLevels = 106;

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

      if (level > totalLevels) {
        // If all levels are completed, go back to menu
        setGameState('menu');
      } else {
        setButtons(getInitialButtonsForLevel(level));
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
            const nextLevel = level === 1 ? 101 : level + 1;
            const newUnlocked = new Set([...prev, nextLevel]);
            return Array.from(newUnlocked).sort((a, b) => a - b);
          });

          return newButtons.map(btn =>
            btn.id === buttonId ? { ...btn, label: '✅' } : btn
          );
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

        // Reveal hidden rule if violated
        if (levelDef.movePredicate?.hiddenRuleId) {
          revealRule(levelDef.movePredicate.hiddenRuleId);
        }
        if (levelDef.completionPredicate?.hiddenRuleId) {
          revealRule(levelDef.completionPredicate.hiddenRuleId);
        }
        return newButtons;
      }
    });
  };

  const handleRestartLevel = () => {
    setButtons(getInitialButtonsForLevel(level));
    levelCompletedRef.current = false;
    setMovesHistory([]);
    setMessage('');
    setAreButtonsClickable(true);
    setIsLevelFailed(false);
  };

  const handleNextLevel = () => {
    if (level === 1) {
      setLevel(101);
    } else if (level + 1 <= totalLevels) {
      setLevel(prevLevel => prevLevel + 1);
    } else {
      setGameState('menu'); // Go back to menu if all levels are completed
    }
  };

  const handleStartGame = () => {
    // Start the game from the very first level
    setLevel(1);
    setGameState('playing');
    setMainMenuSubView('main'); // Reset subview
  };

  const handleResumeGame = () => {
    const firstUncompletedLevel = Array.from({ length: totalLevels - 100 }, (_, i) => i + 101)
      .find(lvl => !unlockedLevels.includes(lvl) || (unlockedLevels.includes(lvl) && lvl === Math.max(...unlockedLevels)));
    setLevel(firstUncompletedLevel || 101);
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
          <div className="grid-item rules-box">
            <Rules
              movePredicateDescription={levelDefinitions[level].movePredicate?.description}
              movePredicateHiddenRuleId={levelDefinitions[level].movePredicate?.hiddenRuleId}
              completionPredicateDescription={levelDefinitions[level].completionPredicate.description}
              completionPredicateHiddenRuleId={levelDefinitions[level].completionPredicate.hiddenRuleId}
            />
          </div>
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
            <button
              onClick={handleRestartLevel}
              className={`main-menu-button ${isLevelFailed ? 'button--error' : 'button--restart'}`}
            >
              Restart
            </button>
            <button
              onClick={handleNextLevel}
              disabled={!levelCompletedRef.current || level + 1 > totalLevels}
              className="main-menu-button"
            >
              Next Level
            </button>
            <button onClick={() => setGameState('menu')} className="main-menu-button">Main Menu</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;