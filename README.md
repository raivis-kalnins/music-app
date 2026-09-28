# Music 63 Studio v2.14

## v2.13 piano staff input + handwriting pitch fixes

This update is intended to be installed over v2.12. It keeps the existing server configuration and storage when used as the update ZIP.

### Fixed
- Piano / accordion MIDI note entry now has **Auto / Treble / Bass** staff routing.
- Auto routing sends written C4 and above to treble and notes below C4 to bass.
- Existing piano notes can be moved between treble and bass from **Selected note → Staff**.
- Dragging a note between the two piano staves now changes its staff instead of leaving it locked to the previous staff.
- Handwriting pitch recognition now re-checks notehead position against the original blue-staff image before assigning the diatonic staff step. This reduces one-step errors such as B♭ being read on the neighbouring A position.
- F major remains a one-flat key and B on the treble middle line maps to B♭, not A♭.
- Flat key-signature and note accidental glyphs are larger and visually aligned so the flat loop sits on the intended staff line/space.
- New UI strings for piano staff routing include Latvian translations.

### Cache
Assets use cache version **v34** and service-worker cache **music63-v214**.


## Previous notes

## v2.12 score spacing + handwriting pitch cleanup

- Keeps locally scanned notes on the detected staff line/space and reapplies the selected/detected key signature before import.
- Corrects major/minor key-signature handling for staff movement and handwriting import (for example F major and D minor both use B-flat correctly).
- Filters small detached staccato/articulation dots more aggressively so they do not become extra notes/accidentals.
- Suppresses repeated accidentals inside a measure unless the pitch spelling actually changes.
- Enlarges and vertically centers key-signature accidentals so B-flat sits on the proper staff position.
- Adds consistent horizontal padding inside each measure and centers note-name labels below their noteheads.
- Cleans the right inspector layout to prevent horizontal overflow and aligns ensemble/chord controls.
- Makes lyrics buttons lighter and more compact.

# Music 63 Studio v2.7

## v2.7 handwriting accuracy + faster correction

- Stops stretching ordinary filled notes across large empty gaps; filled notes now default to quarter-note length and shorten when the next onset is closer.
- Detects open noteheads separately and defaults them to half-note length.
- Rejects small repeat-sign dots next to strong barlines so they are not imported as melody notes.
- Adds detected barline overlays on the photo so measure segmentation is easier to verify.
- Clicking any detected note marker now opens quick correction controls for pitch, time and duration, plus one-click removal.
- Staff-system selection is more prominent and shows note counts, which helps when one photo contains different voices/instruments.
- Still 100% local: no AI/API key is used for handwriting conversion.

## v2.6 handwriting scan + on-photo proofread

- Improved hand-drawn barline detection, including slightly slanted bar strokes.
- Corrected 1/8 and 1/16 timing so notes in the final half/quarter beat of a bar are not merged into beat 4.
- Added per-staff-system selection before import (useful when a photo contains separate vocal and instrument rows).
- Added numbered on-photo note markers with remove/add proofread tools.
- Added written-key selection and made 1/8 the recommended handwriting rhythm grid.

- Still fully local: no AI API key and no server image service required.
- Adds Balanced, Sensitive, and Deep scan modes; Deep is the default.
- Deep mode scans at higher resolution with several adaptive threshold passes.
- Preserves a colour analysis copy of the prepared photo so coloured staff lines can be separated from dark handwriting when possible.
- Rejects more clef/time-signature, stem, flag, chord-text, and post-barline false detections.
- Scan depth and rhythm quantization are separate, so Deep detection can be used with a practical 1/8 grid without forcing 1/16 timing.
- Every imported note remains editable in the normal score editor.

## v2.4 local-only handwriting scanner

- Handwriting photo scanning now works without any API key or AI connection.
- AI reader/test controls were removed from the handwriting import workflow.
- The scan button always uses the browser-based local handwriting scanner.
- Cache version bumped so older AI-gated handwriting UI is replaced after deployment/reload.


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
2. Use PHP 8.1+ (PHP 8.3 recommended) with sessions enabled. Apache is recommended because `.htaccess` protects storage.
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

## v1.9 complete localisation, Media Studio and cache tools

- Translation now covers ordinary text, buttons, select options, placeholders, titles and ARIA labels instead of translating only a small first batch. Missing strings are translated in repeated batches through the configured OpenAI connection and cached, so a page no longer stops halfway through with mixed English/Latvian text. Core MIDI/recording/media labels are bundled for all supported languages and Latvian has substantially expanded offline coverage.
- New **Settings -> Clear app cache -> Clear cache & reload** deletes Music 63 PWA caches and the browser translation cache, asks the service worker to update and reloads the newest files. It does not delete server songs, users or uploads.
- New **Media Studio** works with media uploaded by the user or media they otherwise have permission to edit. Uploaded audio/video can be previewed, trimmed, level-adjusted and exported to WAV or MP4 when FFmpeg is available on the host.
- MP4, WebM, MOV/M4V and AAC uploads are accepted in Sources.
- YouTube/Spotify remain reference/playback sources and can be sent to Audio -> Notes using browser-approved tab-audio capture. Music 63 intentionally does not rip or convert protected provider streams into downloadable files.
- **Rebuild backing** creates a fresh Piano, Accordion or Guitar accompaniment from chord symbols already detected/applied in the score. The rebuilt accompaniment is editable and can be exported as Studio Warm WAV or MIDI.

