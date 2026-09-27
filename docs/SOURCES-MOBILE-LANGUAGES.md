# Music sources, mobile install, notation beams and languages (v1.8)

## Music sources & files

Open **Sources** in the main navigation. The page has three purposes:

1. **Start Audio -> Notes quickly** by pasting a YouTube, Spotify or direct audio URL and choosing the melody target.
2. **Browse Latvian music resources** already included in Music 63. Use the search/filter field to find a composer/site/category quickly.
3. **Keep your own source links and uploads**. Add a URL/title/note in the personal source form, or upload an audio/MIDI/MusicXML/PDF/image file.

Uploaded audio has its own Play control and **Use -> Audio Notes** action. Uploaded MIDI and MusicXML can be imported into the score editor. Files can also be opened or deleted from the source library.

Music 63 stores bookmarks/metadata only. It does not copy third-party sheet music or protected audio into the application automatically.

## One melody line from a song

Open **Audio -> Notes** from the main navigation.

1. Add an MP3/WAV/OGG/FLAC/M4A file, direct audio URL, YouTube URL or Spotify URL.
2. Choose the destination: **Clarinet B-flat melody**, **Piano right hand**, Accordion melody, saxophone or the current part.
3. Keep **One-line melody only (recommended)** selected for a normal lead melody.
4. For YouTube/Spotify, start the embedded source, choose **Capture playing tab**, select the tab containing the music and enable **Share tab audio** in the browser chooser.
5. Stop capture / read the audio. Music 63 creates a draft first.
6. Review the draft, then Replace or Append. The imported notes become normal editable score notes.

For a dense commercial mix, one-line melody mode is intentionally preferred. It suppresses much of the accompaniment instead of trying to write every instrument into one staff.

## Optional chords / left hand

Enable **Detect simple chord draft** if you also want harmony suggestions. The chord draft can be applied as:

- chord symbols above the melody;
- a simple **Piano left-hand** chord part; or
- a simple **Accordion chord** part.

This is a draft accompaniment rather than a full arrangement. Edit voicing/rhythm in the score after import.

## Beamed eighth and sixteenth notes

In the Music Editor, enable **Join 1/8 & 1/16 notes with top beams**. Consecutive short notes are grouped by beat and drawn with connecting top beams. Sixteenth-note pairs receive the secondary beam where applicable.

Quarter notes are intentionally not joined with beams because standard staff notation writes quarter notes with individual stems.

## Android install

Use current Chrome or Edge on Android, open Music 63 over HTTPS, then press **Install app** inside Music 63 or use the browser menu -> Install app / Add to Home screen.

## iPhone / iPad install

Open Music 63 in Safari, tap **Share**, then **Add to Home Screen**. The app includes an Apple touch icon and standalone PWA metadata.

## macOS

In supported Safari versions use **File -> Add to Dock**. Chrome/Edge can also offer the standard PWA install control.

## Languages

The language switch is available on the login page, sidebar/top bar and Settings. Included choices are:

- English / Latvian
- German / Spanish / French / Polish
- Russian / Ukrainian
- Lithuanian / Estonian
- Swedish / Norwegian / Danish / Finnish / Icelandic

Core UI text is built into the app and works without an API call. When the OpenAI connection is configured, remaining help/interface phrases are translated once and cached server-side. User-created song names, lyrics, file names, note names, MIDI data and musical symbols are excluded from automatic UI translation so musical content is not accidentally changed.
