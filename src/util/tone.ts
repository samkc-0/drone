import * as Tone from "tone";

function noteToMidi(note: string): number {
  return Tone.Frequency(note).toMidi();
}

function midiToNote(midi: number): string {
  return Tone.Frequency(midi, "midi").toNote();
}
