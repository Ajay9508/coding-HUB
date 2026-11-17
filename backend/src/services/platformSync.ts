import { CircuitBreaker } from "./circuitBreaker.js";

const providerBreakers = new Map<string, CircuitBreaker<Response>>();

export const requestJson = async (url: string, options: any = {}) => {
  const fetcher = options.fetcher ?? fetch;
  const { fetcher: _fetcher, acceptProviderFailure = false, ...requestOptions } = options;
  const timeoutMs = Number(process.env.PROFILE_SYNC_TIMEOUT_MS) || 12000;
  const maxRetries = 2;
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const host = new URL(url).host;
      let breaker = providerBreakers.get(host);
      if (!breaker) {
        breaker = new CircuitBreaker<Response>(undefined, 3, 30_000);
        providerBreakers.set(host, breaker);
      }
      const response = await breaker.execute(() => fetcher(url, { ...requestOptions, signal: AbortSignal.timeout(timeoutMs), headers: { "user-agent": "CodingHub/1.0 profile-sync", ...requestOptions.headers } }));
      if (response.ok) return await response.json();
      if (acceptProviderFailure && response.status === 400) {
        const payload = await response.json().catch(() => null);
        if (payload?.status === "FAILED") throw Object.assign(new Error("Codeforces rejected this profile handle."), { status: 422, expose: true, code: "invalid_platform_handle" });
      }
      if (![429, 500, 502, 503, 504].includes(response.status) || attempt === maxRetries) {
        const status = response.status === 429 || response.status >= 500 ? 503 : 502;
        throw Object.assign(new Error(`Platform returned HTTP ${response.status}`), { status, expose: true, code: "upstream_failure", retryAfter: status === 503 ? 30 : undefined });
      }
    } catch (error) {
      if (error.status) throw error;
      if (attempt === maxRetries) {
        const timeout = error.name === "TimeoutError" || error.name === "AbortError";
        throw Object.assign(new Error(timeout ? "The profile service timed out." : "The profile service is temporarily unavailable."), { status: timeout ? 504 : 503, expose: true, code: timeout ? "upstream_timeout" : "upstream_unavailable", retryAfter: 5 });
      }
    }
    const backoff = 200 * (2 ** attempt) + Math.floor(Math.random() * 150);
    await new Promise((resolve) => setTimeout(resolve, backoff));
  }
  throw Object.assign(new Error("The profile service is temporarily unavailable."), { status: 503, expose: true, code: "upstream_unavailable" });
};

let codeforcesQueue = Promise.resolve();
let lastCodeforcesRequestAt = 0;
const requestCodeforces = (url) => {
  const request = codeforcesQueue.then(async () => {
    const delay = Math.max(0, 2100 - (Date.now() - lastCodeforcesRequestAt));
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    lastCodeforcesRequestAt = Date.now();
    return requestJson(url, { acceptProviderFailure: true });
  });
  codeforcesQueue = request.catch(() => {});
  return request;
};

const syncCodeforces = async (handle) => {
  const base = (process.env.CODEFORCES_API_URL || "https://codeforces.com/api").replace(/\/$/, "");
  const info = await requestCodeforces(`${base}/user.info?handles=${encodeURIComponent(handle)}`);
  if (info.status !== "OK" || !info.result?.[0]) throw Object.assign(new Error("Codeforces handle was not found."), { status: 422, code: "invalid_platform_handle" });
  const submissions = await requestCodeforces(`${base}/user.status?handle=${encodeURIComponent(handle)}&from=1&count=10000`);
  if (submissions.status !== "OK") throw Object.assign(new Error("Could not load Codeforces submissions."), { status: 502, code: "upstream_failure", expose: true });
  const solved = new Set(submissions.result.filter((item) => item.verdict === "OK" && item.problem?.contestId && item.problem?.index).map((item) => `${item.problem.contestId}-${item.problem.index}`)).size;
  const user = info.result[0];
  return { handle: user.handle, rating: user.rating ?? null, maxRating: user.maxRating ?? null, rank: user.rank ?? null, solved, contests: null };
};

