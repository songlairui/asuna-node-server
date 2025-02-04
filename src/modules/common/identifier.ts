export interface IdentifierHelper<T = object> {
  stringify: (payload: T) => string;
  parse: (identifier: string) => T;
}

/* class decorator */
export function StaticImplements<T>() {
  return (constructor: T) => {};
}

export interface IdentifierStatic {
  resolve(identifier: string): { type: string; id: number | string };

  identify(identifier: string): boolean;
}

export interface Identifier<T = any> {
  payload(): Partial<T>;

  identifier(): string;

  identifierObject(): { type: string; id: number | string };
}
