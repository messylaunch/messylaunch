// Bunny.net Stream integration.
//
// Set these in .env (see .env.example):
//   BUNNY_STREAM_LIBRARY_ID  — your Stream video library id
//   BUNNY_STREAM_API_KEY     — the library's API key (Stream > API)
//
// Flow: createVideo() registers a video and returns its GUID, then the browser
// uploads the file with a PUT to the returned uploadUrl. Playback is a simple
// iframe embed — no key needed, so embedUrl works on any page.

const BUNNY_BASE = "https://video.bunnycdn.com/library";

export function bunnyConfigured() {
  return Boolean(process.env.BUNNY_STREAM_LIBRARY_ID && process.env.BUNNY_STREAM_API_KEY);
}

export function embedUrl(videoId: string) {
  const lib = process.env.BUNNY_STREAM_LIBRARY_ID ?? "LIBRARY_ID";
  return `https://iframe.mediadelivery.net/embed/${lib}/${videoId}?autoplay=false`;
}

export async function createVideo(title: string): Promise<{ videoId: string; uploadUrl: string }> {
  const lib = process.env.BUNNY_STREAM_LIBRARY_ID!;
  const res = await fetch(`${BUNNY_BASE}/${lib}/videos`, {
    method: "POST",
    headers: { AccessKey: process.env.BUNNY_STREAM_API_KEY!, "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error(`Bunny createVideo failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { guid: string };
  return {
    videoId: data.guid,
    uploadUrl: `${BUNNY_BASE}/${lib}/videos/${data.guid}`,
  };
}
