/**
 * Générateur d'avatars colorés basé sur une chaîne d'entrée
 */

/**
 * Génère une couleur hexadécimale basée sur une chaîne
 */
export function generateColorFromString(str: string): string {
  // Utilisation d'une somme de hachage simple pour générer un nombre unique
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convertir en une couleur HSL pour plus de contrôle sur la luminosité et la saturation
  const h = Math.abs(hash) % 360;  // Teinte de 0-360
  const s = 70 + (Math.abs(hash) % 20); // Saturation entre 70-90%
  const l = 45 + (Math.abs(hash) % 15); // Luminosité entre 45-60%
  
  return `hsl(${h}, ${s}%, ${l}%)`;
}

/**
 * Génère une couleur de texte adaptée (clair/foncé) en fonction de la couleur de fond
 */
export function generateTextColorForBackground(bgColor: string): string {
  // Si la couleur est au format HSL
  if (bgColor.startsWith('hsl')) {
    // Extraire la luminosité (L) du HSL
    const match = bgColor.match(/hsl\(\s*\d+\s*,\s*\d+%\s*,\s*(\d+)%\s*\)/);
    if (match && match[1]) {
      const luminosity = parseInt(match[1], 10);
      // Si la luminosité est supérieure à 60%, le texte devrait être sombre
      return luminosity > 60 ? '#000000' : '#ffffff';
    }
  }
  
  // Par défaut, on retourne blanc qui est souvent un choix sûr
  return '#ffffff';
}

/**
 * Génère un dégradé CSS basé sur une chaîne
 */
export function generateGradientFromString(str: string): string {
  const color1 = generateColorFromString(str);
  
  // Créer une variation de la couleur pour le dégradé
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Décaler la teinte pour la seconde couleur
  const h = (Math.abs(hash) % 360 + 40) % 360;
  const s = 70 + (Math.abs(hash) % 20);
  const l = 40 + (Math.abs(hash) % 15);
  
  const color2 = `hsl(${h}, ${s}%, ${l}%)`;
  
  return `linear-gradient(135deg, ${color1}, ${color2})`;
}

/**
 * Génère les initiales d'un nom d'utilisateur (1 ou 2 caractères)
 */
export function generateInitials(name: string): string {
  if (!name || name.length === 0) return "?";
  
  const words = name.split(/\s+/);
  if (words.length === 1) {
    return name.substring(0, 1).toUpperCase();
  }
  
  return (words[0].substring(0, 1) + words[words.length - 1].substring(0, 1)).toUpperCase();
}

/**
 * Génère un symbole ou une icône basée sur un slug pour les posts anonymes
 */
export function generateSymbolFromSlug(slug: string): string {
  const symbols = ['★', '♦', '♠', '♣', '♥', '◆', '●', '■', '▲', '◉', '✦', '✧', '✿', '❀', '✪'];
  const hash = slug.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  return symbols[Math.abs(hash) % symbols.length];
}