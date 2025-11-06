import React, { createContext, useContext, useState } from 'react';

const TabsContext = createContext<{
  value: string;
  onChange: (value: string) => void;
}>({ value: '', onChange: () => {} });

export function Tabs({
  children,
  value,
  onValueChange,
}: {
  children: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <TabsContext.Provider value={{ value, onChange: onValueChange }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`inline-flex items-center bg-gray-100 rounded-lg p-1 ${className}`}>
      {children}
    </div>
  );
}

export function TabsTrigger({ children, value }: { children: React.ReactNode; value: string }) {
  const { value: selectedValue, onChange } = useContext(TabsContext);
  const isSelected = selectedValue === value;

  return (
    <button
      onClick={() => onChange(value)}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        isSelected
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ children, value }: { children: React.ReactNode; value: string }) {
  const { value: selectedValue } = useContext(TabsContext);

  if (selectedValue !== value) return null;

  return <div>{children}</div>;
}
