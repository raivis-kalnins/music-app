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
