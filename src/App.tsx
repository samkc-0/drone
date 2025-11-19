import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useChallengeAudio } from "@/hooks/useChallengeAudio";

import "./index.css";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export type SliderRange = {
  min: string;
  max: string;
};

export type Challenge = {
  id: number;
  name: string;
  sliderInitialTone: string;
  sliderRange: SliderRange;
  sliderStep: "semitone" | "quartertone" | "major_third" | string; // allow custom steps
  sliderSynthId: number;
  droneSynthId: number;
  droneNote: string;
  interval: string; // could be refined if you want interval enums
};

type ChallengeStatus = "completed" | "active" | "locked";

export function App() {
  const [challenges, setChallenges] = useState<Challenge[] | null>(null);

  useEffect(() => {
    fetch("/api/challenges")
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        console.log(data);
        setChallenges(data);
      });
  }, []);

  if (!challenges) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <IntervalGame challenges={challenges} />;
    </>
  );
}

export default App;

type IntervalGameProps = {
  challenges: Challenge[];
};

// Manages the state of the game, and tracks user progress

export function IntervalGame({ challenges }: IntervalGameProps) {
  const [challengeIdx, setChallengeIdx] = useState<number>(() => {
    const currentChallenge = localStorage.getItem("currentChallenge");
    if (currentChallenge) {
      return parseInt(currentChallenge);
    }
    return 0;
  });

  const [completed, setCompleted] = useState<Set<number>>(
    () => new Set<number>(),
  );

  const currentChallenge = challenges && challenges[challengeIdx];

  const isCompleted = (c: Challenge) => {
    return completed.has(c.id);
  };

  const isUnlocked = (i: number) => {
    if (i === 0) return true;
    return completed.has(challenges[i - 1].id);
  };

  const getChallengeStatus = (index: number): ChallengeStatus => {
    if (!isUnlocked(index)) return "locked";
    if (isCompleted(challenges[index])) return "completed";
    return "active";
  };

  // handle progress update when a challenge is completed
  const handleChallengeSuccess = () => {
    const curr = challenges[challengeIdx];

    // set the current challange to complete
    setCompleted((prev) => {
      const completed = new Set(prev);
      completed.add(curr.id);
      return completed;
    });
  };

  const goToNext = () => {
    setChallengeIdx((i) => Math.min(i + 1, challenges.length - 1));
  };

  const goToPrev = () => {
    setChallengeIdx((i) => Math.max(i - 1, 0));
  };

  // watch when a completed is updated, move to the next challange
  useEffect(() => {
    const curr = challenges[challengeIdx];
    if (!completed.has(curr.id)) return;
    const nextIdx = challenges.findIndex((c, i) => {
      return i > challengeIdx && !completed.has(c.id);
    });
    if (nextIdx !== -1) {
      setChallengeIdx(nextIdx);
    }
    // else there are no more challenges
  }, [completed, challengeIdx]);

  if (!currentChallenge) {
    return <div>Challenge not found</div>;
  }

  if (!challenges) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {isUnlocked(challengeIdx) ? (
        <ChallengeView
          challenge={currentChallenge}
          status={getChallengeStatus(challengeIdx)}
          onSuccess={handleChallengeSuccess}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Locked</CardTitle>
          </CardHeader>

          <CardContent>
            <CardDescription>
              You need to complete the previous challenge to unlock this one.
            </CardDescription>
          </CardContent>
        </Card>
      )}

      <div>
        <Button onClick={goToPrev} disabled={challengeIdx === 0}>
          Prev
        </Button>

        <Button onClick={goToNext} disabled={isUnlocked(challengeIdx + 1)}>
          Next
        </Button>
      </div>

      <ul>
        {challenges.map((ch, i) => (
          <li key={ch.name}>
            {ch.name} – {getChallengeStatus(i)}
          </li>
        ))}
      </ul>
    </div>
  );
}

type ChallengeViewProps = {
  challenge: Challenge;
  status: ChallengeStatus;
  onSuccess: () => void;
};

export function ChallengeView(props: ChallengeViewProps) {
  const { playSliderPitch, stopSlider, startDrone, stopDrone, stopAll } =
    useChallengeAudio(props.challenge);
  const { challenge, status, onSuccess } = props;

  const formatTitle = () => {
    const name = challenge.name;
    return name
      .split("_")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");
  };

  const handleSliderChange = (value: number[]) => {
    stopSlider();
    if (value[0] == null) {
      console.log("no value");
    }
    const x = value[0];
    const convertSliderToNote = () => {
      switch (x) {
        case 0:
          return "C3";
        case 1:
          return "D3";
        case 2:
          return "E3";
        case 3:
          return "F3";
        case 4:
          return "G3";
        case 5:
          return "A3";
        case 6:
          return "B3";
        case 7:
          return "C4";
      }
    };

    const note = convertSliderToNote().replace("3", "5");
    console.log("playing note", note, " and drone is ", challenge.droneNote);

    if (note) {
      playSliderPitch(note);
    }
  };

  const handleSubmit = () => {
    onSuccess();
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-bold justify-center">
          <h1>{formatTitle()}</h1>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Slider
          defaultValue={[0]}
          max={7}
          step={1}
          onValueChange={handleSliderChange}
        />
        <Button onClick={stopDrone}>Stop</Button>
        <Button onClick={startDrone}>Start</Button>
        <Button onClick={handleSubmit}>submit</Button>
        <Button onClick={stopAll}>Stop All</Button>
      </CardContent>
    </Card>
  );
}

type SliderProps = React.ComponentProps<typeof Slider> & {
  handleChange: (value: number[]) => void;
};

export function SliderDemo({ className, handleChange, ...props }: SliderProps) {
  return (
    <Slider
      defaultValue={[50]}
      max={100}
      step={1}
      className={cn("w-[60%]", className)}
      onValueChange={handleChange}
      {...props}
    />
  );
}

type SliderStepName = "semitone" | "quartertone" | "major_third";

function stepNameToSemitones(step: SliderStepName): number {
  switch (step) {
    case "semitone":
      return 1;
    case "quartertone":
      return 0.5;
    case "major_third":
      return 4; // major third = 4 semitones
    default:
      return 1;
  }
}
