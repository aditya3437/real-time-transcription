# Vocal — Speech to Text

A React dashboard for low-latency multilingual speech transcription. The browser streams microphone audio to a self-hosted [faster-whisper-server](https://github.com/fedirz/faster-whisper-server); Node.js proxies the live connection and stores transcripts in MySQL.

## Stack

- **Frontend:** React + Vite
- **API:** Node.js + Express, with a WebSocket proxy for live audio
- **Speech recognition:** faster-whisper-server, open source and self-hosted
- **Database:** MySQL 8.4

## Run locally

Prerequisites: Node.js 20+ and a microphone-enabled modern browser. Microphone access works on localhost or HTTPS. The default setup below uses Docker Desktop for MySQL and Whisper; a Windows setup without Docker is also described below.

1. Start MySQL and the CPU Whisper service (the first model use downloads the model):

   ```sh
   docker compose up -d
   ```

2. Install the dependencies and start the React and Node development servers:

   ```sh
   npm run install:all
   npm run dev
   ```

3. Open <http://localhost:5173>, allow microphone access, and start speaking. Finish the recording to save its transcript to history.

The API is available at <http://localhost:4000>; Whisper listens at <http://localhost:8000>. To use a GPU build, replace the Compose image `fedirz/faster-whisper-server:latest-cpu` with `fedirz/faster-whisper-server:latest-cuda` and configure Docker GPU access.

## Configuration

The defaults work with the included Compose file. For a standalone backend, copy `server/.env.example` to `server/.env` and set the MySQL credentials and `WHISPER_WS_URL`. `CLIENT_ORIGIN` controls the allowed browser origin.

For the deployed frontend and backend, set the frontend's Vercel environment variable `VITE_API_URL` to `https://real-time-transcription-ahgx.vercel.app/api` and the backend's `CLIENT_ORIGIN` to `https://real-time-transcription-kohl.vercel.app`. The frontend defaults to the deployed API in production; `VITE_API_URL` can override it. Live transcription uses the same backend URL for its WebSocket connection.

The browser converts microphone input to mono, signed 16-bit PCM at 16 kHz before streaming it. This is the live endpoint format supported by faster-whisper-server. Automatic language detection is used so multilingual speech, including Hindi-English code-switching, can be handled without choosing a single language in advance. The Compose setup raises the upstream inactivity window to 60 seconds so short pauses do not immediately end a live session. Recognition quality depends on the selected Whisper model and audio conditions.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Check API and database connectivity |
| `GET` | `/api/transcriptions` | List saved transcripts, newest first |
| `POST` | `/api/transcriptions` | Save `{ title, content, language, durationSeconds }` |
| `PUT` | `/api/transcriptions/:id` | Update `{ title, content }` |
| `DELETE` | `/api/transcriptions/:id` | Delete a transcript |
| `WS` | `/api/live` | Stream microphone PCM to local Whisper and receive transcript events |

The schema is in `server/schema.sql` and is applied automatically to the database selected by the MySQL container when it initializes its data volume. If you change the schema later, apply the SQL manually to an existing volume.

## Windows setup without Docker

This project has four local processes: MySQL, the Whisper WebSocket service, the Node API, and the React dev server. Install MySQL Server 8.4, `uv`, and Git first. `uv` installs the Python 3.12 runtime used by Speaches. The backend and frontend already have independent `npm run dev` scripts.

### 1. Set up MySQL

Open Command Prompt at the project root. Connect as a MySQL administrator and create the app database/user:

```cmd
mysql -u root -p
```

At the MySQL prompt, run:

```sql
CREATE DATABASE IF NOT EXISTS speech_to_text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'speechapp'@'localhost' IDENTIFIED BY 'speechpass';
GRANT ALL PRIVILEGES ON speech_to_text.* TO 'speechapp'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Then apply the table schema from the project root:

```cmd
mysql -u speechapp -p speech_to_text < server\schema.sql
```

The password above matches the example configuration. Keep your existing `server/.env`; make sure its `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`, and `WHISPER_WS_URL` values match your local services. The defaults are in `server/.env.example`.

### 2. Install and run the local Whisper service

The app expects an OpenAI-compatible live Whisper WebSocket at `ws://localhost:8000/v1/audio/transcriptions`. Speaches (formerly faster-whisper-server) documents running from Python source with `uv`:

Install `uv` from Command Prompt:

```cmd
winget install --id=astral-sh.uv -e
```

Open a new terminal after installation, then:

```cmd
cd /d %USERPROFILE%
git clone https://github.com/speaches-ai/speaches.git
cd speaches
uv python install 3.12
uv sync
uv run uvicorn --factory --host 127.0.0.1 --port 8000 speaches.main:create_app
```

Keep this terminal open. The first model load may download model files and take a while. The service uses the CPU by default unless configured otherwise.

### 3. Install the Node dependencies

From a separate terminal at the project root:

```cmd
npm install
npm --prefix server install
npm --prefix client install
```

### 4. Start the API and frontend

Open two terminals. In the first:

```cmd
cd /d C:\Users\Adity\OneDrive\Desktop\Test\Real-time\server
npm run dev
```

In the second:

```cmd
cd /d C:\Users\Adity\OneDrive\Desktop\Test\Real-time\client
npm run dev
```

Open <http://localhost:5173>. Check the API/database connection at <http://localhost:4000/api/health>. Start the MySQL service, Whisper service, API, and frontend in four running processes before recording.

## Backend layout

The Node backend follows an MVC-style structure:

- `src/models` contains the MySQL queries and database health check.
- `src/controllers` validates request data and formats API responses.
- `src/routes` maps API paths to controller methods.
- `src/config` holds environment configuration and the MySQL connection pool.
- `src/services` contains the live Whisper WebSocket proxy.
- `src/middleware` contains shared Express error handling.
- `src/app.js` configures Express; `src/server.js` creates the HTTP/WebSocket server; `src/index.js` is the entry point.

The React client is split into `src/components` for the sidebar, top bar, recorder, history table, and edit dialog; `src/hooks/useTranscriptionWorkspace.js` owns transcription state and API/audio actions; and `src/utils/transcription.js` holds formatting and live transcript helpers. `src/App.jsx` composes these pieces.
