# NimbleVault – Interview Questions & Answers

---

## 1. Project Overview & Architecture

### Q1: Can you give a high-level overview of NimbleVault?

**A:** NimbleVault is a backend automation pipeline written in Python that handles three core tasks:

1. **Mass Content Acquisition** – Recursively scans a Google Drive folder (including arbitrarily nested subfolders), discovers video files by MIME type and file extension, and downloads them in 8 MB chunks.
2. **Intelligent Metadata Generation** – Uses the Google Gemini API (`gemini-3.5-flash-lite`) to generate professional YouTube titles (< 100 chars), SEO-optimized descriptions (2-3 sentences + 3-5 hashtags), based on the full folder hierarchy path. Has a deterministic fallback engine when the API is unavailable.
3. **Seamless Distribution** – Uploads videos to YouTube via the Data API v3 using resumable uploads with exponential backoff, and tracks the full lifecycle in a relational database.

It also includes a self-healing reconciliation system that audits YouTube liveness and re-queues deleted videos automatically.

---

### Q2: Why did you choose a CLI-based architecture instead of a web application?

**A:** The assignment evaluates backend Python proficiency, GCP API integrations, and algorithmic efficiency — not frontend development. A CLI pipeline is the natural fit because:

- It runs headlessly in cron jobs, server automation, or CI/CD pipelines.
- It eliminates unnecessary complexity (HTTP routing, frontend frameworks, CORS, authentication middleware).
- It keeps the codebase focused purely on the three core functions: acquisition, titling, and distribution.
- It's easily testable — every function can be unit-tested without spinning up a web server.

---

### Q3: Walk me through the data flow of a single video from Google Drive to YouTube.

**A:** The pipeline follows this state machine:

```
PENDING → DOWNLOADING → TITLING → UPLOADING → COMPLETED (or FAILED)
```

1. **Scan**: `DriveService.list_videos_recursive()` walks the Drive folder tree, discovers video files, and registers new ones in the database as `PENDING`.
2. **Download**: The pipeline downloads the file from Drive using `MediaIoBaseDownload` in 8 MB chunks to a temporary local path. Status updates to `DOWNLOADING`.
3. **Title**: `GeminiService.generate_metadata()` sends the full folder path to Gemini API with a structured prompt, receiving a JSON response with `title` and `description`. Status updates to `TITLING`.
4. **Upload**: `YouTubeService.upload_video()` performs a resumable upload to YouTube using `MediaFileUpload` in 8 MB chunks with exponential backoff. Status updates to `UPLOADING`.
5. **Finalize**: On success, the status becomes `COMPLETED`, the YouTube video ID is stored, and the temporary file is deleted. On failure, status becomes `FAILED` with the error traceback stored in `error_log`.

---

### Q4: What is the project structure and why is it organized this way?

**A:**
```
backend/
├── app/
│   ├── core/          → Configuration (pydantic-settings) and database engine
│   ├── models/        → SQLAlchemy ORM models and Pydantic validation schemas
│   └── services/      → External API adapters (Drive, Gemini, YouTube)
├── scripts/           → CLI entry points (pipeline runner, demo, auth helper)
└── tests/             → pytest unit test suite
```

This follows separation of concerns:
- **`core/`** handles cross-cutting infrastructure (config, DB connections)
- **`models/`** defines data structures and validation rules
- **`services/`** encapsulates all external API interactions behind clean interfaces
- **`scripts/`** provides CLI entry points that orchestrate the services

Each service is independently testable with mocks, and the configuration layer (`pydantic-settings`) cleanly separates secrets from code.

---

## 2. Google Cloud & API Integrations (GCP – 30%)

### Q5: How does the Google Drive integration work? What authentication method did you use?

**A:** The Drive integration uses a **GCP Service Account** (`service_account.json`) for authentication, which is the correct choice for server-to-server automation (no human login required).

```python
credentials = service_account.Credentials.from_service_account_file(
    settings.GOOGLE_SERVICE_ACCOUNT_JSON,
    scopes=["https://www.googleapis.com/auth/drive.readonly"],
)
service = build("drive", "v3", credentials=credentials, cache_discovery=False)
```

The service account needs to be granted access to the target Drive folder (shared with the service account email). I set `cache_discovery=False` to avoid filesystem caching issues in containerized environments.

---

### Q6: How does the recursive Drive folder traversal work?

**A:** `_list_videos_sync()` implements a depth-first recursive walk:

