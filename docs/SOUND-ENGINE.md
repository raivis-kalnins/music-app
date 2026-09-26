# Studio Warm sound engine - Music 63 v1.2

Music 63 v1.2 replaces the old oscillator-first playback with **Studio Warm**, a local multi-sampled browser instrument engine.

## What changed

- Studio Warm is the default for **Score Editor Play**, **MIDI 88 live monitoring**, **take playback**, and **WAV export**.
- The app includes a local sample pack for piano, accordion, guitar, violin, B-flat clarinet, E-flat alto sax and B-flat tenor sax.
- The pack is stored under `assets/sounds/`; it does not need an external CDN.
- Velocity affects loudness and tone, so quiet and strong playing no longer sound identical.
- Sustaining instruments use smooth sample looping, natural attack/release and subtle instrument-specific vibrato.
- A room/reverb bus, gentle compression, stereo placement and adjustable warmth reduce the dry/robotic character.
- `Light Synth` remains available as a low-CPU fallback.

## Recommended settings

For normal practice start with:

- Sound engine: `Studio Warm - multisampled`
- Warmth: about 65-75%
- Room / reverb: about 18-28%
- Velocity: `Linear / natural`

For solo clarinet or sax, slightly increase Room. For piano, reduce Room if fast passages become too blurred.

## First load

The first time an instrument is used, Music 63 loads its local sample set (about 1 MB per instrument). The browser then caches those files. `Test warm sound` waits for the sample set before playing the test chord.

## Ableton

Studio Warm is intended to make Music 63 pleasant enough for practice, arranging and quick WAV demos. For a final commercial-quality recording, MIDI Thru / MIDI export to Ableton is still supported so you can use any licensed VST or sample library you prefer.
