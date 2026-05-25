declare module '@vercel/node' {
  import type { IncomingMessage, ServerResponse } from 'http';

  export interface VercelRequest extends IncomingMessage {
    body: Record<string, unknown>;
    query: Record<string, string | string[]>;
    cookies: Record<string, string>;
  }

  export interface VercelResponse extends ServerResponse {
    status(code: number): VercelResponse;
    json(body: unknown): void;
    send(body: unknown): void;
    redirect(url: string): void;
    redirect(status: number, url: string): void;
  }
}
