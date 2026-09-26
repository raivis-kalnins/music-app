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
