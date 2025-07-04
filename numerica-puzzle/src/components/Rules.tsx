
import React from 'react';
import './Rules.css';

interface RulesProps {
  movePredicateDescription: string;
  completionPredicateDescription: string;
}

const Rules: React.FC<RulesProps> = ({ movePredicateDescription, completionPredicateDescription }) => {
  const rules = [];
  rules.push(completionPredicateDescription);
  if (movePredicateDescription) {
    rules.push(movePredicateDescription);
  }

  return (
    <div className="rules-container">
      <h3>Rules</h3>
      <ol>
        {rules.map((rule, index) => (
          <li key={index}>{rule}</li>
        ))}
      </ol>
    </div>
  );
};

export default Rules;
