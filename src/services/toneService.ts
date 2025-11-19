import * as Tone from "tone";

class ToneService {
  synths: Tone.PolySynth[] | Tone.Synth[];

  constructor() {
    this.synths = [];
    this.init();
  }

  init() {
    const synths0 = new Tone.Synth({
      oscillator: { type: "sawtooth" },
      envelope: { attack: 0.01, release: 0.2 },
    }).toDestination();

    const synth1 = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.05, release: 0.1 },
    }).toDestination();

    const synth2 = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
      envelope: { attack: 1.0, release: 2.0 },
    }).toDestination();

    const synth3 = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "fatsawtooth" },
      envelope: { attack: 0.4, release: 1.2 },
    }).toDestination();

    this.synths = [synths0, synth1, synth2, synth3];
  }

  attack(id: number, note: string) {
    const synth = this.synths[id % this.synths.length];
    if (!synth)
      return console.warn(
        "Synth not found:",
        id,
        "sythns looks like: ",
        this.synths,
      );
    synth.triggerAttack(note);
  }

  release(id: number) {
    const synth = this.synths[id % this.synths.length];
    if (!synth) return;
    if (synth instanceof Tone.PolySynth) synth.releaseAll();
    else synth.triggerRelease();
  }

  // drones:
  startDrone(id: number, note: string) {
    this.attack(id, note);
  }

  stopDrone(id: number) {
    console.log("stopping drone");
    this.release(id);
  }
}

export const toneService = new ToneService();
