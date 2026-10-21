export const env = {
  port: Number(process.env.PORT || 4000),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  mysql: {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'speechapp',
    password: process.env.MYSQL_PASSWORD || 'speechpass',
    database: process.env.MYSQL_DATABASE || 'speech_to_text'
  },
  whisperWsUrl: process.env.WHISPER_WS_URL || 'ws://localhost:8000/v1/audio/transcriptions'
};