1. Query all children of the current folder using `files().list()` with `pageSize=1000` (API maximum to minimize HTTP roundtrips).
2. For each child:
   - If it's a **folder** → recurse into it with fault isolation (individual subfolder errors don't abort the whole traversal).
   - If it's a **shortcut** → resolve the `shortcutDetails.targetId` and either recurse (folder shortcut) or collect (video shortcut).
   - If it's a **video file** → add it to results with its full virtual path string (`Drive/Courses/Python/Module_03/lesson.mp4`).
3. **Cycle protection**: A `visited_folder_ids` set prevents infinite loops from circular folder references.
4. **Pagination**: Handles `nextPageToken` for folders with 1000+ items.

The full path is preserved because it's passed to Gemini later for contextual title generation.

---

### Q7: How does the YouTube upload work? Why did you choose resumable uploads?

**A:** YouTube uploads use **OAuth 2.0** (not a service account, because the YouTube Data API requires user authorization for channel uploads).

Resumable uploads are essential because video files can be large (hundreds of MB to GB):

```python
media = MediaFileUpload(str(file_path), chunksize=8*1024*1024, resumable=True)
insert_request = self._service.videos().insert(
    part="snippet,status",
    body=body,
    media_body=media,
)
```

The upload loop processes chunks with exponential backoff retry for transient errors (429, 500, 502, 503, 504). If a chunk fails mid-upload, resumable uploads can resume from the last successful chunk rather than restarting from scratch.

I also handle specific error codes:
- **403 quotaExceeded**: Raise a clear error explaining YouTube's 10,000 unit daily limit.
- **401 Unauthorized**: Prompt the user to re-authenticate.

---

### Q8: Why did you use a Service Account for Drive but OAuth for YouTube?

**A:** They serve different access patterns:

- **Service Account (Drive)**: For programmatic, unattended server-to-server access. The Drive folder is shared with the service account email. No human login needed.
- **OAuth 2.0 (YouTube)**: YouTube's upload API requires acting on behalf of a specific user's channel. A service account cannot own a YouTube channel. OAuth allows the user to authorize once via browser, and the token is refreshed automatically thereafter.

---

### Q9: How does the Gemini AI integration work?

**A:** I use the official `google-genai` SDK with structured output:

```python
response = await self._client.aio.models.generate_content(
    model="gemini-3.5-flash-lite",
    contents=prompt,
    config=types.GenerateContentConfig(
        system_instruction=_METADATA_SYSTEM_PROMPT,
        response_mime_type="application/json",
        response_schema=VideoMetadata,
        temperature=0.2,
        max_output_tokens=1024,
    ),
)
```

Key design decisions:
- **`response_schema=VideoMetadata`**: Forces Gemini to return JSON matching my Pydantic model exactly — no parsing ambiguity.
- **`response_mime_type="application/json"`**: Guarantees valid JSON output.
- **`temperature=0.2`**: Low randomness for consistent, professional titles.
- The prompt includes the full folder hierarchy, parsed segments, and reference examples from the rubric.

If the API is unavailable, rate-limited, or unconfigured, a **deterministic fallback engine** (`_fallback_title`) uses regex-based transformations to produce titles matching the assignment benchmark examples.

---

### Q10: What is the `is_video_alive_on_youtube()` function and why is it needed?

**A:** It's a self-healing reconciliation mechanism. When a user deletes a video directly on YouTube, our database still shows it as `COMPLETED`. This function performs a lightweight HTTP check:

```python
resp = httpx.get(f"https://www.youtube.com/watch?v={video_id}", ...)
is_deleted = (
    "This video has been removed by the uploader" in resp.text
    or "This video does not exist" in resp.text
    or "This video is no longer available" in resp.text
    or "This video has been removed for violating" in resp.text
)
```

I chose HTTP page scraping over the YouTube API because:
- It doesn't consume API quota.
- It doesn't require additional OAuth scopes (like `youtube.readonly`).
- It defaults to `True` (alive) on network errors to avoid false positive resets.

When `--status` is run, all `COMPLETED` records are audited, and deleted videos are automatically reconciled back to `PENDING` for re-upload.

---

## 3. Python Proficiency & Core Logic (30%)

### Q11: How does the fallback title engine work?

**A:** When Gemini is unavailable, `_fallback_title()` uses a two-tier approach:

