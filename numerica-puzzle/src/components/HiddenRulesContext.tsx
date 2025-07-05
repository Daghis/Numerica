import { createContext, useState, useContext, type ReactNode } from 'react';

interface HiddenRulesContextType {
  revealedRules: { [key: string]: boolean };
  revealRule: (ruleId: string) => void;
  resetRevealedRules: () => void;
}

const HiddenRulesContext = createContext<HiddenRulesContextType | undefined>(undefined);

export const HiddenRulesProvider = ({ children }: { children: ReactNode }) => {
  const [revealedRules, setRevealedRules] = useState<{ [key: string]: boolean }>({});

  const revealRule = (ruleId: string) => {
    setRevealedRules(prev => ({ ...prev, [ruleId]: true }));
  };

  const resetRevealedRules = () => {
    setRevealedRules({});
  };

  return (
    <HiddenRulesContext.Provider value={{ revealedRules, revealRule, resetRevealedRules }}>
      {children}
    </HiddenRulesContext.Provider>
  );
};

export const useHiddenRules = () => {
  const context = useContext(HiddenRulesContext);
  if (!context) {
    throw new Error('useHiddenRules must be used within a HiddenRulesProvider');
  }
  return context;
};
