# Third-party audio transcription component

Music 63 v1.7 optionally loads **@spotify/basic-pitch 1.0.1** and its TensorFlow.js model when the Audio -> Notes feature is used.

- Project: Spotify Basic Pitch / Basic Pitch TypeScript
- Purpose in Music 63: local browser pitch/note-event estimation from audio
- Distribution used by the app: jsDelivr npm CDN
- Upstream license: Apache License 2.0 (see the upstream project for full license text and notices)

This component is not required for login, song storage, manual notation, MIDI input, Studio Warm playback, handwritten image recognition, or existing exports. If the model/CDN is unavailable, only Audio -> Notes is unavailable.