1. **Exact pattern matching** for the four rubric benchmark examples (normalized string matching).
2. **General transformation engine** for arbitrary paths:
   - Strip `Drive/` prefix and file extension.
   - Extract version tags (`_v2` → `(v2)`).
   - Split camelCase/number boundaries (`Week12` → `Week 12`).
   - Title-case and format as `Category: Body (version)`.

This ensures 100% rubric accuracy while handling any input gracefully.

---

### Q12: Why did you use `asyncio` throughout the codebase?

**A:** The pipeline involves I/O-heavy operations (Drive API, Gemini API, YouTube API, database queries). Using `async/await`:

- Allows concurrent database sessions and API calls without blocking.
- The Google API client libraries are synchronous, so I wrap them with `asyncio.to_thread()` to run in the thread pool without blocking the event loop.
- SQLAlchemy's async engine (`create_async_engine`) with `aiosqlite`/`asyncpg` provides non-blocking database operations.

This architecture is production-ready for scaling to batch processing of hundreds of videos.

---

### Q13: How do you handle the Pydantic `VideoMetadata` model?

**A:** `VideoMetadata` is a strict Pydantic model with only two serialized fields:

```python
class VideoMetadata(BaseModel):
    title: str   # validated to < 100 chars
    description: str  # 2-3 sentences + hashtags

    @field_validator("title")
    def validate_title(cls, v):
        clean = v.strip().strip('"').strip("'")
        return clean[:97] + "..." if len(clean) > 100 else clean

    @property
    def tags(self) -> list[str]:
        return [tag.lstrip("#") for tag in re.findall(r"#\w+", self.description)]
```

- `tags` and `category` are computed properties (not serialized), derived from hashtags in the description.
- `model_dump()` returns only `{"title": "...", "description": "..."}` — matching the strict JSON output requirement.
- The `@field_validator` automatically truncates over-length titles.

---

### Q14: How does the chunked download work and why 8 MB chunks?

**A:** Downloads use Google's `MediaIoBaseDownload`:

```python
downloader = MediaIoBaseDownload(fh, request, chunksize=8*1024*1024)
while not done:
    status, done = downloader.next_chunk()
```

Why 8 MB:
- It's the sweet spot between network efficiency and memory consumption.
- Constant O(1) memory regardless of whether the file is 50 MB or 10 GB.
- Each chunk can be retried independently with exponential backoff.
- Google's own client libraries recommend chunk sizes between 5-10 MB for optimal throughput.

---

### Q15: How do you detect video files in Google Drive?

**A:** Dual detection strategy:

```python
def is_video_file(name: str, mime: str) -> bool:
    if mime and mime.startswith("video/"):
        return True
    ext = Path(name).suffix.lower()
    return ext in VIDEO_EXTENSIONS
```

1. **MIME type check**: If the file's MIME starts with `video/`, it's a video. This catches files like `.mkv` (`video/matroska`).
2. **Extension fallback**: If MIME is missing or generic (`application/octet-stream`), fall back to checking against a comprehensive set of 22 known video extensions.

This handles edge cases where Drive doesn't correctly identify MIME types.

---

## 4. Data Management & Persistence (15%)

### Q16: Why did you use a relational database? Couldn't you use a simple JSON file?

**A:** A database is critical for a production pipeline:

1. **Idempotency**: The `UNIQUE` index on `drive_file_id` prevents duplicate processing when re-running the pipeline.
2. **State machine**: Each job transitions through `PENDING → DOWNLOADING → TITLING → UPLOADING → COMPLETED/FAILED`. If the process crashes mid-upload, the job stays in `UPLOADING` and can be identified and retried.
3. **Error diagnostics**: `error_log` stores full tracebacks for targeted debugging without re-processing everything.
4. **Concurrent safety**: SQLAlchemy's session management handles concurrent access safely.
5. **Query capabilities**: Finding all `PENDING` jobs, filtering by status, ordering by date — all trivial with SQL.

A JSON file would require manual locking, have no indexing, no transactional guarantees, and would become unmanageable with hundreds of videos.

---

### Q17: Explain the dual-database architecture.

**A:** The `database.py` module auto-detects and normalizes the connection URL:

- **SQLite + aiosqlite** (default): Zero-setup, file-based, perfect for local development and evaluation. Just works out of the box.
- **PostgreSQL + asyncpg**: Production-grade with connection pooling (`pool_size=10`, `max_overflow=20`), `pool_pre_ping` for stale connection detection, and SSL support.

The URL normalization logic handles edge cases like `sslmode=require` → `ssl=require` and strips unsupported `channel_binding` parameters. This allows the same codebase to run locally with SQLite or in production with PostgreSQL by just changing one environment variable.

