import { PasswordAnalysis } from '../types';

const GUESSES_PER_SECOND = 10_000_000_000; // 10 billion guesses per second

const REGEX_LOWERCASE = /[a-z]/;
const REGEX_UPPERCASE = /[A-Z]/;
const REGEX_DIGITS = /[0-9]/;
const REGEX_SYMBOLS = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/;

const SYMBOL_POOL_SIZE = 32; // Approximate number of common symbols

const COMMON_PASSWORDS = [
  "password", "123456", "123456789", "qwerty", "12345", "12345678", "heslo", "admin", "123", "heslo123", "test", "test123", "p123456", "heslicko"
].map(p => p.toLowerCase()); // Store common passwords in lowercase for case-insensitive comparison

function getCharacterPoolSize(password: string): number {
  let poolSize = 0;
  if (REGEX_LOWERCASE.test(password)) poolSize += 26;
  if (REGEX_UPPERCASE.test(password)) poolSize += 26;
  if (REGEX_DIGITS.test(password)) poolSize += 10;
  if (REGEX_SYMBOLS.test(password)) poolSize += SYMBOL_POOL_SIZE;
  return poolSize;
}

function formatCrackTime(seconds: number): string {
  if (seconds < 0.01) return "Okamžite";
  if (seconds < 1) return "Menej ako sekunda";
  if (seconds < 60) return `${Math.ceil(seconds)} sekúnd`;
  
  const minutes = seconds / 60;
  if (minutes < 60) return `${Math.ceil(minutes)} minút`;
  
  const hours = minutes / 60;
  if (hours < 24) return `${Math.ceil(hours)} hodín`;
  
  const days = hours / 24;
  if (days < 30) return `${Math.ceil(days)} dní`;
  
  const months = days / 30;
  if (months < 12) return `${Math.ceil(months)} mesiacov`;
  
  const years = days / 365.25;
  if (years < 100) return `${Math.ceil(years)} rokov`;
  
  const centuries = years / 100;
  if (centuries < 10) return `${Math.ceil(centuries)} storočí`;

  return "Viac ako tisícročie";
}

export function analyzePassword(password: string): PasswordAnalysis {
  const length = password.length;

  if (length === 0) {
    return {
        score: 0, 
        strengthText: "Zadajte heslo", 
        crackTimeText: "-", 
        suggestions: ["Pre analýzu zadajte heslo."], 
        entropy: 0, 
        colorClass: "bg-slate-300",
        barWidthClass: "w-0"
    };
  }

  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    return {
      score: 0,
      strengthText: "Extrémne nebezpečné!",
      crackTimeText: "Okamžite (známe heslo)",
      suggestions: [
        "Toto heslo je na zozname veľmi bežných/uniknutých hesiel.",
        "**Okamžite ho zmeňte všade, kde ho používate!**",
        "Nikdy nepoužívajte bežné slová, frázy alebo jednoduché sekvencie.",
        "Silné heslo je unikátne, dlhé a komplexné."
      ],
      entropy: 0,
      colorClass: "bg-red-700",
      barWidthClass: "w-[5%]"
    };
  }
  
  const poolSize = getCharacterPoolSize(password);
  const entropy = poolSize > 1 ? length * Math.log2(poolSize) : (poolSize === 1 && length > 0 ? length * Math.log2(2) : 0) ;

  let score: number;
  let strengthText: string;
  let colorClass: string;
  let barWidthClass: string;

  if (entropy < 28) {
    score = 0;
    strengthText = "Veľmi slabé";
    colorClass = "bg-red-500";
    barWidthClass = "w-1/5";
  } else if (entropy < 36) {
    score = 1;
    strengthText = "Slabé";
    colorClass = "bg-orange-500";
    barWidthClass = "w-2/5";
  } else if (entropy < 60) {
    score = 2;
    strengthText = "Stredné";
    colorClass = "bg-yellow-500";
    barWidthClass = "w-3/5";
  } else if (entropy < 128) {
    score = 3;
    strengthText = "Silné";
    colorClass = "bg-green-500";
    barWidthClass = "w-4/5";
  } else {
    score = 4;
    strengthText = "Veľmi silné";
    colorClass = "bg-emerald-600";
    barWidthClass = "w-full";
  }

  if (length < 4 && score > 0) {
    score = 0;
    strengthText = "Príliš krátke";
    colorClass = "bg-red-500";
    barWidthClass = "w-1/5";
  }

  const combinations = Math.pow(2, entropy);
  const secondsToCrack = combinations === Infinity ? Infinity : combinations / GUESSES_PER_SECOND;
  const crackTimeText = formatCrackTime(secondsToCrack);

  const suggestions: string[] = [];
  if (length < 8) {
    suggestions.push("Použite aspoň 8 znakov. Dlhšie heslá sú výrazne bezpečnejšie.");
  } else if (length < 12 && score < 3) {
    suggestions.push("Pre lepšiu bezpečnosť zvážte aspoň 12-16 znakov.");
  }
  
  if (!REGEX_LOWERCASE.test(password)) {
    suggestions.push("Pridajte malé písmená (a-z) na zvýšenie komplexnosti.");
  }
  if (!REGEX_UPPERCASE.test(password)) {
    suggestions.push("Pridajte veľké písmená (A-Z) pre väčšiu variabilitu.");
  }
  if (!REGEX_DIGITS.test(password)) {
    suggestions.push("Pridajte číslice (0-9), aby bolo heslo ťažšie uhádnuteľné.");
  }
  if (!REGEX_SYMBOLS.test(password)) {
    suggestions.push("Pridajte špeciálne znaky (napr. !@#$%) pre maximálnu silu.");
  }
  
  if (suggestions.length === 0 && score < 4) {
      suggestions.push("Heslo je dobré, ale pridanie dĺžky alebo ďalšieho typu znakov ho môže ešte vylepšiť.");
  }
   if (suggestions.length === 0 && score === 4) {
      suggestions.push("Výborné heslo! Je dlhé a obsahuje rôzne typy znakov.");
  }
   if (poolSize <= 10 && length > 0) {
    suggestions.push("Heslo používa veľmi obmedzenú sadu znakov (napr. len čísla). Zvážte pridanie písmen a symbolov.")
  }

  return { score, strengthText, crackTimeText, suggestions, entropy, colorClass, barWidthClass };
}

export const getGuessesPerSecond = (): number => GUESSES_PER_SECOND;

// --- HIBP Integration ---

async function sha1(str: string): Promise<string> {
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-1', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.toUpperCase();
}

/**
 * Checks a password against the HIBP Pwned Passwords API.
 * @param password The password to check.
 * @returns The number of times the password has been pwned, or 0 if not found.
 * @throws Error if the API request fails.
 */
export async function checkPwnedPassword(password: string): Promise<number> {
  if (!password) return 0;

  const hash = await sha1(password);
  const prefix = hash.substring(0, 5);
  const suffix = hash.substring(5);

  const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
  
  if (!response.ok) {
    throw new Error(`HIBP API error: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  const lines = text.split('\n');

  for (const line of lines) {
    const [hashSuffix, countStr] = line.split(':');
    if (hashSuffix === suffix) {
      return parseInt(countStr, 10);
    }
  }
  return 0;
}

// Debounce utility
export function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced as (...args: Parameters<F>) => void; // Adjusted return type for typical debounce use
}