See `docs/MEDIA-STUDIO-CACHE-I18N.md`.

## v2.0 - YouTube/Spotify fix, Audio -> Notes redesign and classic notation

- Fixes YouTube embedded-player Error 153 by no longer suppressing the HTTP Referer; Music 63 now uses `strict-origin-when-cross-origin` and supplies the site origin to YouTube embeds.
- Audio -> Notes has a clearer three-step workflow for provider sources: preview/play -> Start listening -> choose the playing tab with Share tab audio -> Stop + create notes.
- Standalone Audio -> Notes receives a polished dark studio UI with stronger hierarchy and clearer capture guidance.
- Built-in Latvian translations are expanded across Audio -> Notes, editor controls and source workflows.
- Notis.lv is removed from the built-in source list. The default Latvian resources now prioritise the Latvian National Library, Latvian National Centre for Culture, Latvian Music Information Centre, Musica Baltica and selected composer/music resources.
- Time signatures use classic stacked engraving (4 above 4, etc.) directly beside the clef.
- The editor layout is refined for more usable score space while keeping note deletion, MIDI entry, Studio Warm playback and export controls easy to reach.

See `docs/V2-AUDIO-EDITOR-FIXES.md`.

## v2.1 - passage correction, classic meter placement and improved beams

- Clef and stacked time signature are placed on the staff before bar 1 in a more conventional engraved layout.
- New **Passage correction** tools let you work on one highlighted bar at a time after audio/MIDI import.
- **Snap timing**, **Clean extra notes**, **Join repeated notes**, and **Clear this bar** are undoable.
- Selected notes get quick earlier/later, shorter/longer, pitch and delete controls.
- The editing timing grid can be switched between 1/16, 1/8 and 1/4.
- Eighth/sixteenth-note beaming is more tolerant of imported timing and can use either **Classic by beat** or **Continuous in bar** grouping.
- Beam groups now choose a more natural stem direction and support secondary/tertiary beams.

See `docs/V2.1-SCORE-CORRECTION.md`.



## v2.3 - free on-device handwriting scan

- Handwritten melody photos can now be converted to editable notes without an API key.
- New **Free local scan (no API)** reader detects five-line staves and handwritten noteheads directly in the browser.
- The local draft can replace the current part, append to it, or create a new editable imported part.
- The optional AI reader remains available for difficult pages, chord letters and fuller symbol reading, but it is no longer required for normal handwritten melody import.
- Local scan is tuned for a single treble-clef melody line and estimates rhythm from note spacing; imported notes are intentionally reviewable/editable.

See `docs/V2.3-FREE-HANDWRITING-SCAN.md`.

## v2.2 - reliable handwriting photo conversion

- Handwriting import now prepares a high-contrast copy plus overlapping zoom strips before AI vision reading.
- Rotation chosen in the editor is applied to the prepared image used for recognition.
- New **Test image AI** confirms that the configured server model accepts image input.
- New status/error panel reports preparation, model, number of image views and recognition time instead of failing only through a temporary toast.
- New read modes: melody + chords, melody only, or all visible notes/rests.
- New accuracy control and start-bar offset.
- Converted notes always appear as a review draft first. The draft can replace, append, or create a new editable part.
- Server-side recognition allows longer processing time on shared hosting and reports PHP upload-limit problems clearly.

See `docs/V2.2-HANDWRITING-CONVERSION.md`.


## v2.8 - score setup, staff-accurate editing and ensemble workflow

- Handwriting review can auto-detect a visible key signature and common meter header locally, with conservative fallback to the selected score setup.
- Imported handwriting keeps detected diatonic staff positions so notes remain on the same musical staff steps instead of being respelled randomly.
- F major and other major/minor keys now render proper key signatures (for example F major = one flat, B-flat).
- Selected notes can move one staff step up/down from the inspector, quick strip, keyboard arrows, or by dragging. Semitone adjustment remains available separately.
- Piano and Accordion default to grand staff. Chord symbols can be entered at the cursor and an accompaniment part can be created/generated from them.
- Score-layout presets add small ensemble, concert band, kapella/folk-band, or orchestra instrument sets. Melody instruments can coexist with accompaniment parts.

## v2.10 runtime hotfix
Restores missing shared editor/audio helper functions and hardens the service worker against unsupported `chrome-extension://` cache requests. See `docs/V2.10-JS-RUNTIME-FIXES.md`.


## v2.11 compact notation controls
Fixes the cramped Voice layer control in the left notation palette, gives Voice 1 / Voice 2 equal compact buttons, makes accidental controls align cleanly, and adds contextual Help for voice layers and accidentals. Latvian help translations are included.


## v2.14
- MIDI Write mode now measures held-key duration and quantizes note length.
- Added real Delete bar command that removes the measure and shifts later measures.
- Improved handwriting staff-line geometry using blue-line refinement and local staff spacing.
- F-major/B-flat correction controls now include line/space movement and key-signature reapplication.
- Fixed downward eighth-note flag geometry.
- Single-voice stem direction is automatic: high notes stem down, low notes stem up; voice overrides apply only in true multi-voice passages.


## v2.15 – Sound + compact controls
- Score editor MIDI/mouse keyboard always auditions locally while the editor is open, even if MIDI-page monitor was previously disabled.
- Write Notes unlocks Web Audio and warms the selected instrument automatically.
- Short-key note-on/note-off race fixed in the browser audio engine.
- Long notation button labels use compact musical abbreviations and full tooltip/help text.
