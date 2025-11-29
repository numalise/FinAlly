export function getPath(event: any): string {
  return event.rawPath || event.path || '';
}

export function getMethod(event: any): string {
  return event.requestContext?.http?.method || event.httpMethod || 'GET';
}

export function getPathParts(event: any): string[] {
  return getPath(event).split('/').filter(Boolean);
}

export function getBody(event: any): any {
  if (!event.body) return {};
  try {
    return JSON.parse(event.body);
  } catch {
    return {};
  }
}
