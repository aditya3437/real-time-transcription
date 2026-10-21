export const formatDuration = seconds =>
  `${String(Math.floor((seconds || 0) / 60)).padStart(2, '0')}:${String((seconds || 0) % 60).padStart(2, '0')}`;

export const formatDate = value =>
  new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value));

export function parseTranscript(message) {
  try {
    const data = JSON.parse(message);
    if (data.type === 'error') throw new Error(data.message || 'Speech service error');
    if (data.type === 'ready') return null;
    if (typeof data.text === 'string') return data.text;
    if (typeof data.transcript === 'string') return data.transcript;
    if (typeof data.segment?.text === 'string') return data.segment.text;
    if (Array.isArray(data.segments)) return data.segments.map(segment => segment.text || '').join('');
    return null;
  } catch (error) {
    if (error instanceof SyntaxError) return message;
    throw error;
  }
}

export function mergeTranscript(previous, next) {
  const before = previous.trim();
  const after = next.trim();
  if (!before || after.startsWith(before)) return after;
  if (before.startsWith(after)) return before;

  const limit = Math.min(before.length, after.length);
  for (let size = limit; size > 0; size--) {
    if (before.slice(-size).toLowerCase() === after.slice(0, size).toLowerCase()) {
      return `${before}${after.slice(size)}`;
    }
  }

  const separator = /[\s([{—–-]$/.test(before) || /^[\s.,!?;:)}\]]/.test(after) ? '' : ' ';
  return `${before}${separator}${after}`;
}
