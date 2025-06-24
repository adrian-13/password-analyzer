import React, { useState, useEffect, useCallback } from 'react';
import PasswordInput from './components/PasswordInput';
import StrengthFeedback from './components/StrengthFeedback';
import InfoModal from './components/InfoModal'; // Import the new modal component
import { analyzePassword, getGuessesPerSecond, checkPwnedPassword, debounce } from './utils/passwordUtils';
import { PasswordAnalysis } from './types';

const App: React.FC = () => {
  const [password, setPassword] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<PasswordAnalysis | null>(null);
  
  // HIBP State
  const [hibpPwnedCount, setHibpPwnedCount] = useState<number | null>(null);
  const [hibpIsLoading, setHibpIsLoading] = useState<boolean>(false);
  const [hibpError, setHibpError] = useState<string | null>(null);

  // Info Modal State
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  const toggleInfoModal = () => {
    setShowInfoModal(!showInfoModal);
  };

  useEffect(() => {
    const result = analyzePassword(password);
    setAnalysisResult(result);
  }, [password]);

  // Debounced HIBP check function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedCheckPwned = useCallback(
    debounce(async (currentPassword: string) => {
      if (!currentPassword) {
        setHibpPwnedCount(null);
        setHibpIsLoading(false);
        setHibpError(null);
        return;
      }
      const localAnalysis = analyzePassword(currentPassword);
      if (localAnalysis.crackTimeText === "Okamžite (známe heslo)") {
         setHibpPwnedCount(null); 
         setHibpIsLoading(false);
         setHibpError(null); // Clear previous error if any
         return;
      }

      setHibpIsLoading(true);
      setHibpPwnedCount(null);
      setHibpError(null);
      try {
        const count = await checkPwnedPassword(currentPassword);
        setHibpPwnedCount(count);
      } catch (error) {
        if (error instanceof Error) {
          setHibpError(error.message);
        } else {
          setHibpError('Nastala neznáma chyba pri kontrole úniku hesla.');
        }
        setHibpPwnedCount(null);
      } finally {
        setHibpIsLoading(false);
      }
    }, 750), 
    [] 
  );

  useEffect(() => {
    debouncedCheckPwned(password);
  }, [password, debouncedCheckPwned]);
  
  const guessesPerSecond = getGuessesPerSecond();

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 bg-gradient-to-tr from-sky-100 via-indigo-100 to-purple-100 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-lg space-y-8 mt-8 mb-8">
        <div className="bg-white/90 backdrop-blur-lg shadow-2xl rounded-xl p-6 md:p-10 space-y-6">
          <header className="relative">
            <div className="text-center pr-12 md:pr-14"> {/* Added pr-12 md:pr-14 here */}">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
                Analyzátor Sily Hesla <span role="img" aria-label="lock icon" className="inline-block">🔐</span>
              </h1>
              <p className="text-slate-600 mt-2 text-sm md:text-base">
                Zistite, aké silné je vaše heslo, ako ho vylepšiť, a či nebolo nájdené v únikoch dát.
              </p>
            </div>
            <button
              onClick={toggleInfoModal}
              className="absolute top-0 right-0 p-2 text-slate-500 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-full"
              aria-label="Informácie o aplikácii"
              title="Informácie o aplikácii"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 md:w-7 md:h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
              </svg>
            </button>
          </header>

          <main>
            <PasswordInput value={password} onChange={setPassword} />
            {analysisResult && ( 
              <StrengthFeedback 
                analysis={analysisResult}
                hibpPwnedCount={hibpPwnedCount}
                hibpIsLoading={hibpIsLoading}
                hibpError={hibpError}
                isPasswordEntered={password.length > 0}
              />
            )}
          </main>
        </div>
        
        <footer className="text-center mt-2">
          <p className="text-xs text-slate-600">
            Odhadovaný čas na prelomenie je založený na predpoklade <strong className="font-semibold text-slate-700">{guessesPerSecond.toLocaleString('sk-SK')}</strong> pokusov za sekundu.
            Reálna bezpečnosť závisí od mnohých ďalších faktorov.
          </p>
           <p className="text-xs text-slate-600 mt-1">
            Kontrola únikov dát zabezpečená službou{" "}
            <a href="https://haveibeenpwned.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 hover:underline font-medium">
              Have I Been Pwned
            </a>. Vaše heslo sa nikdy neposiela v čitateľnej forme.
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Vytvorené s <span role="img" aria-label="love" className="text-red-500">❤️</span> pomocou React, TypeScript a Tailwind CSS.
          </p>
        </footer>
      </div>
      <InfoModal 
        isOpen={showInfoModal} 
        onClose={toggleInfoModal} 
        guessesPerSecondText={guessesPerSecond.toLocaleString('sk-SK')} 
      />
    </div>
  );
};

export default App;
