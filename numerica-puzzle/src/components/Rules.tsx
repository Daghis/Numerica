
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
    rules.push({ text: completionPredicateDescription, hidden: false });
  } else {
    rules.push({ text: '', hidden: true }); // Placeholder for hidden completion rule
  }

  if (movePredicateDescription) {
    if (isMoveRuleRevealed) {
      rules.push({ text: movePredicateDescription, hidden: false });
    } else {
      rules.push({ text: '', hidden: true }); // Placeholder for hidden move rule
    }
  }

  return (
    <div className="rules-container">
      <h3>Rules</h3>
      <ol>
        {rules.map((rule, index) => (
          <li key={index}>{rule.text}</li>
        ))}
      </ol>
    </div>
  );
};

export default Rules;
