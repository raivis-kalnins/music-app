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
- Browser playback using Web Audio instrument presets.
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

Built-in browser playback uses lightweight synthesized presets, not commercial sampled instruments. For realistic instrument sound, export MIDI to Ableton and use your licensed instruments/sample libraries.


## Hosting.com / cPanel

See `docs/HOSTING-COM-CPANEL.md` for the exact deployment and HTTP 500 checklist.
