# Music 63 v1.6 - OpenAI API connection

Music 63 can use the OpenAI Responses API for two server-side features:

- Handwritten/photo score reading into an editable draft.
- AI Compose for original music ideas.

## Recommended setup

1. Sign in to Music 63 as an administrator.
2. Open **Settings -> AI connection**.
3. Paste an OpenAI API key into **OpenAI API key**.
4. Keep **GPT-5.6 Terra** for the normal balanced setting, or choose Luna/Sol.
5. Press **Save & test**.
6. When the test succeeds, return to Music Editor and press **Read this page with AI**.

The key is sent to the Music 63 PHP server only when you save it. It is stored in `storage/private/openai.json`, protected by the storage access rules, file permissions, administrator authentication and CSRF checks. The key is never returned to the browser after saving and is not included in Music 63 JSON backups.

If the host already defines `OPENAI_API_KEY`, that environment key takes priority. The Settings screen will report that the hosting environment key is active.

## Security

Do not put an API key into JavaScript, HTML, source-control repositories, screenshots, or a public URL. Do not send the key in chat. Enter it only into the private Music 63 administrator Settings page or configure it directly in the hosting environment.

## Troubleshooting

- **Not connected**: save the key and press **Save & test**.
- **401 / invalid key**: create or copy a valid API key from the OpenAI API dashboard and save it again.
- **Billing/quota error**: check the API project billing/usage limits.
- **Connection error**: confirm outbound HTTPS requests to `api.openai.com` are allowed by the host. Music 63 uses PHP cURL when available and falls back to PHP HTTPS streams.
- **AI reader returns uncertain notes**: the result is intentionally a draft. Review pitch, rhythm, rests, accidentals and chords before applying it to the score.
