/**
 * Audio preparation stub. The full pipeline (voice note -> transcript -> claim) is
 * intentionally NOT implemented yet. This file pins the interface so when audio
 * lands, the rest of the system already speaks the right shape.
 */

import type { ExtractedClaim } from "./extractClaim";

export interface AudioInput {
  /** data:audio/<mime>;base64,... */
  audioDataUrl: string;
  /** Hint for the transcription step. Optional. */
  languageHint?: "es" | "en";
}

export class AudioNotImplementedError extends Error {
  constructor() {
    super(
      "Audio claim extraction is not implemented yet. A future speech-to-text step will populate ExtractedClaim with the same shape returned by extractClaimFromImage."
    );
    this.name = "AudioNotImplementedError";
  }
}

export async function extractClaimFromAudio(input: AudioInput): Promise<ExtractedClaim> {
  void input;
  throw new AudioNotImplementedError();
}
