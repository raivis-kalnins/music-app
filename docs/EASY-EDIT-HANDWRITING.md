# Music 63 v1.4 - Easy editing and handwritten score import

## Removing or correcting notes

The editor now provides several simple ways to remove a wrong note:

1. **Click a note**. A quick-action strip appears above the score. Press **Delete note**.
2. Click the red **Delete notes** tool on the left, then tap any notes you want to remove.
3. Select a note and press **Delete** or **Backspace** on the keyboard.
4. Right-click a note to remove it immediately.

Every normal note add/delete/move is stored in the editor undo history. Use **Undo**, **Redo**, `Ctrl+Z`, `Ctrl+Y`, or `Ctrl+Shift+Z` if you make a mistake.

**Clear bar** removes every symbol from the current bar after a confirmation prompt. This can also be undone.

## Importing a handwritten page

The left panel shows three steps:

### 1. Load photo

Press **Load handwriting photo** and select a JPG, PNG or WebP image. On supported phones this can open the rear camera.

The photo opens beside the score. Use:

- Rotate left / right
- Photo zoom
- High contrast

This side-by-side mode is also the manual transcription workspace. Choose Note or Rest, choose a duration, then click the matching location on the digital staff.

### 2. Read & review with AI

When the server has `OPENAI_API_KEY` configured, press **Read this page with AI**.

Music 63 asks the model to read written pitch exactly as shown, including transposing-instrument notation. For example, a B-flat clarinet page is read as B-flat clarinet **written pitch**. Music 63 handles sounding transposition later during playback/export.

The recognition result does **not** immediately change the score. It appears as a draft with:

- detected key
- detected time signature
- symbol count
- overall confidence
- warnings
- low-confidence note indication
- a compact list of detected bar/beat/note/duration values

### 3. Apply

Choose one of:

- **Replace current part** - replace the selected instrument part with the AI transcription.
- **Append to current part** - keep existing notes and add the detected symbols.
- **Discard draft** - make no score changes.

After applying, play through the result and correct uncertain pitches, rhythms, accidentals and bar positions before saving/exporting.

## If AI reading says setup is required

Automatic music-photo reading is optional and requires a server-side OpenAI API key. The key must stay on the server; do not put it in browser JavaScript.

Open **Settings -> AI connection** as an administrator, paste your OpenAI API key, and press **Save & test**. You may still use a hosting `OPENAI_API_KEY` environment variable; it takes priority when present. The editor changes to **AI reader ready** when the connection is configured.

Manual side-by-side tracing works without an AI key.


## v1.5 note removal

For the simplest cleanup workflow, choose **Delete one-by-one**. Red X buttons appear on every note and rest. Click the X (or the note/rest itself) and it is removed immediately. MIDI score writing is temporarily switched off in this mode so playing the keyboard cannot accidentally add more written notes. Undo remains available.

The notation page also has more vertical space. Low ledger notes such as C3 now have extra room, and note-name/lyric text is placed below the note rather than on top of the ledger area.
