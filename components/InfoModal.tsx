import React, { useEffect, useState } from 'react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  guessesPerSecondText: string;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, guessesPerSecondText }) => {
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
      // Trigger animation shortly after mount and isOpen is true
      const timer = setTimeout(() => {
        setContentVisible(true);
      }, 10); // Small delay for CSS transition to pick up
      return () => {
        clearTimeout(timer);
        document.removeEventListener('keydown', handleEscKey);
        document.body.style.overflow = 'auto';
      };
    } else {
      setContentVisible(false); // Reset for next open
      document.body.style.overflow = 'auto'; // Ensure scroll is restored if closed by prop change
      document.removeEventListener('keydown', handleEscKey); // Ensure listener is removed
    }
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="infoModalTitle"
    >
      <div 
        className={`bg-white rounded-lg shadow-xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out ${
          contentVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="infoModalTitle" className="text-2xl font-bold text-slate-800">Ako funguje Analyzátor?</h2>
          <button 
            onClick={onClose} 
            className="text-slate-500 hover:text-slate-700"
            aria-label="Zavrieť"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-5 text-slate-700 text-sm md:text-base leading-relaxed">
          <p>
            Vitajte v Analyzátore Sily Hesla! Tento nástroj vám pomôže pochopiť, aké bezpečné je vaše heslo a ako ho môžete vylepšiť.
            Funguje na niekoľkých princípoch:
          </p>

          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">1. Štrukturálna Analýza (Lokálna)</h3>
            <ul className="list-disc list-outside pl-5 space-y-1">
              <li><strong>Dĺžka:</strong> Základný kameň bezpečnosti. Dlhšie heslá sú exponenciálne ťažšie na prelomenie.</li>
              <li><strong>Rôznorodosť znakov:</strong> Aplikácia kontroluje použitie:
                <ul className="list-circle list-outside pl-5">
                    <li>malých písmen (a-z)</li>
                    <li>veľkých písmen (A-Z)</li>
                    <li>číslic (0-9)</li>
                    <li>špeciálnych symbolov (napr. !@#$%)</li>
                </ul>
                Kombinácia týchto typov znakov výrazne zvyšuje komplexnosť hesla.
              </li>
              <li><strong>Entropia:</strong> Na základe dĺžky a rôznorodosti znakov vypočítame "entropiu" – matematickú mieru náhodnosti a nepredvídateľnosti hesla. Vyššia entropia znamená silnejšie heslo.</li>
              <li>
                <strong>Odhadovaný čas na prelomenie:</strong>
                Podľa entropie odhadujeme, ako dlho by teoreticky trvalo útočníkovi heslo prelomiť metódou hrubej sily (skúšaním všetkých možných kombinácií). Tento odhad je založený na predpoklade <strong className="font-semibold">{guessesPerSecondText}</strong> pokusov za sekundu.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">2. Kontrola Bežných Hesiel (Lokálna)</h3>
            <p>
              Vaše heslo (bez ohľadu na veľkosť písmen) sa porovnáva so zabudovaným zoznamom veľmi častých a známych slabých hesiel (napr. "password", "123456", "qwerty"). Ak sa nájde zhoda, heslo je označené ako extrémne nebezpečné, pretože tieto heslá útočníci skúšajú ako prvé.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">3. Kontrola Únikov Dát (cez "Have I Been Pwned")</h3>
            <p>
              Overujeme, či sa vaše heslo objavilo v známych únikoch dát pomocou renomovanej služby{" "}
              <a href="https://haveibeenpwned.com/Passwords" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-medium">Have I Been Pwned (HIBP)</a>.
            </p>
            <p className="mt-2">
              <strong>Ako to robíme bezpečne (k-Anonymita)?</strong>
            </p>
            <ol className="list-decimal list-outside pl-5 space-y-1 mt-1">
              <li>Vaše heslo sa najprv prevedie na jedinečný digitálny odtlačok (SHA-1 hash) priamo vo vašom prehliadači.</li>
              <li>Z tohto odtlačku sa na server HIBP odošle <strong className="font-semibold">iba prvých 5 znakov</strong>. Vaše celé heslo ani celý odtlačok nikdy neopustí váš počítač v čitateľnej forme smerom k HIBP.</li>
              <li>Služba HIBP vráti zoznam všetkých koncoviek hashov, ktoré začínajú týmito 5 znakmi a boli nájdené v únikoch.</li>
              <li>Aplikácia potom lokálne (vo vašom prehliadači) porovná zvyšnú časť vášho hashu s týmto zoznamom.</li>
            </ol>
            <p className="mt-2">
              Ak sa nájde zhoda, znamená to, že heslo je kompromitované a nemali by ste ho používať nikde.
            </p>
          </section>
          
          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Vaše Súkromie je Prioritou</h3>
            <ul className="list-disc list-outside pl-5 space-y-1">
              <li>Celá štrukturálna analýza a kontrola bežných hesiel prebieha <strong className="font-semibold">iba vo vašom prehliadači</strong>.</li>
              <li>Vaše heslá sa <strong className="font-semibold">nikam neukladajú ani neposielajú</strong> v čitateľnej forme.</li>
              <li>Komunikácia s HIBP je anonymizovaná pomocou k-Anonymity, ako je popísané vyššie.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Odporúčania</h3>
            <p>
              Na základe všetkých týchto analýz vám poskytneme konkrétne tipy, ako môžete svoje heslo vylepšiť a zvýšiť tak svoju online bezpečnosť.
            </p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Zavrieť
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
