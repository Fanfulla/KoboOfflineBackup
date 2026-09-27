/** SHA-256 of a buffer/blob as "sha256:<hex>" ("unavailable" if WebCrypto fails). */
export async function calculateChecksum(data: ArrayBuffer | Uint8Array<ArrayBuffer> | Blob): Promise<string> {
  try {
    const buffer = data instanceof Blob ? await data.arrayBuffer() : data;
    const hash = await crypto.subtle.digest('SHA-256', buffer);
    return `sha256:${Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('')}`;
  } catch {
    return 'unavailable';
  }
}
