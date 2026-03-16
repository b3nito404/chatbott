const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export function makeTitle(msg: string): string {
  return msg.length > 40 ? msg.slice(0, 38) + '…' : msg;
}

interface Handlers {
  onChunk: (text: string) => void;
  onDone:  () => void;
  onError: (e: string) => void;
}

export async function streamMessage(
  message:  string,
  history:  { role: 'user' | 'assistant'; content: string }[],
  handlers: Handlers,
  _cid?:    string,
  signal?:  AbortSignal,
) {
  const { onChunk, onDone, onError } = handlers;

  try {
    const res = await fetch(`${API}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body:   JSON.stringify({ message, history }),
      signal,
    });

    if (!res.ok || !res.body) {
      onError(`Server error ${res.status}`);
      return;
    }

    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let   buf     = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const json = JSON.parse(line.slice(6));
          if (json.done) { onDone(); return; }
          if (json.text) onChunk(json.text);
        } catch {}
      }
    }
    onDone();
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      onDone();
    } else {
      onError(String(err));
    }
  }
}