const syncLeetCode = async (handle) => {
  const data = await requestJson(process.env.LEETCODE_GRAPHQL_URL || "https://leetcode.com/graphql/", {
    method: "POST",
    headers: { "content-type": "application/json", referer: "https://leetcode.com/" },
    body: JSON.stringify({ query: "query userPublicProfile($username: String!) { matchedUser(username: $username) { username profile { ranking } submitStats { acSubmissionNum { difficulty count } } } userContestRanking(username: $username) { attendedContestsCount rating globalRanking } }", variables: { username: handle } }),
  });
  const user = data.data?.matchedUser;
  if (!user) throw Object.assign(new Error("LeetCode username was not found or its public profile API is unavailable."), { status: 422, code: "invalid_platform_handle" });
  const total = user.submitStats?.acSubmissionNum?.find(({ difficulty }) => difficulty === "All")?.count;
  const contest = data.data?.userContestRanking;
  return { handle: user.username, rating: Number.isFinite(contest?.rating) ? Math.round(contest.rating) : null, maxRating: null, rank: contest?.globalRanking ?? user.profile?.ranking ?? null, solved: Number.isFinite(total) ? total : null, contests: contest?.attendedContestsCount ?? null };
};

const requestText = async (url: string) => {
  for (let attempt = 0; attempt <= 2; attempt += 1) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(Number(process.env.PROFILE_SYNC_TIMEOUT_MS) || 12000),
        headers: {
          "user-agent": "CodingHub/1.0 profile-sync",
          accept: "text/html,application/xhtml+xml",
        },
      });
      if (response.ok) return response.text();
      if (![429, 500, 502, 503, 504].includes(response.status) || attempt === 2) {
        const status = response.status === 404 ? 422 : response.status >= 500 || response.status === 429 ? 503 : 502;
        throw Object.assign(new Error(`Platform returned HTTP ${response.status}`), {
          status,
          expose: true,
          code: status === 422 ? "invalid_platform_handle" : "upstream_failure",
        });
      }
    } catch (error) {
      if (error.status) throw error;
      if (attempt === 2) {
        const timeout = error.name === "TimeoutError" || error.name === "AbortError";
        throw Object.assign(new Error(timeout ? "The profile service timed out." : "The profile service is temporarily unavailable."), {
          status: timeout ? 504 : 503,
          expose: true,
          code: timeout ? "upstream_timeout" : "upstream_unavailable",
        });
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 200 * (2 ** attempt)));
  }
  throw Object.assign(new Error("The profile service is temporarily unavailable."), { status: 503, expose: true, code: "upstream_unavailable" });
};

const invalidProfile = (platform: string) =>
  Object.assign(new Error(`${platform} username was not found.`), { status: 422, code: "invalid_platform_handle" });