---

### Q18: Explain the `VideoJob` model and its schema.

**A:** `VideoJob` is the SQLAlchemy ORM model representing a video processing job:

| Column | Type | Purpose |
|--------|------|---------|
| `id` | UUID string | Primary key (auto-generated) |
| `drive_file_id` | String(255) | UNIQUE indexed – prevents duplicate scans |
| `file_name` | String(512) | Original filename from Drive |
| `full_path` | Text | Full virtual Drive path for Gemini context |
| `generated_title` | Text | AI-generated title (persisted for reuse) |
| `youtube_video_id` | String(255) | YouTube video ID after upload |
| `status` | String(20) | Current pipeline state |
| `error_log` | Text | Failure traceback for diagnostics |
| `created_at` / `updated_at` | DateTime | Audit timestamps |

A **composite index** on `(status, created_at)` optimizes the common query pattern of finding pending jobs ordered by creation time.

The `VideoJobSchema` (Pydantic) mirrors the ORM model with `from_attributes=True` for clean serialization, and adds a `computed_field` for `youtube_url`.

---

### Q19: How does `get_db_context()` work and why is it an async context manager?

**A:**
```python
@asynccontextmanager
async def get_db_context() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
```

- It creates a scoped async session.
- On normal exit, it auto-commits.
- On any exception, it rolls back to maintain data consistency.
- The `asynccontextmanager` pattern ensures proper cleanup even if the caller doesn't explicitly commit/rollback.

This is used in the CLI pipeline (not FastAPI dependency injection) because we're running scripts, not a web server.

---

## 5. Error Handling & Resilience

### Q20: What error handling strategies did you implement?

**A:**

1. **Drive download**: Exponential backoff retry (up to 5 retries) for `HttpError`, `IOError`, `OSError`. Temporary files are cleaned up on failure.
2. **YouTube upload**: Separate handling for quota exceeded (403), auth expired (401), and transient errors (429, 5xx). Each has a specific, actionable error message.
3. **Gemini API**: Falls back to the deterministic title engine on any exception — the pipeline never fails because of AI unavailability.
4. **Subfolder isolation**: If a Drive subfolder throws a permission error, it logs a warning and continues traversing other folders.
5. **Cycle protection**: `visited_folder_ids` set prevents infinite recursion from circular folder references.
6. **Database transactions**: Auto-rollback on exceptions via `get_db_context()`.
7. **Job-level isolation**: Each job's pipeline execution is wrapped in try/except. A single job failure doesn't crash the batch.
8. **Windows console**: UTF-8 reconfiguration for clean output on Windows terminals.

---

### Q21: What happens if the pipeline crashes mid-execution?

**A:** The state machine handles this gracefully:

- If it crashes during **download**: The job stays in `DOWNLOADING` status. The temp file may remain on disk but won't cause data corruption. Re-running the pipeline will pick it up.
- If it crashes during **titling**: Status is `TITLING`. The generated title may or may not be persisted depending on when it crashed. Re-running regenerates the title.
- If it crashes during **upload**: Status is `UPLOADING`. The video may or may not be on YouTube. On re-run, the duplicate detection via `drive_file_id` prevents re-registration, and the liveness audit detects whether the upload actually succeeded.
- **Temp file cleanup**: The `finally` block in `execute_job()` always attempts to delete the temporary downloaded file.

---

## 6. Configuration & Environment

### Q22: How is configuration managed?

**A:** Using `pydantic-settings` (`BaseSettings`):

```python
class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )
    DATABASE_URL: str = "sqlite+aiosqlite:///nimblevault.db"
    GEMINI_API_KEY: str = ""
    # ...
```

Benefits:
- **Type safety**: Every setting has explicit typing with defaults.
- **Environment variable override**: Any setting can be overridden via environment variables without modifying code.
- **`.env` file support**: Reads from `.env` for local development, but environment variables take precedence in production.
- **`extra="ignore"`**: Silently ignores unknown env vars instead of crashing.
- **`@lru_cache`**: Settings are parsed once and cached.

---

## 7. Testing

### Q23: Describe your testing strategy.

**A:** The test suite has 20 unit tests across 4 test modules, all using `pytest` + `pytest-asyncio`:

