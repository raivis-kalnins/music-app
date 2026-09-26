# Hosting.com / cPanel deployment

This build is designed to run as a simple PHP app on shared cPanel/LiteSpeed hosting.

## 1. Select PHP

In cPanel, open **MultiPHP Manager** or **Select PHP Version** and set `music.63.lv` to PHP **8.2, 8.3, or 8.4**. The code is compatible with PHP 7.4+, but 8.2+ is recommended.

## 2. Use the correct document root

In cPanel > Domains, find `music.63.lv` and note its **Document Root**. Open that exact folder in File Manager.

After extraction, these files must be directly inside the document root:

- `index.php`
- `api.php`
- `config.php`
- `.htaccess`
- `assets/`
- `includes/`
- `storage/`

Do not leave them one level deeper inside a `music63-app/` folder unless the subdomain document root points to that folder.

## 3. Permissions

Recommended starting permissions:

- folders: `755`
- PHP/JS/CSS/JSON files: `644`
- `storage/`: `755` or `775` if PHP cannot write
- `storage/uploads/`: `755` or `775`

The PHP account must be able to create/replace files inside `storage/`.

## 4. Test the server before logging in

Open:

`https://music.63.lv/server-check.php`

Expected result: JSON with `"ok": true`.

Then open:

`https://music.63.lv/api.php?action=status`

Expected result includes `"ok":true` and `"authenticated":false` before login.

Finally open:

`https://music.63.lv/`

## 5. If you still see HTTP 500

Check cPanel > Metrics > Errors, or an `error_log` file in the domain document root. The exact PHP/Apache message will identify the remaining cause.

As a temporary test only, rename `.htaccess` to `.htaccess.off` and reload. If the app then opens, the server is rejecting an `.htaccess` directive. This compatibility build intentionally uses only very basic directives.

## 6. Security after setup

`storage/.htaccess` blocks direct web access to user/password hashes and private uploads on Apache/LiteSpeed. Do not remove it permanently.

`server-check.php` contains no credentials or filesystem paths, but you may delete it after the site is working.

## Updating to MIDI Studio v1.1

If Music 63 is already working on your domain, use the `upgrade-only` package. Extract it over the existing document root. This package does not include `storage/` or `config.php`, so your existing login, songs and uploads remain untouched.

After extraction use `Ctrl+F5` in Chrome/Edge. If the old MIDI screen is still visible, close all Music 63 tabs, reopen the site and refresh once more. Version 1.1 uses a new PWA cache name and `?v=3` assets to force the updated MIDI/audio code.
