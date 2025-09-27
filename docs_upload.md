# 📁 Upload API

The upload endpoint allows file content to be sent and stored or processed by the backend.

---

## Endpoint

### `POST /api/data/upload`

> Upload raw file content to the server

**Headers Required:**

- `Content-Type: application/json`
- `X-API-Key: change-me`

**Payload Example:**

```json
{
  "filename": "report.json",
  "content": "{\"name\":\"Demo\",\"value\":42}"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:8000/api/data/upload \
  -H "Content-Type: application/json" \
  -H "X-API-Key: change-me" \
  -d '{"filename":"demo.txt","content":"Hello world"}'
```

---

## Response

```json
{
  "status": "success",
  "filename": "demo.txt"
}
```

---

## Notes

- The content is not saved to disk or DB by default.
- You can hook this into AWS S3, Supabase, or a local database handler in production.

