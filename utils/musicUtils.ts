
// Chromatic scale for transposition
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export const transposeNote = (note: string, semitones: number): string => {
  const isFlat = note.includes('b');
  const scale = isFlat ? FLATS : NOTES;
  
  // Normalize note index
  let index = scale.indexOf(note);
  if (index === -1) {
    // Try finding in the other scale
    index = (isFlat ? NOTES : FLATS).indexOf(note);
  }
  if (index === -1) return note; // Return original if invalid

  let newIndex = (index + semitones) % 12;
  if (newIndex < 0) newIndex += 12;

  return scale[newIndex];
};

export const transposeChordString = (text: string, semitones: number): string => {
  // Regex to find chords in brackets like [C], [Am7], [G/B]
  // Or simpler: matches capital letters followed by optional #/b and modifiers, bounded by brackets
  return text.replace(/\[([A-G][#b]?[a-zA-Z0-9/]*)\]/g, (match, chord) => {
    // Handle slash chords like C/E
    if (chord.includes('/')) {
      const parts = chord.split('/');
      return `[${transposeNote(parts[0], semitones)}/${transposeNote(parts[1], semitones)}]`;
    }
    // Handle regular chords
    // Extract root note (e.g., "C#" from "C#m7")
    const rootMatch = chord.match(/^[A-G][#b]?/);
    if (!rootMatch) return match;
    
    const root = rootMatch[0];
    const suffix = chord.substring(root.length);
    const newRoot = transposeNote(root, semitones);
    
    return `[${newRoot}${suffix}]`;
  });
};
