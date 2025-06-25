import React from 'react';
import { PasswordAnalysis } from '../types';

interface StrengthFeedbackProps {
  analysis: PasswordAnalysis;
  hibpPwnedCount: number | null;
  hibpIsLoading: boolean;
  hibpError: string | null;
  isPasswordEntered: boolean;
}

const StrengthFeedback: React.FC<StrengthFeedbackProps> = ({ 
  analysis, 
  hibpPwnedCount, 
  hibpIsLoading, 
  hibpError,
  isPasswordEntered
}) => {
  const { strengthText, crackTimeText, suggestions, colorClass, barWidthClass, score } = analysis;

  const isLocallyFlaggedCommon = analysis.crackTimeText === "Okamžite (známe heslo)";

  const renderHibpStatus = () => {
    if (!isPasswordEntered || (isLocallyFlaggedCommon && hibpPwnedCount === null && !hibpIsLoading && !hibpError) ) {
      // Don't show HIBP loading/results if password field is empty OR 
      // if it's already flagged by local common list and HIBP check was skipped for it.
      return null;
    }

    if (hibpIsLoading) {
      return (
        <div className="flex items-center text-sm text-slate-600">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Kontrolujem úniky dát...
        </div>
      );
    }

    if (hibpError) {
      return (
        <p className="text-sm text-red-600">
          <span role="img" aria-label="error icon" className="inline-block mr-1">⚠️</span> Chyba pri kontrole únikov: {hibpError.includes("Failed to fetch") ? "Problém s pripojením k službe." : "Služba dočasne nedostupná."}
        </p>
      );
    }

    if (hibpPwnedCount !== null) {
      if (hibpPwnedCount > 0) {
        return (
          <p className="text-sm font-semibold text-purple-700">
            <span role="img" aria-label="warning icon" className="inline-block mr-1">🚨</span> POZOR: Toto heslo bolo nájdené v {hibpPwnedCount.toLocaleString('sk-SK')} známych únikoch dát! Dôrazne odporúčame ho nepoužívať.
          </p>
        );
      } else {
        return (
          <p className="text-sm text-green-700">
            <span role="img" aria-label="check icon" className="inline-block mr-1">✅</span> Dobrá správa! Toto heslo nebolo nájdené v kontrolovaných verejných únikoch dát.
          </p>
        );
      }
    }
    return null; 
  };
  
  if (!isPasswordEntered && analysis.strengthText === "Zadajte heslo") {
    return (
      <div className="text-center p-6 bg-slate-50/70 shadow-md rounded-lg">
        <p className="text-slate-500">Zadajte heslo vyššie pre zobrazenie analýzy.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6 bg-white shadow-xl rounded-xl border border-slate-200/75">
      {/* Structural Strength Section */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-base font-medium text-slate-700">Štrukturálna sila hesla:</span>
          <span className={`text-base font-medium ${
            score === 0 ? 'text-red-600' :
            score === 1 ? 'text-orange-600' :
            score === 2 ? 'text-yellow-600' :
            score === 3 ? 'text-green-600' : 'text-emerald-700'
          }`}>{strengthText}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3.5 mb-4">
          <div
            className={`h-3.5 rounded-full ${colorClass} ${barWidthClass} transition-all duration-300 ease-in-out`}
            role="progressbar"
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={4}
            aria-label={`Sila hesla: ${strengthText}`}
          ></div>
        </div>
      </div>

      <div>
        <h3 className="text-md font-semibold text-slate-800 mb-1">Odhadovaný čas na prelomenie (štrukturálne):</h3>
        <p className={`text-slate-600 text-lg ${isLocallyFlaggedCommon ? 'font-bold text-red-700': ''}`}>{crackTimeText}</p>
        {isLocallyFlaggedCommon && <p className="text-xs text-red-600 mt-1">Toto je veľmi bežné heslo, ktoré útočníci skúšajú ako prvé.</p>}
      </div>

      {/* HIBP Status Section */}
      <div className="pt-4 mt-4 border-t border-slate-200/75">
        <h3 className="text-md font-semibold text-slate-800 mb-2">Kontrola únikov dát (Have I Been Pwned):</h3>
        {renderHibpStatus()}
      </div>

      {/* Suggestions Section (only if not locally flagged common and HIBP doesn't show it as pwned or still loading HIBP) */}
      {!isLocallyFlaggedCommon && (hibpPwnedCount === null || hibpPwnedCount === 0) && suggestions.length > 0 && (
        <div className="pt-4 mt-4 border-t border-slate-200/75">
          <h3 className="text-md font-semibold text-slate-800 mb-2">Odporúčania na zlepšenie:</h3>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="text-sm" dangerouslySetInnerHTML={{ __html: suggestion.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Overriding suggestion if password is pwned */}
      {hibpPwnedCount && hibpPwnedCount > 0 && (
         <div className="pt-4 mt-4 border-t border-slate-200/75">
          <h3 className="text-md font-semibold text-slate-800 mb-2">Dôležité odporúčanie:</h3>
            <p className="text-sm text-purple-700 font-semibold">
              Keďže toto heslo bolo nájdené v únikoch dát, je extrémne dôležité ho <strong>nikde nepoužívať</strong> a zmeniť ho všade, kde ste ho mohli použiť.
              Vytvorte si úplne nové, unikátne a silné heslo.
            </p>
         </div>
      )}

    </div>
  );
};

export default StrengthFeedback;
