import type { MouseEventHandler } from 'react';
import './MainMenu.css';

interface MainMenuProps {
  unlockedLevels: number[];
  onStartGame: () => void;
  onResumeGame: () => void;
  onShowLevelSelect: (view: 'main' | 'levelSelect') => void;
  onSelectLevel: (level: number) => void;
  currentView: 'main' | 'levelSelect';
}

const MainMenu: React.FC<MainMenuProps> = ({ unlockedLevels, onStartGame, onResumeGame, onShowLevelSelect, onSelectLevel, currentView }) => {
  const levels = [1, 101, 102, 103, 104, 105, 106];

  const handleShowLevelSelect: MouseEventHandler<HTMLButtonElement> = () => {
    onShowLevelSelect('levelSelect');
  };

  const handleBackToMain: MouseEventHandler<HTMLButtonElement> = () => {
    onShowLevelSelect('main');
  };

  return (
    <div className="main-menu">
      {currentView === 'main' ? (
        <div className="main-options">
          <button onClick={onStartGame}>Start</button>
          <button onClick={onResumeGame} disabled={unlockedLevels.length === 1 && unlockedLevels[0] === 1}>Resume</button>
          <button onClick={handleShowLevelSelect}>Level Select</button>
        </div>
      ) : (
        <>
          <h2>Select Level</h2>
          <div className="level-selection">
            {levels.map(level => (
              <button
                key={level}
                onClick={() => onSelectLevel(level)}
                
                className={'unlocked'}
              >
                Level {level}
              </button>
            ))}
          </div>
          <button onClick={handleBackToMain} className="back-button">Back to Main</button>
        </>
      )}
    </div>
  );
};

export default MainMenu;
