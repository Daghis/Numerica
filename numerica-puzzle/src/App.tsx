import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { Button, MainMenu, Rules } from './components';





type ButtonState = 'pressable' | 'was-pressed' | 'disabled' | 'error';

interface ButtonData {
  id: number;
  label: string;
  state: ButtonState;
}

function App() {
  const [gameState, setGameState] = useState<'menu' | 'playing'>('menu');
  const [mainMenuSubView, setMainMenuSubView] = useState<'main' | 'levelSelect'>('main');
  const [level, setLevel] = useState(1);
  const [buttons, setButtons] = useState<ButtonData[]>([]);
  const [message, setMessage] = useState('');
  const [areButtonsClickable, setAreButtonsClickable] = useState(true);
  const [lastPressedButtonId, setLastPressedButtonId] = useState<number | null>(null);
  const levelCompletedRef = useRef(false);

  const [unlockedLevels, setUnlockedLevels] = useState<number[]>(() => {
    const storedLevels = localStorage.getItem('unlockedLevels');
    return storedLevels ? JSON.parse(storedLevels) : [1];
  });

  const nextExpectedButton = buttons.filter(button => button.state === 'was-pressed').length + 1;

  const totalLevels = 4;

  useEffect(() => {
    localStorage.setItem('unlockedLevels', JSON.stringify(unlockedLevels));
  }, [unlockedLevels]);

  useEffect(() => {
    if (gameState === 'playing') {
      levelCompletedRef.current = false; // Reset on level change
      setAreButtonsClickable(true); // Enable buttons for new level
      setLastPressedButtonId(null); // Reset last pressed button for new level

      if (level === 1) {
        setButtons([{ id: 1, label: '1', state: 'pressable' }]);
      } else if (level >= 2 && level <= totalLevels) {
        setButtons([
          { id: 1, label: '1', state: 'pressable' },
          { id: 2, label: '2', state: 'pressable' },
          { id: 3, label: '3', state: 'pressable' },
          { id: 4, label: '4', state: 'pressable' },
          { id: 5, label: '5', state: 'pressable' },
        ]);
      } else if (level > totalLevels) {
        // If all levels are completed, go back to menu
        setGameState('menu');
      }
    }
  }, [level, gameState, totalLevels]);

  const handleButtonClick = (buttonId: number) => {
    if (!areButtonsClickable) return; // Prevent clicks if buttons are not clickable

    setButtons(prevButtons => {
      if (level === 3) {
        const currentNextExpected = prevButtons.filter(button => button.state === 'was-pressed').length + 1;

        if (buttonId === currentNextExpected) {
          // Correct button pressed
          const newButtons = prevButtons.map(button => {
            if (button.id === buttonId) {
              return { ...button, state: 'was-pressed' as ButtonState };
            }
            return button;
          });

          const allPressed = newButtons.filter(button => button.state === 'was-pressed').length === 5;
          if (allPressed && !levelCompletedRef.current) {
            levelCompletedRef.current = true;
            setMessage(`Level ${level} Complete!`);
            setAreButtonsClickable(false); // Disable buttons after completion
            setUnlockedLevels(prev => {
              const newUnlocked = new Set([...prev, level + 1]);
              return Array.from(newUnlocked).sort((a, b) => a - b);
            });
            setTimeout(() => {
              if (level + 1 > totalLevels) {
                setGameState('menu');
              } else {
                setLevel(prevLevel => prevLevel + 1);
              }
              setMessage('');
            }, 1500);
          }
          return newButtons;
        } else {
          // Incorrect button pressed
          setMessage('Error: Incorrect button pressed! Level restarting...');
          setAreButtonsClickable(false); // Disable buttons on error
          const newButtons = prevButtons.map(button => {
            if (button.id === buttonId) {
              return { ...button, state: 'error' as ButtonState };
            }
            return button;
          });
          setTimeout(() => {
            setButtons(prevButtons.map(button => ({ ...button, state: 'pressable' })));
            setMessage('');
            setAreButtonsClickable(true); // Re-enable buttons after reset
          }, 1500);
          return newButtons;
        }
      } else if (level === 4) {
        const isAdjacent = lastPressedButtonId !== null &&
                           (buttonId === lastPressedButtonId - 1 || buttonId === lastPressedButtonId + 1);

        if (isAdjacent) {
          // Incorrect button pressed (adjacent)
          setMessage('Error: Cannot press adjacent button! Level restarting...');
          setAreButtonsClickable(false); // Disable buttons on error
          const newButtons = prevButtons.map(button => {
            if (button.id === buttonId) {
              return { ...button, state: 'error' as ButtonState };
            }
            return button;
          });
          setTimeout(() => {
            setButtons(prevButtons.map(button => ({ ...button, state: 'pressable' })));
            setLastPressedButtonId(null);
            setMessage('');
            setAreButtonsClickable(true); // Re-enable buttons after reset
          }, 1500);
          return newButtons;
        } else {
          // Correct button pressed (non-adjacent or first press)
          const newButtons = prevButtons.map(button => {
            if (button.id === buttonId) {
              return { ...button, state: 'was-pressed' as ButtonState };
            }
            return button;
          });
          setLastPressedButtonId(buttonId);

          const allPressed = newButtons.filter(button => button.state === 'was-pressed').length === 5;
          if (allPressed && !levelCompletedRef.current) {
            levelCompletedRef.current = true;
            setMessage(`Level ${level} Complete!`);
            setAreButtonsClickable(false); // Disable buttons after completion
            setUnlockedLevels(prev => {
              const newUnlocked = new Set([...prev, level + 1]);
              return Array.from(newUnlocked).sort((a, b) => a - b);
            });
            setTimeout(() => {
              if (level + 1 > totalLevels) {
                setGameState('menu');
              } else {
                setLevel(prevLevel => prevLevel + 1);
              }
              setMessage('');
            }, 1500);
          }
          return newButtons;
        }
      } else { // Logic for Level 1 and Level 2
        const newButtons = prevButtons.map(button => {
          if (button.id === buttonId) {
            return { ...button, state: 'was-pressed' as ButtonState };
          }
          return button;
        });

        const allPressed = newButtons.every(button => button.state === 'was-pressed');
        if (allPressed && !levelCompletedRef.current) {
          levelCompletedRef.current = true; // Mark level as completed
          setMessage(`Level ${level} Complete!`);
          setAreButtonsClickable(false); // Disable buttons after completion
          setUnlockedLevels(prev => {
            const newUnlocked = new Set([...prev, level + 1]);
            return Array.from(newUnlocked).sort((a, b) => a - b);
          });
          setTimeout(() => {
            if (level + 1 > totalLevels) {
              setGameState('menu');
            } else {
              setLevel(prevLevel => prevLevel + 1);
            }
            setMessage('');
          }, 1500);
        }
        return newButtons;
      }
    });
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
          <div className="grid-item rules-box"><Rules level={level} /></div>
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
          <div className="grid-item main-menu-button-box"><button onClick={() => setGameState('menu')} className="main-menu-button">Main Menu</button></div>
        </div>
      )}
    </div>
  );
}

export default App;