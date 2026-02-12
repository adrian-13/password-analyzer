
import React from 'react';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ value, onChange }) => {
  return (
    <div className="mb-6">
      <label htmlFor="passwordInput" className="block text-sm font-medium text-slate-700 mb-1">
        Zadajte heslo:
      </label>
      <input
        type="password" // Using text to allow users to see what they type for immediate feedback
        id="passwordInput"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Sem napíšte heslo..."
        className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-lg"
        autoComplete="off"
        spellCheck="false"
      />
    </div>
  );
};

export default PasswordInput;
