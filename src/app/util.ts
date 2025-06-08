export function sanitizePathToClass(path: string): string {
  return path.replace(/[\[\].]/g, '-');
}