const syncCodeChef = async (handle) => {
  const base = (process.env.CODECHEF_PROFILE_URL || "https://www.codechef.com/users").replace(/\/$/, "");
  const html = await requestText(`${base}/${encodeURIComponent(handle)}`);
  const username = html.match(/m-username--link[^>]*>\s*([^<]+)/i)?.[1]?.trim();
  if (!username) throw invalidProfile("CodeChef");
  const rating = Number(html.match(/rating-number[^>]*>\s*([\d,]+)/i)?.[1]?.replace(",", ""));
  const maxRating = Number(html.match(/highest-rating[^>]*>[\s\S]*?([\d,]+)/i)?.[1]?.replace(",", ""));
  const rankMatches = [...html.matchAll(/rating-ranks[\s\S]*?<strong[^>]*>\s*([^<]+)/gi)].map((match) => match[1].trim());
  const contests = (html.match(/var all_rating = (\[[\s\S]*?\]);/i)?.[1].match(/\{/g) || []).length;
  const solved = Number(html.match(/Total Problems Solved[^<]*?(\d[\d,]*)/i)?.[1]?.replace(",", ""));
  return {
    handle: username,
    rating: Number.isFinite(rating) ? rating : null,
    maxRating: Number.isFinite(maxRating) ? maxRating : null,
    rank: rankMatches[0] || null,
    solved: Number.isFinite(solved) ? solved : null,
    contests: contests || null,
  };
};

const syncGeeksForGeeks = async (handle) => {
  const profileUrl = new URL(
    process.env.GFG_PROFILE_URL || "https://authapi.geeksforgeeks.org/api-get/user-profile-info/",
  );
  profileUrl.search = new URLSearchParams({
    handle,
    article_count: "false",
    redirect: "true",
  }).toString();
  const data = await requestJson(profileUrl.toString(), {
    headers: { accept: "application/json" },
  });
  const user = data.data;
  if (!user || typeof user !== "object") throw invalidProfile("GeeksforGeeks");
  const toNumberOrNull = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  };
  return {
    handle,
    rating: toNumberOrNull(user.score),
    maxRating: null,
    rank: user.institute_rank ?? null,
    solved: toNumberOrNull(user.total_problems_solved),
    contests: null,
  };
};

const syncHackerRank = async (handle) => {
  const base = (process.env.HACKERRANK_BASE_URL || "https://www.hackerrank.com").replace(/\/$/, "");
  const user = await requestJson(`${base}/rest/hackers/${encodeURIComponent(handle)}`);
  if (!user.status || !user.model) throw invalidProfile("HackerRank");
  const tracks = await requestJson(`${base}/rest/hackers/${encodeURIComponent(handle)}/scores_elo`);
  const scores = Array.isArray(tracks) ? tracks.map((track) => Number(track.practice?.score) || 0) : [];
  return {
    handle: user.model.username || handle,
    rating: scores.length ? scores.reduce((total, score) => total + score, 0) : null,
    maxRating: null,
    rank: user.model.level ?? null,
    solved: null,
    contests: null,
  };
};

const syncCodewars = async (handle) => {
  const base = (process.env.CODEWARS_API_URL || "https://www.codewars.com/api/v1").replace(/\/$/, "");
  const user = await requestJson(`${base}/users/${encodeURIComponent(handle)}`);
  if (!user?.username) throw invalidProfile("Codewars");
  return {
    handle: user.username,
    rating: Number.isFinite(user.ranks?.overall?.score) ? user.ranks.overall.score : null,
    maxRating: null,
    rank: user.ranks?.overall?.name ?? null,
    solved: Number.isFinite(user.codeChallenges?.totalCompleted) ? user.codeChallenges.totalCompleted : null,
    contests: null,
  };
};

const syncExercism = async (handle) => {
  const base = (process.env.EXERCISM_API_URL || "https://exercism.org/api/v2").replace(/\/$/, "");
  const user = await requestJson(`${base}/users/${encodeURIComponent(handle)}`);
  if (!user?.handle) throw invalidProfile("Exercism");
  return {
    handle: user.handle,
    rating: null,
    maxRating: null,
    rank: user.reputation?.total ?? null,
    solved: null,
    contests: null,
  };
};

const syncers: Record<string, (handle: string) => Promise<any>> = {
  codeforces: syncCodeforces,
  leetcode: syncLeetCode,
  codechef: syncCodeChef,
  geeksforgeeks: syncGeeksForGeeks,
  hackerrank: syncHackerRank,
  codewars: syncCodewars,
  exercism: syncExercism,
};

export const syncPlatformProfile = async (platformId: string, handle: string) => {
  const sync = syncers[platformId];
  if (sync) {
    return sync(handle);
  }

  throw Object.assign(
    new Error(`Live statistics integration is not configured for ${platformId}.`),
    { status: 501, expose: true, code: "platform_sync_unavailable" },
  );
};
