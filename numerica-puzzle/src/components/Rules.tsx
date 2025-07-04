
import React from 'react';
import './Rules.css';

interface RulesProps {
  level: number;
}

const Rules: React.FC<RulesProps> = ({ level }) => {
  const getRulesForLevel = (level: number) => {
    switch (level) {
      case 1:
        return ['Press the button to complete the level.'];
      case 2:
        return ['Press all buttons in any order.'];
      case 3:
        return ['Press all buttons in sequential order.'];
      case 4:
        return ['Press all buttons in a non-adjacent order.'];
      default:
        return [];
    }
  };

  const rules = getRulesForLevel(level);

  return (
    <div className="rules-container">
      <h3>Rules:</h3>
      <ol>
        {rules.map((rule, index) => (
          <li key={index}>{rule}</li>
        ))}
      </ol>
    </div>
  );
};

export default Rules;
