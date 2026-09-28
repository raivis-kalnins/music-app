# Music 63 v2.0 - Audio to Notes and score engraving fixes

## YouTube Error 153 fixed

Music 63 previously sent `Referrer-Policy: no-referrer` on every page. YouTube's embedded player requires the embedding page to provide an HTTP Referer (or equivalent client identity), so that policy could trigger player Error 153.

v2.0 now uses `strict-origin-when-cross-origin` and applies the same referrer policy to the YouTube/Spotify preview iframes. YouTube embeds also receive the Music 63 site origin.

If a particular creator disables embedding, use **Open on YouTube** and the browser-authorised tab-audio workflow instead.

## YouTube / Spotify to editable notes

For provider sources the workflow is deliberately explicit:

1. Paste the YouTube or Spotify URL and press **Load / preview**.
2. Play the required passage.
3. Press **Start listening**.
4. In the browser share dialog choose the tab where the music is playing and enable **Share tab audio**.
5. Press **Stop + create notes**.
6. Review the generated melody draft and apply it to the score.

Uploaded/direct audio can be analysed directly without tab capture. Music 63 does not download or bypass protected provider streams.

## Cleaner melody workflow

Audio -> Notes defaults to one lead melody line. Choose Clarinet B-flat, Piano right hand, Accordion or Sax as the target. Optional chord detection remains separate so a full commercial mix is not dumped onto a single staff.

## Latvian interface

The Audio -> Notes workflow, score editor, source library, playback controls, import actions and common dynamic labels have expanded built-in Latvian translations. The existing AI translation cache can still fill less-common help text for supported languages.

## Improved Latvian sources

The built-in source list removes Notis.lv and prioritises stronger reference sources, including the Latvian National Library digital sheet-music collection, Latvian National Centre for Culture digital/methodical materials, Latvian Music Information Centre, Musica Baltica and the existing composer/artist resources.

## Classic time signature engraving

Time signatures are now drawn as stacked numerator/denominator figures immediately after the clef (for example a classic stacked 4 over 4) instead of the previous inline `4/4` text.

## Editor polish

- Wider, calmer tool and inspector panels.
- More paper-like score area and clearer transport hierarchy.
- Audio -> Notes opens as a dedicated dark workflow instead of a grey utility panel.
- Returning from the standalone Audio -> Notes page collapses the large audio panel in the editor unless a draft is still active.
- Existing one-by-one red-X note deletion, Undo/Redo, MIDI input, beaming and export functions remain available.
