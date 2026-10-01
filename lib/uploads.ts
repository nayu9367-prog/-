// Files uploaded through /api/upload live on Vercel Blob. Anything that
// stores an attachment URL should only accept links to that store, so a
// crafted request can't plant an arbitrary link on the site.
const BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";

export function isUploadedFileUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(BLOB_HOST_SUFFIX);
  } catch {
    return false;
  }
}
