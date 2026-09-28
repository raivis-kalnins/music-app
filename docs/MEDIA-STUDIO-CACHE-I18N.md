# Music 63 v1.9 - translations, Media Studio and cache reset

## Complete UI translation

Choose the language from the top bar, sidebar or **Settings -> App & language**. Music 63 first applies its bundled language pack, then translates any remaining interface/help strings in batches through the configured server-side OpenAI connection. The result is cached in the browser and on the server so the same interface text does not need to be translated repeatedly.

The translator now includes normal page text, buttons, select-menu options, placeholders, titles and accessibility labels. User-entered titles, lyrics, filenames and score data are excluded from automatic translation.

If a page still shows old mixed-language text after upgrading, use **Settings -> Clear app cache -> Clear cache & reload** once.

## Clear cache

The cache reset removes:

- Music 63 PWA Cache Storage entries;
- the local UI-translation cache;
- stale application files from the next reload.

It does **not** delete server users, passwords, songs, uploaded media or server settings.

## Media Studio

Open **Media Studio** from the main navigation.

### Uploaded media

Use Sources to upload an audio/video file you own or are allowed to edit. Supported media now includes MP3, WAV, OGG, FLAC, M4A/AAC, MP4, WebM and MOV/M4V.

In Media Studio you can:

1. preview the uploaded audio/video;
2. choose trim start/end seconds;
3. change output volume;
4. export an edited WAV;
5. export an edited MP4 when FFmpeg is available on the hosting account.

Music 63 checks FFmpeg availability automatically. Shared cPanel accounts do not always provide it; when unavailable, browser score/backing WAV and MIDI export still work normally.

### YouTube and Spotify

YouTube/Spotify URLs are kept as reference/playback sources. Use **Audio -> Notes** and the browser's explicit **Share tab audio** permission to analyse a passage into editable notation. Music 63 does not download, rip or convert protected provider streams into MP4 files.

For an MP4 editing workflow, upload a media file you own or have permission to edit.

## Rebuild background / accompaniment

Audio -> Notes can optionally detect a chord draft. After applying that draft to the score, Media Studio can create a new accompaniment using Piano, Accordion or Guitar.

This backing is generated from the chord symbols; it is not copied from the original recording. It becomes a normal editable score part and can be exported as WAV or MIDI for further work in Ableton.
