export function uuid(): string {
  // POC-level unique id
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}