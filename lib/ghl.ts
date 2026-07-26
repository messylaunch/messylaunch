// GoHighLevel integration — API client + contact sync.
// When GHL_API_KEY is set, leads from /start are automatically pushed to GHL
// as contacts. When it's not set, everything degrades gracefully.
//
// Setup: get your Location API key from GHL (Settings → Business Profile →
// API Key), set GHL_API_KEY + GHL_LOCATION_ID in your env.

const GHL_BASE = "https://rest.gohighlevel.com/v1";

export function ghlConfigured(): boolean {
  return Boolean(process.env.GHL_API_KEY);
}

// ---- Types ----

export interface GHLContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  tags?: string[];
  customFields?: Record<string, string>;
}

export interface GHLContactInput {
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  tags?: string[];
  customFields?: Record<string, string>;
}

// ---- API helpers ----

async function ghlFetch<T>(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const url = `${GHL_BASE}${path}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${process.env.GHL_API_KEY!}`,
    "Content-Type": "application/json",
    ...(process.env.GHL_LOCATION_ID ? { "Location-Id": process.env.GHL_LOCATION_ID } : {}),
  };

  const res = await fetch(url, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GHL API ${res.status}: ${text.slice(0, 300)}`);
  }

  return res.json() as Promise<T>;
}

// ---- Contact operations ----

export async function findContactByEmail(email: string): Promise<GHLContact | null> {
  if (!ghlConfigured()) return null;
  try {
    const data = await ghlFetch<{ contacts: GHLContact[] }>(
      `/contacts/?query=${encodeURIComponent(email)}&limit=1`
    );
    return data.contacts?.[0] ?? null;
  } catch (err) {
    console.error("GHL contact lookup failed:", err);
    return null;
  }
}

export async function createContact(input: GHLContactInput): Promise<GHLContact | null> {
  if (!ghlConfigured()) return null;
  try {
    const data = await ghlFetch<{ contact: GHLContact }>("/contacts/", {
      method: "POST",
      body: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        companyName: input.companyName,
        tags: input.tags ?? ["messy-launch-lead"],
        customFields: input.customFields ?? {},
      },
    });
    return data.contact;
  } catch (err) {
    console.error("GHL create contact failed:", err);
    return null;
  }
}

export async function upsertContact(input: GHLContactInput): Promise<GHLContact | null> {
  if (!ghlConfigured()) return null;
  const existing = await findContactByEmail(input.email);
  if (existing) {
    // GHL v1 doesn't have a clean PATCH for contacts with upsert semantics.
    // For now, if the contact exists we just add tags and move on — the contact
    // record itself is already in GHL. Future: switch to v2 API for true upsert.
    try {
      await ghlFetch(`/contacts/${existing.id}/tags/`, {
        method: "POST",
        body: { tags: input.tags ?? ["messy-launch-lead"] },
      });
    } catch (err) {
      console.error("GHL tag update failed:", err);
    }
    return existing;
  }
  return createContact(input);
}

// ---- Stage mapping ----

const STAGE_LABELS: Record<string, string> = {
  IDEA: "Starting from an idea",
  LAUNCHED_QUIET: "Launched but quiet",
  HAS_CLIENTS: "Has customers, wants profit",
};

// Map the lead intake stage to GHL custom fields so you can build a pipeline
// view or smart list from them inside GHL.
export function leadCustomFields(lead: {
  businessName: string;
  stage: string;
  messy?: string;
  goal?: string;
}): Record<string, string> {
  const fields: Record<string, string> = {
    business_name: lead.businessName,
    stage: lead.stage,
    stage_label: STAGE_LABELS[lead.stage] ?? lead.stage,
  };
  if (lead.messy) fields.messy_areas = lead.messy;
  if (lead.goal) fields.goal_90_days = lead.goal;
  return fields;
}
