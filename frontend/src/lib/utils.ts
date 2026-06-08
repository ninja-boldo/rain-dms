export async function login(
  username: string,
  password: string,
  serverUrl: string,
) {
  try {
    const response = await fetch(`${serverUrl}/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { ok: false, error: data.detail || "Authentication failed" };
    }

    // Save token to localStorage or cookie here if needed
    return { ok: true, token: data.token };
  } catch (err) {
    return { ok: false, error: "Cannot connect to server." };
  }
}

export function getBannerUrl(
  bannerUrl: string | undefined,
  serverUrl: string,
): string {
  if (!bannerUrl) return "";
  try {
    const url = new URL(bannerUrl);
    if (url.pathname.startsWith("/s3/")) {
      return `${serverUrl}${url.pathname}`;
    }
    return bannerUrl;
  } catch {
    return bannerUrl;
  }
}
