
import React from 'react';
import './Rules.css';
import { useHiddenRules } from './HiddenRulesContext';

interface RulesProps {
  movePredicateDescription: string;
  movePredicateHiddenRuleId?: string;
  completionPredicateDescription: string;
  completionPredicateHiddenRuleId?: string;
}

const Rules: React.FC<RulesProps> = ({ 
  movePredicateDescription,
  movePredicateHiddenRuleId,
  completionPredicateDescription,
  completionPredicateHiddenRuleId,
}) => {
  const { revealedRules } = useHiddenRules();

  const rules = [];

  const isMoveRuleRevealed = movePredicateHiddenRuleId ? revealedRules[movePredicateHiddenRuleId] : true;
  const isCompletionRuleRevealed = completionPredicateHiddenRuleId ? revealedRules[completionPredicateHiddenRuleId] : true;

  if (isCompletionRuleRevealed) {
    rules.push(completionPredicateDescription);
  } else {
    rules.push('1.'); // Placeholder for hidden completion rule
  }

  if (movePredicateDescription) {
    if (isMoveRuleRevealed) {
      rules.push(movePredicateDescription);
    } else {
      rules.push('2.'); // Placeholder for hidden move rule
    }
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