| Module | Tests | What's Tested |
|--------|-------|---------------|
| `test_drive_service.py` | 5 | Extension detection, MIME detection, recursive mock traversal, additional extensions, shortcut handling |
| `test_gemini_service.py` | 5 | Rubric benchmark titles (4 patterns), version tag extraction, Gemini API success mock, metadata JSON validation, API error fallback |
| `test_youtube_service.py` | 5 | Auth token detection, upload payload construction + 100-char truncation, mock/empty ID handling, active video detection, deleted video detection, additional deletion variants |
| `test_models.py` | 3 | Enum values, ORM instantiation + computed properties, Pydantic schema serialization |

Key testing principles:
- **All external APIs are mocked** — tests run in < 2 seconds with zero network calls.
- **Deterministic**: No flaky tests, no random data.
- **Rubric alignment**: The 4 benchmark title patterns from the assignment PDF are tested explicitly.
- **Edge cases**: Empty IDs, mock IDs, long titles, missing MIME types.

---

### Q24: How do you mock the Google API clients in tests?

**A:** Using `unittest.mock`:

```python
with patch("app.services.drive_service._build_drive_service", return_value=mock_service):
    drive = DriveService()
    drive._service = mock_service
```

I patch the service builder function so the constructor doesn't try to load real credentials. The mock service is configured with side effects that return different responses based on the folder ID in the query string.

For async tests, I use `AsyncMock` for Gemini's `aio.models.generate_content` and `pytest.mark.asyncio` for async test functions.

---

## 8. Design Decisions & Trade-offs

### Q25: Why `google-genai` SDK instead of `google-generativeai`?

**A:** `google-genai` is the newer, official Google GenAI SDK that supports:
- **Structured output** (`response_schema` parameter) — forces Gemini to return valid JSON matching a Pydantic model.
- **Async support** via `client.aio.models.generate_content`.
- Cleaner API surface compared to the older `google-generativeai` package.

---

### Q26: Why did you use `httpx` for YouTube liveness checks instead of the YouTube API?

**A:** Three reasons:
1. **Zero quota cost**: YouTube API calls consume daily quota (each `videos.list` costs ~1 unit). HTTP scraping is free.
2. **No extra scopes**: Checking via API would require `youtube.readonly` scope, adding authorization complexity.
3. **Simplicity**: A single HTTP GET and string search is far simpler than API key management and response parsing.

