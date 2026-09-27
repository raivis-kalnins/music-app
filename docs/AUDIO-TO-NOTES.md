# Audio -> Notes (v1.8)

Music 63 can turn an audio source into an editable notation draft directly in the Music Editor.

## Where it is

Open **Audio -> Notes** directly from the main navigation. The same controls are also available from the Music Editor.

The transcription is non-destructive. Music 63 always makes a draft first. Nothing is put on the score until you choose **Replace current part** or **Append to current part**.

## MP3 / WAV / OGG / FLAC / M4A

1. Press **Upload audio**.
2. Choose the recording.
3. Choose **Melody only** or **Polyphonic**.
4. Set the song BPM close to the recording BPM.
5. Choose timing grid and start bar.
6. Press **Read audio -> notes**.
7. Review the draft and then Replace or Append.

MP3, WAV, OGG and FLAC are the most reliable browser formats. M4A/AAC works when the user's browser can decode that file.

## Direct MP3/WAV URL

Paste the URL and press **Add / preview source**, then **Read audio -> notes**.

Remote servers can block browser access with CORS. If that happens, download/upload the audio file yourself or use tab-audio capture.

## YouTube and Spotify

Music 63 embeds the source for playback but does not download or bypass the provider's protected stream.

1. Paste the YouTube or Spotify URL and press **Add / preview source**.
2. Press **Capture playing tab**.
3. Chrome/Edge opens its normal screen/tab share chooser.
4. Select the tab playing the music and enable **Share tab audio**.
5. Play the passage you want to transcribe.
6. Return to Music 63 and press **Stop & read notes**.
7. Review and Apply the transcription draft.

Tab-audio capture requires HTTPS and a desktop browser with `getDisplayMedia` audio sharing, normally current Chrome or Edge.

## Transcription settings

### Read as

- **Melody only**: keeps one strongest likely melody note at each quantized onset. Recommended for clarinet, saxophone, violin, vocal melody and lead lines.
- **Polyphonic**: keeps simultaneous detected notes. Better for piano/chords, but a full commercial mix can produce many extra notes.

### Detection

- **Clean**: higher thresholds, fewer false notes.
- **Balanced**: general-purpose default.
- **Detailed**: keeps more quiet/short notes and therefore may also add more false notes.

### Timing grid

Choose 1/4, 1/8, 1/16 or 1/32. Detected note starts and durations are quantized to that grid using the song BPM.

### Written pitch for transposing instruments

Source audio is concert/sounding pitch. With **Convert concert audio to correct written pitch** enabled, Music 63 converts the transcription into the notation expected by the currently selected part:

- B-flat clarinet / tenor sax: written pitch is transposed from the sounding source.
- E-flat alto sax: written pitch is transposed from the sounding source.
- Piano, guitar, accordion and violin remain at concert pitch.

This option is enabled by default.

## Editing after import

Once you Apply the draft, imported notes behave exactly like notes entered by mouse or MIDI:

- click a note to select it;
- drag to change pitch/timing;
- use the red X to delete one note;
- use Delete/Backspace;
- Undo/Redo;
- play through Studio Warm sounds;
- export MIDI, multi-track MIDI, MusicXML, WAV or Print/PDF.

## Accuracy

Audio-to-score transcription is an assistant, not a final engraving pass. A clean solo melody normally gives a much more useful result than a dense mastered song containing drums, bass, vocals, backing instruments and effects. Always review rhythm, accidentals, octave and note boundaries before saving or publishing.

## Engine and privacy

Pitch transcription runs in the browser using Spotify's open-source **Basic Pitch** TensorFlow.js model. The model is loaded from jsDelivr when this feature is first used. The selected local audio is decoded and analyzed in the browser; it is not sent to the Music 63 OpenAI connection.

The rest of Music 63 continues to work if this model CDN is unavailable; only Audio -> Notes is affected.


## v1.8: choose one destination melody first

The default workflow is now deliberately **one staff / one melody**, not a full-band transcription. Before reading the recording choose the destination: current part, Clarinet B-flat melody, Piano right hand, Accordion melody, Alto Sax or Tenor Sax.

For clarinet/piano practice use **One-line melody only (recommended)**. Full polyphonic detection remains available for special cases.

If **Detect simple chord draft** is enabled, Music 63 can keep chord symbols over the melody or add a basic Piano left-hand / Accordion accompaniment part. The melody and harmony remain separate so they are easy to edit.

The **Sources** page can also send an uploaded audio file or pasted YouTube/Spotify/direct-audio source straight into this workspace.
