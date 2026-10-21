export function errorHandler(error, req, res, _next) {
  console.error('API request failed:', {
    method: req.method,
    path: req.path,
    message: error instanceof Error ? error.message : String(error),
    code: error?.code
  });
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
}
