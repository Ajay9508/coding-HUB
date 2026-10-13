export const requestJson = async (url: string, options: any = {}) => {
  const fetcher = options.fetcher ?? fetch;
  const { fetcher: _fetcher, acceptProviderFailure = false, ...requestOptions } = options;
  const timeoutMs = Number(process.env.PROFILE_SYNC_TIMEOUT_MS) || 12000;
  const maxRetries = 2;
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const response = await fetcher(url, { ...requestOptions, signal: AbortSignal.timeout(timeoutMs), headers: { "user-agent": "CodingHub/1.0 profile-sync", ...requestOptions.headers } });
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

const syncers = { codeforces: syncCodeforces, leetcode: syncLeetCode };

export const syncPlatformProfile = async (platformId, handle) => {
  const sync = syncers[platformId];
  if (!sync) throw Object.assign(new Error("Automatic stats sync is not available for this platform yet. Your handle is connected and can be retried later."), { status: 501, code: "provider_not_supported" });
  return sync(handle);
};
