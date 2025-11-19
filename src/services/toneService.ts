import * as Tone from "tone";

class ToneService {
  synths: Tone.PolySynth[] | Tone.Synth[];

  constructor() {
    this.synths = [];
    this.init();
  }

  init() {
    this.synths[1] = new Tone.Synth({
      oscillator: { type: "sawtooth" },
      envelope: { attack: 0.01, release: 0.2 },
    }).toDestination();

    this.synths[2] = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.05, release: 0.1 },
    }).toDestination();

    this.synths[3] = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
      envelope: { attack: 1.0, release: 2.0 },
    }).toDestination();

    this.synths[4] = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "fatsawtooth" },
      envelope: { attack: 0.4, release: 1.2 },
    }).toDestination();
  }

  attack(id: number, note: string) {
    const synth = this.synths[id % this.synths.length];
    if (!synth) return console.warn("Synth not found:", id);
    synth.triggerAttack(note);
  }

  release(id: number) {
    const synth = this.synths[id % this.synths.length];
    if (!synth) return;
    synth.triggerRelease();
  }

  // drones:
  startDrone(id: number, note: string) {
    this.attack(id, note);
  }

  stopDrone(id: number) {
    this.release(id);
  }

  stopAll() {
    this.synths.forEach((synth) => {
      synth.disconnect();
    });
  }
}

export const toneService = new ToneService();

