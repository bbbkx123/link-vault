export function getDomain(url: string) {
  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./, "");
  } catch {
    return "link";
  }
}

export function titleFromUrl(url: string) {
  const domain = getDomain(url);
  return domain === "link" ? "未命名收藏" : domain.slice(0, 80);
}

export function siteInitial(url: string) {
  return getDomain(url).charAt(0).toUpperCase() || "L";
}

export function initialOf(name: string) {
  return Array.from(name.trim())[0]?.toUpperCase() || "拾";
}

export function toneFor(seed: string) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) | 0;
  }
  return Math.abs(hash) % 5;
}

export function formatShortDate(value: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    timeZone: "Asia/Shanghai",
  }).format(value);
}

export function formatLongDate(value: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Shanghai",
  }).format(value);
}

export function buildHref(
  pathname: string,
  params: Record<string, string | number | undefined | null>,
) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  }
  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}
