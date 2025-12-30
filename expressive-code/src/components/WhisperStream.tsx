'use client';

import { useEffect, useMemo, useState } from "react";

const phrases = [
  "the spaces between my words hold thunderstorms.",
  "i fold anxieties into constellations and pray you can read the sky.",
  "silence keeps asking me to translate what trembles underneath.",
  "i keep rehearsing relief that never quite arrives.",
  "some truths hesitate at the edge of my tongue, afraid of daylight.",
];

const shuffle = <T,>(input: T[]): T[] => {
  const cloned = [...input];
  for (let index = cloned.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [cloned[index], cloned[swapIndex]] = [cloned[swapIndex], cloned[index]];
  }
  return cloned;
};

const WhisperStream = () => {
  const orderedPhrases = useMemo(() => shuffle(phrases), []);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [phase, setPhase] = useState<"typing" | "waiting" | "erasing">("typing");

  useEffect(() => {
    const current = orderedPhrases[phraseIndex];

    const timeout = setTimeout(() => {
      if (phase === "typing") {
        const nextLength = displayed.length + 1;
        if (nextLength <= current.length) {
          setDisplayed(current.slice(0, nextLength));
        } else {
          setPhase("waiting");
        }
      } else if (phase === "waiting") {
        setPhase("erasing");
      } else {
        const nextLength = displayed.length - 1;
        if (nextLength >= 0) {
          setDisplayed(current.slice(0, nextLength));
        }
        if (nextLength <= 0) {
          setPhraseIndex((previous) => (previous + 1) % orderedPhrases.length);
          setPhase("typing");
        }
      }
    }, phase === "typing" ? 80 : phase === "waiting" ? 1600 : 30);

    return () => clearTimeout(timeout);
  }, [displayed, orderedPhrases, phraseIndex, phase]);

  return (
    <div className="whisper">
      <div className="whisper__prompt">whispers leaking out of the static:</div>
      <div className="whisper__line" aria-live="polite">
        <span className="whisper__text">{displayed}</span>
        <span className="whisper__cursor" />
      </div>
    </div>
  );
};

export default WhisperStream;
