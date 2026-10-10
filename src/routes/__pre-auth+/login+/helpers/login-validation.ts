export function validateLoginForm(values: { login?: string; email?: string; password?: string }): string | null {
  const identifier = values.login || values.email;
  if (!identifier || !identifier.trim()) {
    return 'Username atau Email wajib diisi.';
  }
  if (!values.password) {
    return 'Password wajib diisi.';
  }
  return null;
}
