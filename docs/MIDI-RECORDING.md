# MIDI 88 - live monitor, recording and Ableton

## Hear the Keystation

1. Open Music 63 in Chrome or Edge over HTTPS.
2. Open `MIDI 88`.
3. Connect the M-Audio Keystation by USB.
4. Click `Connect / refresh MIDI` and allow MIDI access.
5. Leave `Monitor sound while I play` enabled.
6. Choose `Auto - use selected part` or a specific monitor instrument.
7. Keep `Studio Warm - multisampled` selected.
8. Use `Test warm sound` to preload the selected instrument and confirm browser audio before playing the hardware keyboard.

A Keystation is a MIDI controller: MIDI carries performance data, not audible sound. Music 63 supplies the local Studio Warm sample engine for monitoring. The first load of an instrument can take a moment; afterwards the browser caches it.

## Record a live take

Choose a target part, `Live performance`, BPM, quantize and count-in. Click `Record`, play, then click `Stop`. The take is kept separately until you choose `Add take to score` or `Replace part`.

Exports:

- `Export take MIDI` - best format for editing, orchestration and Ableton Live.
- `Export warm WAV` - audio render using the same Studio Warm instrument, warmth and room settings used for playback.

For transposing instruments, keep `Convert concert keyboard pitch to correct written pitch...` enabled. A concert-pitch keyboard performance is then stored as the correct written clarinet/sax notation while playback/export sounds at concert pitch.

## Step recording

Choose `Step input`, choose the start bar/beat and note duration, click `Record`, and play individual notes. Each note advances the cursor by the chosen duration.

## Ableton live monitoring

Browsers cannot create a new virtual MIDI port by themselves. On Windows, create a virtual MIDI port with software such as loopMIDI (or use another existing virtual/hardware MIDI output). Select that port in Music 63 under `MIDI output`, enable `MIDI Thru`, enable the same port as an input in Ableton Live, and arm a MIDI track with your preferred instrument/VST.

For the highest quality finished audio, export MIDI and render/mix in Ableton with your licensed instrument or sample libraries.


## Studio Warm controls

`Warmth` softens bright upper harmonics; `Room / reverb` adds natural space. Around 68% warmth and 24% room is a good starting point. Choose `Light Synth` only when you need a very low-CPU fallback.
