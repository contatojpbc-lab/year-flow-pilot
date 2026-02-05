 import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
 
 export type ExecutionMode = 'normal' | 'light';
 
 interface ExecutionModeContextType {
   mode: ExecutionMode;
   isLightMode: boolean;
   toggleMode: () => void;
   setMode: (mode: ExecutionMode) => void;
 }
 
 const ExecutionModeContext = createContext<ExecutionModeContextType | undefined>(undefined);
 
 export const ExecutionModeProvider = ({ children }: { children: ReactNode }) => {
   const [mode, setModeState] = useState<ExecutionMode>('normal');
 
   const isLightMode = mode === 'light';
 
   const toggleMode = useCallback(() => {
     setModeState(prev => prev === 'normal' ? 'light' : 'normal');
   }, []);
 
   const setMode = useCallback((newMode: ExecutionMode) => {
     setModeState(newMode);
   }, []);
 
   return (
     <ExecutionModeContext.Provider value={{ mode, isLightMode, toggleMode, setMode }}>
       {children}
     </ExecutionModeContext.Provider>
   );
 };
 
 export const useExecutionMode = () => {
   const context = useContext(ExecutionModeContext);
   if (!context) {
     throw new Error('useExecutionMode must be used within ExecutionModeProvider');
   }
   return context;
 };