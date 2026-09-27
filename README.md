
## OpenAI connection (v1.6)

Administrators can now connect the API directly inside **Settings -> AI connection**. Paste the API key there and use **Save & test**. The secret is stored server-side in `storage/private/openai.json`, is never returned to the browser, and is excluded from backups. A hosting `OPENAI_API_KEY` environment variable still takes priority when present. See `docs/API-CONNECTION.md`.
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
5. Optional OpenAI features: sign in as an administrator and use **Settings -> AI connection -> Save & test**. A hosting `OPENAI_API_KEY` environment variable is also supported. Never put the key in browser JavaScript.
6. Sign in with the administrator account that was seeded for this package, then change the password from Settings if desired.

## Ableton workflow

Open a song -> Editor -> `MIDI all`. Drag the exported multi-track `.mid` into Ableton Live. Then assign Ableton instruments/VSTs and mix/bounce the final audio in Ableton.

## Copyright / content

The source links in the app are references only. The app intentionally does not scrape or republish third-party sheet music, lyrics, audio or copyrighted melodies. Add/import content you own, created yourself, that is public domain, or that you are otherwise permitted to use.

## Notes about playback

Version 1.3 uses the bundled **Studio Warm** multi-sample engine by default. The local acoustic-style samples, velocity-sensitive tone, room reverb and smooth sustained-instrument looping are designed for much more natural practice/preview playback than the earlier oscillator engine. `Light Synth` is still available as a low-CPU fallback. For final production, MIDI export / MIDI Thru to Ableton remains available for licensed commercial instrument libraries. See `docs/SOUND-ENGINE.md`.


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

## Music Editor + controller update (v1.3)

Version 1.3 adds a score-first Music Editor inspired by desktop notation software: direct staff click entry, note dragging, a duration/accidental palette, instrument inspector, bottom piano keyboard, direct MIDI step entry, full-arrangement Studio Warm WAV export, and handwritten-photo reference/import.

The MIDI 88 page also adds expression, brightness, attack, release and modulation controls plus a **MIDI Learn** mapping panel for physical knobs/sliders/pedals and optional Program Change instrument loading.

See `docs/EDITOR-MIDI-CONTROLS.md` for the complete workflow.

## Easy edit + handwriting workflow (v1.4)

Version 1.4 focuses on making normal score correction and handwritten import much clearer:

- Selected notes get a visible quick-action strip above the score.
- A red **Delete selected** button is always available in the left palette when a note is selected.
- **Delete notes** mode lets you tap notes to remove them quickly.
- Right-click a note to remove it; Delete/Backspace still works.
- Undo/Redo buttons plus Ctrl+Z / Ctrl+Y (or Ctrl+Shift+Z) protect against accidental edits.
- **Clear bar** removes the current bar with confirmation and can be undone.
- Handwritten photos now open **side-by-side with the digital score**, instead of pushing the score far down the page.
- Photo rotate, zoom and high-contrast controls make phone photos easier to read.
- Handwriting import is shown as a 3-step flow: **Load photo -> Read & review -> Apply**.
- AI recognition creates a review draft first. It never replaces the current part until the user explicitly chooses Replace or Append.
- AI results show note count, detected key/time signature, warnings and low-confidence notes.
- If AI is not configured, the button explains the server setup instead of simply being disabled; manual tracing remains available.

See `docs/EASY-EDIT-HANDWRITING.md`.


## v1.5 editor usability update

- Wider notation/tool palette and roomier score systems for low/high ledger notes.
- Note-name/lyric labels move below low notes instead of colliding with ledger lines.
- Selecting a note displays a red X directly beside that note.
- `Delete one-by-one` displays a red X beside every note/rest. Clicking either the X or the symbol deletes it immediately.
- Delete mode automatically pauses MIDI `Write notes` so keyboard playing cannot add new score notes while cleaning up a passage.
- Larger invisible hit areas make notes much easier to select/delete with a mouse or touch screen.

## Audio -> editable notes (v1.7)

Version 1.7 adds a non-destructive audio transcription workflow directly to the Music Editor:

- Upload MP3, WAV, OGG, FLAC and browser-decodable M4A/AAC.
- Paste a direct audio URL and transcribe it when the remote host permits browser CORS access.
- Paste YouTube or Spotify, preview the source, then use browser-approved **Share tab audio** capture; Music 63 does not download or bypass protected provider streams.
- Local browser pitch recognition using Spotify Basic Pitch; no OpenAI API key is required for audio transcription.
- Melody-only cleanup or polyphonic detection, Clean/Balanced/Detailed sensitivity, 1/4-1/32 quantization and selectable start bar.
- Concert-audio -> correct written-pitch conversion for B-flat clarinet/tenor sax and E-flat alto sax.
- Draft-first workflow: review detected notes before Replace/Append.
- Applied notes are immediately editable/playable and export through MIDI, MusicXML, Studio Warm WAV and Print/PDF.

See `docs/AUDIO-TO-NOTES.md` for the workflow and browser limitations.

## v1.8 sources, mobile install, notation beams and languages

Version 1.8 makes the source-to-score workflow much easier to find:

- A dedicated **Audio -> Notes** page is available from the main navigation. It defaults to one melodic line rather than a full-band transcription.
- Choose the destination before reading audio: current part, **Clarinet B-flat melody**, **Piano right-hand melody**, Accordion melody, Alto Sax or Tenor Sax.
- Optional chord detection can keep chord symbols above the melody or create a simple Piano/Accordion accompaniment part.
- **Music sources & files** contains built-in Latvian resource bookmarks, search/filter, a form for saving personal source links, and a library of the user's uploaded files.
- Uploaded audio can be played in the source library and sent directly to Audio -> Notes. Stored MIDI and MusicXML can be imported back into the editor.
- YouTube/Spotify use normal embedded playback plus browser-approved tab-audio capture; Music 63 does not rip or bypass protected streams.
- Eighth and sixteenth notes can be automatically beamed into readable beat groups. Quarter notes remain separate, which is standard notation.
- Music 63 is installable as a PWA on Android and Apple devices. Android/Chrome/Edge uses the Install app prompt; iPhone/iPad uses Safari Share -> Add to Home Screen; supported macOS Safari versions can use File -> Add to Dock.
- Language selector: English, Latvian, German, Spanish, French, Polish, Russian, Ukrainian, Lithuanian, Estonian, Swedish, Norwegian, Danish, Finnish and Icelandic. Core UI translations are bundled; when the OpenAI connection is configured, remaining UI/help text is translated and cached server-side. User-entered song titles/lyrics are never silently translated.

See `docs/SOURCES-MOBILE-LANGUAGES.md` and the updated `docs/AUDIO-TO-NOTES.md`.
