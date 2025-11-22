import { Frequency } from "tone";

// maps a range like c3 to c5 and semitone=1 to a range of numbers
export function noteRangeToFrequency(lo: string, hi: string, toneStep: number) {
  const loMidi = Frequency(lo).toMidi();
  const hiMidi = Frequency(hi).toMidi();

  if (toneStep === 0) {
    return [loMidi, hiMidi];
  }

  if (toneStep < 0) {
    // return descending range with  negative toneStep
    let freqs = noteRangeToFrequency(lo, hi, -toneStep);
    freqs.reverse();
    return freqs;
  }

  const epsilon = 1e-9;
  const freqs = [];
  for (let midi = loMidi; midi <= hiMidi + epsilon; midi += toneStep) {
    freqs.push(midi);
    // clamp floating point overshoot
    const clamped = Math.min(midi, hiMidi);
    const freq = Frequency(clamped, "midi").toFrequency();
    freqs.push(freq);
  }
  return freqs;
}

export type NoteWithDelta = {
  noteName: string;
  noteMidi: number;
  deltaHz: number;
  deltaCents: number;
};

export function frequencyToNoteWithDelta(freqHz: number): NoteWithDelta {
  const midiFloat = Frequency(freqHz).toMidi();

  // nearest equal temperament note
  const nearestMidi = Math.round(midiFloat);
  const noteName = Frequency(nearestMidi, "midi").toNote();
  const canonicalFreqHz = Frequency(noteName).toFrequency();

  const deltaHz = freqHz - canonicalFreqHz;
  const deltaCents = 1200 * Math.log2(freqHz / canonicalFreqHz);

  return {
    noteName,
    noteMidi: nearestMidi,
    deltaHz,
    deltaCents,
  };
}

export function intervalNameToToneStep(name: string): number {
  const m = {
    quartertone: 0.5,
    semitone: 1,
    tone: 2,
    P1: 1,
    P2: 2,
    P3: 3,
    P4: 4,
    P5: 5,
    P6: 6,
    P7: 7,
    P8: 8,
    P9: 9,
    P10: 10,
    P11: 11,
    P12: 12,
    P13: 13,
    P14: 14,
    P15: 15,
    P16: 16,
    P17: 17,
    P18: 18,
    P19: 19,
  };
  if (name in m) {
    return m[name];
  }
  throw new Error("Unknown interval name: " + name);
}
