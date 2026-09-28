# Feature map

## Notation & songs
- Multi-part score editor
- Basic staff rendering with note names, lyrics and chord symbols
- B-flat clarinet, E-flat alto sax, B-flat tenor sax, piano, accordion, guitar, violin
- Written/sounding pitch handling for transposing instruments
- Browser print-to-PDF

## MIDI / Ableton
- Web MIDI input
- 88-key A0-C8 virtual keyboard
- M-Audio Keystation 88 II workflow
- Basic MIDI import
- Single-part MIDI export
- Multi-track MIDI export for Ableton Live

## Interchange
- Basic MusicXML import/export
- Private uploads: PDF, MIDI, MusicXML, audio, images
- JSON backup and restore

## Composition
- Offline original Smart Composer
- Optional AI composer through a server-side API key
- Selected instruments become separate parts
- Studio Warm multi-sampled browser audition; Ableton with licensed instruments/samples remains available for final production

## Security
- Password login
- Server-side password hashes
- Session cookies
- CSRF tokens for writes
- Admin/user roles
- Storage denied from direct web access by Apache `.htaccess`

## MIDI Studio v1.1

- Live audible MIDI monitoring from M-Audio Keystation 88 II and other Web MIDI controllers.
- Instrument monitor presets: piano, accordion, guitar, violin, clarinet, alto sax and tenor sax.
- Velocity curves, volume, input channel, transpose and octave controls.
- Sustain pedal and pitch bend.
- MIDI Thru to a selected output for external sound modules / virtual Ableton routing.
- Live and step recording modes.
- Count-in, metronome and quantization.
- Take playback, add/replace score part, MIDI export and WAV export.

## Studio Warm audio v1.2

- Local multi-sample instrument pack for piano, accordion, guitar, violin, clarinet, alto sax and tenor sax.
- No external sample CDN required.
- Default sound for score playback, MIDI monitoring, take playback and WAV export.
- Velocity-sensitive level/tone, instrument-specific attack/release and subtle vibrato.
- Smooth looping for sustained instruments.
- Adjustable warmth and room/reverb.
- Gentle compression and stereo placement.
- Light Synth fallback for low-CPU devices.

## Easy score correction + handwriting v1.4

- Prominent Delete selected action for a selected note.
- Red tap-to-delete tool.
- Delete/Backspace and right-click deletion.
- Undo/redo history and keyboard shortcuts.
- Clear-current-bar action with confirmation.
- Side-by-side handwritten photo + score workspace.
- Photo rotate, zoom and high-contrast controls.
- Three-step handwriting flow: Load -> Read/review -> Apply.
- AI transcription review draft before any score replacement.
- Per-note AI confidence support and warnings.
- Clear manual-tracing path when AI is not configured.

## Audio -> Notes v1.7

- Audio source panel inside Music Editor.
- MP3/WAV/OGG/FLAC and browser-supported M4A/AAC input.
- Direct audio URL preview/transcription when CORS permits.
- YouTube and Spotify embedded preview plus explicit browser tab-audio capture (no stream ripping/downloading).
- In-browser Spotify Basic Pitch transcription model.
- Melody-only and polyphonic modes.
- Clean/Balanced/Detailed detection thresholds.
- 1/4, 1/8, 1/16 and 1/32 timing quantization based on song BPM.
- Start-bar control.
- Automatic concert-to-written pitch conversion for transposing score parts.
- Review draft with note count/range before Replace or Append.
- Imported notes remain fully editable and use all existing playback/export functions.

## Sources, one-line melody, PWA and languages v1.8

- Dedicated Audio -> Notes page in main navigation.
- Default one-line melody extraction intended for clarinet, piano right hand, accordion melody and saxophone.
- Optional simple chord draft from polyphonic detection.
- Chords can be retained as chord symbols or converted to a simple Piano/Accordion accompaniment part.
- Music sources hub with built-in Latvian reference links, search/filter and personal bookmarks saved per installation.
- Uploaded-file library with audio playback, Audio -> Notes handoff, MIDI/MusicXML re-import, open and delete actions.
- Android/Chrome/Edge install prompt and Apple PWA install guidance/icons/manifest support.
- Automatic beaming for adjacent eighth and sixteenth notes in normal beat groups; option can be disabled in the editor.
- UI language selector for EN, LV, DE, ES, FR, PL, RU, UK, LT, ET, SV, NO, DA, FI and IS.
- Bundled translations for core navigation/editor actions; optional server-side AI translation/cache for remaining UI/help strings.

## v1.9 - complete localisation, cache reset and Media Studio

- Localisation now runs across the complete rendered interface, including asynchronously-added controls, select options, placeholders, titles and ARIA labels. Core controls are bundled locally; any remaining built-in help text is translated through the configured OpenAI connection and cached server-side and in the browser.
- Settings includes **Clear app cache** to remove the PWA/offline cache and translation caches and reload the newest application files without deleting songs, users or uploads.
- **Media Studio** works with media the user has uploaded and has permission to edit. It previews audio/video, supports start/end trim and output level, and can export WAV or MP4 when FFmpeg is available on the server.
- YouTube and Spotify links are kept as references/playback sources. They can be used with the browser-authorised tab-audio workflow for note detection, but Music 63 does not download or rip provider streams into MP4.
- A new backing can be generated from chord symbols as an editable Piano, Accordion or Guitar score part and exported as a new Studio Warm WAV. This rebuilds accompaniment rather than copying the source recording.

## v2.0 - Audio source reliability and score UI

- YouTube Error 153 compatibility fix via a standards-compatible referrer policy and embed origin.
- Clear provider tab-audio capture workflow for YouTube/Spotify -> editable melody notes.
- Refreshed Audio -> Notes workspace styling and improved editor spacing/hierarchy.
- Expanded built-in Latvian localisation for the audio/editor/source workflows.
- Notis.lv removed; stronger Latvian library/cultural/publisher references added.
- Classic stacked time signatures positioned next to the clef.

## v2.1 score correction

- Highlight and correct one bar at a time.
- Snap dense imported passages to a 1/16, 1/8 or 1/4 grid.
- Reduce false/duplicate notes without clearing the entire score.
- Merge repeated adjacent pitches.
- Quick note timing, duration, pitch and delete controls.
- Classic stacked time signature beside the clef.
- Classic-by-beat or continuous eighth/sixteenth beaming.
