# Deployment checklist

- PHP 7.4+ (PHP 8.2+ recommended)
- HTTPS
- PHP sessions enabled
- `storage/` writable, but not web-readable
- Apache `mod_rewrite` / `.htaccess` allowed, or equivalent Nginx rule denying `/storage`
- Maximum upload size in PHP should be at least 25 MB (`upload_max_filesize`, `post_max_size`)
- Optional `OPENAI_API_KEY` and `OPENAI_MODEL` environment variables

## Nginx storage protection

If you deploy behind Nginx instead of Apache, add a rule equivalent to:

```
location ^~ /storage/ { deny all; return 403; }
```

### Optional Media Studio server support (v1.9)

Media Studio trim/conversion of user-uploaded audio/video requires the `ffmpeg` command to be available to PHP. Music 63 automatically detects it. If shared hosting does not expose FFmpeg, score/MIDI/MusicXML exports and browser-generated Studio Warm WAV backing exports still work. Large MP4 uploads are also limited by both Music 63's configured upload limit and the hosting account's `upload_max_filesize` / `post_max_size` settings.

## v2.0 upgrade note

After copying v2.0 over an existing installation, use **Settings -> Clear app cache -> Clear cache & reload** once. The service-worker cache key and all main asset versions were bumped for this release. This is especially important if the browser previously showed the grey Audio -> Notes panel or YouTube Error 153.
