export interface PasswordAnalysis {
  score: number; // 0-4, maps to strength levels.
  strengthText: string; // e.g., "Slabé", "Silné"
  crackTimeText: string; // e.g., "Niekoľko sekúnd", "Roky"
  suggestions: string[]; // Tips to improve password strength
  entropy: number; // Calculated entropy in bits
  colorClass: string; // Tailwind CSS background color class for the strength indicator
  barWidthClass: string; // Tailwind CSS width class for the strength indicator bar
}
