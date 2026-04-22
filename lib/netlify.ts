import crypto from "node:crypto";

interface NetlifySite {
  id: string;
  url?: string;
  ssl_url?: string;
  name: string;
}

interface NetlifyDeploy {
  id: string;
  required?: string[];
}

export interface DeployResult {
  url: string;
  deployId: string;
  siteName: string;
}

const API = "https://api.netlify.com/api/v1";

async function apiFetch<T>(
  token: string,
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Netlify API ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

export async function deployToNetlify(
  html: string,
  token: string,
  projectSlug: string
): Promise<DeployResult> {
  const siteName = `digistore-${projectSlug.toLowerCase().replace(/[^a-z0-9-]/g, "-")}`.slice(
    0,
    60
  );

  // 1. Find existing site or create
  let site: NetlifySite | undefined;
  try {
    const sites = await apiFetch<NetlifySite[]>(
      token,
      `/sites?name=${encodeURIComponent(siteName)}`
    );
    site = sites.find((s) => s.name === siteName);
  } catch {
    // fall through to create
  }

  if (!site) {
    site = await apiFetch<NetlifySite>(token, `/sites`, {
      method: "POST",
      body: JSON.stringify({ name: siteName }),
    });
  }

  // 2. Create deploy with file digest
  const sha1 = crypto.createHash("sha1").update(html).digest("hex");
  const deploy = await apiFetch<NetlifyDeploy>(
    token,
    `/sites/${site.id}/deploys`,
    {
      method: "POST",
      body: JSON.stringify({ files: { "/index.html": sha1 } }),
    }
  );

  // 3. Upload the file
  const uploadRes = await fetch(
    `${API}/deploys/${deploy.id}/files/index.html`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/octet-stream",
      },
      body: html,
    }
  );
  if (!uploadRes.ok) {
    const text = await uploadRes.text();
    throw new Error(`Netlify upload failed ${uploadRes.status}: ${text}`);
  }

  return {
    url: site.ssl_url || site.url || `https://${siteName}.netlify.app`,
    deployId: deploy.id,
    siteName,
  };
}
