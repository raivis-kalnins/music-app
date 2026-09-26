# Music 63 Studio

Private, password-protected PHP music notation and MIDI workspace intended for `music.63.lv`.

## Main features

- Password-protected multi-user login with admin/user roles and CSRF protection.
- Song library with title, composer, artist, lyricist, lyrics, source URL and rights notes.
- Score editor with multiple parts and basic staff notation preview.
- Instruments: B-flat clarinet, E-flat alto sax, B-flat tenor sax, piano, accordion, guitar and violin.
- Correct written-vs-sounding transposition for transposing instruments.
- 88-key Web MIDI input for M-Audio Keystation 88 II and similar controllers.
- Multi-track Standard MIDI export for Ableton Live plus per-part MIDI export.
- MIDI import and basic MusicXML import/export.
- Studio Warm local multi-sampled playback for piano, accordion, guitar, violin, clarinet and sax, with reverb/warmth controls; Light Synth remains as a fallback.
- Original Smart Composer works offline in the browser.
- Optional server-side AI composer when `OPENAI_API_KEY` is configured.
- Private uploads for PDF, MIDI, MusicXML, audio and images.
- Bookmarks to Latvian music/notation reference sources.
- JSON backup/restore, user management and password change.
- Installable PWA shell and mobile responsive interface.

## Install

1. Upload all files to the web root for `https://music.63.lv/`.
2. Use PHP 7.4+ (PHP 8.2+ recommended) with sessions enabled. Apache is recommended because `.htaccess` protects storage.
3. Make `storage/` and `storage/uploads/` writable by the PHP user.
4. Keep HTTPS enabled in production.
5. Optional AI composer: set `OPENAI_API_KEY` as a server environment variable. Do not put the key in JavaScript or commit it into this package.
6. Sign in with the administrator account that was seeded for this package, then change the password from Settings if desired.

## Ableton workflow

Open a song -> Editor -> `MIDI all`. Drag the exported multi-track `.mid` into Ableton Live. Then assign Ableton instruments/VSTs and mix/bounce the final audio in Ableton.

## Copyright / content

The source links in the app are references only. The app intentionally does not scrape or republish third-party sheet music, lyrics, audio or copyrighted melodies. Add/import content you own, created yourself, that is public domain, or that you are otherwise permitted to use.

## Notes about playback

Version 1.2 uses the bundled **Studio Warm** multi-sample engine by default. The local acoustic-style samples, velocity-sensitive tone, room reverb and smooth sustained-instrument looping are designed for much more natural practice/preview playback than the earlier oscillator engine. `Light Synth` is still available as a low-CPU fallback. For final production, MIDI export / MIDI Thru to Ableton remains available for licensed commercial instrument libraries. See `docs/SOUND-ENGINE.md`.


## Hosting.com / cPanel

See `docs/HOSTING-COM-CPANEL.md` for the exact deployment and HTTP 500 checklist.

## MIDI live monitor and recording (v1.1)

The MIDI 88 page now includes a complete live-performance workflow:

- Built-in low-latency Web Audio monitoring so a MIDI controller is audible immediately after `Connect / refresh MIDI`.
- Instrument monitor presets for piano, accordion, guitar, violin, B-flat clarinet, E-flat alto sax and B-flat tenor sax.
- Monitor volume, velocity curve, MIDI channel filter, semitone transpose and octave controls.
- Sustain pedal (CC64) and pitch-bend monitoring.
- Optional MIDI Thru to a selected Web MIDI output for external synths or a virtual MIDI port feeding Ableton Live.
- Live performance recording with BPM, 0/1/2-bar count-in, metronome and 1/16, 1/8 or 1/4 quantization.
- Step-entry recording for deliberate note-by-note input.
- Non-destructive take workflow: review/play a take, add it to a score, replace a part, or clear it.
- Per-take Standard MIDI export and local 44.1 kHz WAV render.
- The score editor's Play button now uses the same improved instrument engine.

MIDI/audio preferences are stored in the browser for that device. Song data continues to be stored on the server.

### Updating an existing installation

Use the `upgrade-only` ZIP when updating an existing `music.63.lv` installation. It intentionally does not contain `storage/` or `config.php`, so existing users, passwords, songs, uploads, settings and server configuration are preserved.

After uploading/extracting the update, reload the site twice or use a hard refresh (`Ctrl+F5`) so the PWA service worker replaces the old cached JavaScript.


## Studio Warm sound engine (v1.2)

- Local sample pack under `assets/sounds/` - no CDN dependency.
- Default for score playback, MIDI monitoring, take playback and WAV export.
- Warmth and room/reverb controls.
- First use of an instrument loads about 1 MB of samples and caches them in the browser.
