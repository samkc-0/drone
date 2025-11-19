import { useEffect } from "react";
import { toneService } from "@/services/toneService";
type SliderRange = {
  min: string;
  max: string;
};
type Challange = {
  id: number;
  name: string;
  sliderInitialTone: string;
  sliderRange: SliderRange;
  sliderStep: "semitone" | "quartertone" | "major_third" | string;
  sliderSynthId: number;
  droneSynthId: number;
  droneNote: string;
  interval: string;
};
export function useChallengeAudio(challenge: Challenge) {
  // Start background drone when challenge changes
  useEffect(() => {
    // Example: drone is always backgroundInitialTone or sliderInitialTone
    toneService.startDrone(challenge.droneSynthId, challenge.droneNote);

    return () => {
      toneService.stopDrone(challenge.droneSynthId);
    };
  }, [challenge]);

  // Return helper for slider movement
  const playSliderPitch = (note: string) => {
    toneService.attack(challenge.sliderSynthId, note);
  };

  const stopSlider = () => {
    toneService.release(challenge.sliderSynthId);
  };

  const startDrone = () => {
    toneService.startDrone(challenge.droneSynthId, challenge.droneNote);
  };

  const stopDrone = () => {
    toneService.stopDrone(challenge.droneSynthId);
  };

  return { playSliderPitch, stopSlider, startDrone, stopDrone };
}
