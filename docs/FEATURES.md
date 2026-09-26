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
- Synthesized browser audition; final realistic sound is best produced in Ableton with licensed instruments/samples

## Security
- Password login
- Server-side password hashes
- Session cookies
- CSRF tokens for writes
- Admin/user roles
- Storage denied from direct web access by Apache `.htaccess`
