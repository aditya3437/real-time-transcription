export function errorHandler(error, _req, res, _next) {
  console.error(error);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
}