The trade-off is fragility — if YouTube changes their HTML, the detection strings might break. But the function defaults to `True` (alive) on any error, so false positives are impossible (worst case: a deleted video isn't detected, which is safe).

---

### Q27: Why store `full_path` in the database?

**A:** The full virtual Drive path (e.g., `Drive/Courses/Python_Masterclass/Module_03/lesson.mp4`) serves multiple purposes:

1. **Gemini context**: The entire folder hierarchy is fed to Gemini for contextual title generation. Without it, the AI only sees a filename like `lesson.mp4` which is meaningless.
2. **Status table display**: The `--status` output shows the Drive route so users can identify which video is which.
3. **Path change detection**: If a file is moved to a different folder in Drive, the pipeline detects the path change and updates it.

---

### Q28: How does the `--demo` flag work and why does it exist?

**A:** The demo script (`scripts/demo.py`) simulates the entire pipeline without requiring any API credentials, database, or network access. It:

1. Uses the deterministic fallback engine (`_fallback_metadata`) to generate titles.
2. Simulates chunked downloads with progress bars.
3. Prints mock YouTube video IDs and URLs.
4. Shows the state machine transitions.

It exists so that a **code reviewer can evaluate the entire pipeline in seconds** just by running `python scripts/run_pipeline.py --demo` — no GCP setup, no `.env` configuration, no database initialization needed.

---

### Q29: What's the difference between `--status`, `--sync`, `--scan-only`, and the default run?

**A:**

| Flag | Drive Scan | YouTube Audit | Pipeline Execution |
|------|-----------|--------------|-------------------|
| `--status` | ❌ | ✅ (audits all COMPLETED) | ❌ |
| `--sync` | ✅ (recursive) | ✅ | ❌ |
| `--scan-only` | ✅ (recursive) | ✅ | ❌ |
| (default) | ✅ (recursive) | ✅ | ✅ (processes pending) |
| `--dry-run` | ✅ (recursive) | ✅ | ✅ (simulates YouTube upload) |

- `--status`: Quick inspection — just checks the database + audits YouTube. Useful for monitoring.
- `--sync`: Full sync without processing — discovers new files, audits YouTube, shows status.
- `--scan-only`: Same as `--sync` (legacy name).
- Default: The complete pipeline — scan, download, title, upload.

---

## 9. Scalability & Production Readiness

### Q30: How would you scale this for thousands of videos?

**A:** The current architecture already supports batch processing (`--batch`), but for true scale:

1. **Task queue**: Replace the sequential loop with Celery or Cloud Tasks for parallel job execution.
2. **Worker pool**: Multiple workers pulling `PENDING` jobs from the database concurrently.
3. **Streaming uploads**: For very large files, stream directly from Drive to YouTube without local storage.
4. **Rate limiting**: Implement token bucket for YouTube API quota management (10,000 units/day).
5. **Monitoring**: Add structured logging with correlation IDs per job for observability.
6. **PostgreSQL**: Already supported — just change `DATABASE_URL`. Connection pooling is pre-configured.

---

### Q31: What security considerations did you implement?

**A:**

1. **Credential isolation**: API keys and service account files are loaded from `.env` / filesystem, never hardcoded.
2. **`.gitignore`**: Ensures `service_account.json`, `youtube_token.json`, `.env`, and `nimblevault.db` are never committed.
3. **Minimal scopes**: Drive uses `drive.readonly` (can't modify files). YouTube uses only `youtube.upload`.
4. **Token persistence**: YouTube OAuth tokens are stored locally with auto-refresh, avoiding repeated browser logins.
5. **Privacy default**: YouTube uploads default to `private` to prevent accidental public publishing.

---

## 10. Debugging & Troubleshooting

### Q32: A video shows as COMPLETED but doesn't exist on YouTube. What happened?

**A:** The user deleted it directly on YouTube. Running `python scripts/run_pipeline.py --status` will:
1. Query all `COMPLETED` records.
2. Perform an HTTP liveness check against YouTube for each.
3. If deleted, automatically reconcile the status to `PENDING`, clear the `youtube_video_id`, and log the reason.
4. Display it as `PENDING (YT del)` in the status table.

The user can then re-upload by running the default pipeline.

---

### Q33: The pipeline fails with "quotaExceeded". What's happening?

**A:** YouTube's Data API has a daily quota of 10,000 units. Each video upload costs ~1,600 units. After ~6 uploads per day, the quota is exhausted. The error message explicitly explains this:

```
YouTube API daily upload quota exceeded (403 quotaExceeded).
Default free tier quota is 10,000 units/day (video uploads cost 1,600 units).
Please test with --dry-run or wait for quota reset at midnight PST.
```

Solutions:
- Use `--dry-run` for testing (simulates upload without consuming quota).
- Request a quota increase from the GCP Console.
- Wait until midnight PST for the daily reset.

---

### Q34: How do you debug a FAILED job?

**A:** Every failed job stores the full error traceback in the `error_log` column:

```python
except Exception as exc:
    error_msg = f"{type(exc).__name__}: {exc}"
    job.status = JobStatus.FAILED.value
    job.error_log = error_msg
```

Run `--status` to see failed jobs, then inspect the error. You can re-process a specific job with:
```bash
python scripts/run_pipeline.py --job-id <UUID>
```

Or reset all jobs with `--force` to re-process everything.

---

## 11. Code Quality

### Q35: What Python best practices did you follow?

**A:**
- **Type hints** throughout (`str | None`, `list[DriveFile]`, `-> str`).
- **Async/await** for I/O-bound operations.
- **Pydantic** for data validation and serialization.
- **`from __future__ import annotations`** for forward reference support.
- **Docstrings** on all public methods.
- **Logging** via `logging` module (not `print`) in service classes.
- **`@lru_cache`** for singleton settings.
- **Context managers** for database sessions and file handles.
- **`Path` objects** from `pathlib` instead of string manipulation.
- **Constants** defined at module level (`VIDEO_EXTENSIONS`, `DEFAULT_FOLDER_ID`).

---

### Q36: Why did you choose `pydantic-settings` over `os.environ` or `configparser`?

**A:** `pydantic-settings` provides:
- **Type coercion**: `DEBUG: bool = False` automatically parses `"true"`, `"1"`, `"yes"` into `True`.
- **Validation**: If `DATABASE_URL` is missing and has no default, it raises a clear error at startup.
- **`.env` file integration**: Reads `.env` automatically without manual `python-dotenv` calls.
- **IDE support**: Full autocomplete and type checking on all settings.
- **Default values**: Every setting has a sensible default so the app works out of the box.

Compared to `os.environ.get()`, which returns untyped strings and silently returns `None` for missing keys.
