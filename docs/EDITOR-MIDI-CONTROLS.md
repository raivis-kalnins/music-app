# Music 63 v1.3 - Editor, MIDI keyboard and photo import

## New Music Editor

The **Music Editor** replaces the old form-heavy editor with a score-first workspace:

- Left notation palette: Note / Rest / Select / Erase.
- Whole, half, quarter, eighth and sixteenth note input.
- Auto, sharp, flat and natural accidentals.
- Key, time signature, bar count, bars per row, zoom and note-name display.
- Click an empty staff position to add a note or rest.
- Click a note to edit lyric, duration, velocity, bar, beat and written MIDI pitch.
- Drag an existing note vertically/horizontally to change pitch and timing.
- Delete / Backspace deletes the selected note. Arrow keys nudge pitch/timing.
- Instrument panel supports B-flat clarinet, E-flat alto sax, B-flat tenor sax, piano, accordion, guitar and violin.
- Piano keyboard is built into the bottom of the editor.

## MIDI keyboard -> notes

1. Open **Music Editor**.
2. Press **Connect MIDI** and allow MIDI access in Chrome or Edge.
3. Turn on **Write notes ON**.
4. Choose a duration in the left palette.
5. Play the M-Audio Keystation 88 II.

The note is heard with Studio Warm and is also inserted at the current score cursor. For transposing instruments the saved staff note is written pitch while playback remains at the correct sounding pitch.

For free-time recording, quantization and takes, use the **MIDI 88** page. The editor input is deliberately simple step entry.

## MIDI controller controls / MIDI Learn

The MIDI 88 page can map keyboard knobs, sliders or pedals to:

- modulation / vibrato
- master volume
- expression
- warmth
- brightness / tone
- room / reverb
- attack
- release
- sustain
- Play / Stop / Record transport actions

Default mappings are CC1 Modulation, CC7 Volume, CC11 Expression, CC64 Sustain, CC71 Warmth, CC74 Brightness and CC91 Reverb.

To remap a control, press **Learn** next to a target and move the desired physical knob/slider/pedal. The mapping is stored in that browser.

### Program Change sound loading

When **Program Change on keyboard loads matching instrument sound** is enabled, standard GM-style program changes can switch the monitor sound to piano, accordion, guitar, violin, alto sax, tenor sax or clarinet. This changes the monitor sound only; it does not silently rewrite an existing score part.

## Audio and file export

From the editor Export menu:

- MIDI - selected part
- MIDI - all parts
- MusicXML
- Studio Warm WAV audio
- Print / PDF

The browser WAV export renders the complete arrangement using the included Studio Warm samples. For final production-quality sample libraries, export MIDI or use MIDI Thru into Ableton Live.

## Handwritten / photo import

Use **Import photo** in the Music Editor. The photo remains visible beside the digital score so you can trace it manually.

If `OPENAI_API_KEY` is configured on the server, **AI read notes** sends the selected image to the configured vision-capable model and requests structured written-pitch notation. The imported result is intentionally treated as a draft: review every pitch, rhythm, accidental, rest and chord before saving.

For B-flat / E-flat instruments the photo reader is instructed to read the **written staff pitch**, not concert pitch. Music 63 performs instrument transposition only during playback/export where appropriate.

## v1.4 note deletion and handwriting changes

For easier correction, click a note and use the new quick **Delete note** button above the score. You can also use the red **Delete notes** tool, Delete/Backspace, or right-click. Undo/Redo is available from the left panel and with Ctrl+Z/Ctrl+Y.

Handwritten images now open beside the digital score. Rotate, zoom or increase contrast as needed. The AI reader produces a review draft instead of changing the score immediately. Only **Replace current part** or **Append to current part** applies the detected notes.

See `EASY-EDIT-HANDWRITING.md` for the complete step-by-step workflow.
