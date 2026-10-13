// Generates direct Google Calendar event link for contests
export const generateGoogleCalendarLink = (contest) => {
  const title = encodeURIComponent(`${contest.platform}: ${contest.title}`);
  const details = encodeURIComponent(
    `Official Contest link: ${contest.url}\nPlatform: ${contest.platform}\nDuration: ${contest.duration}`
  );
  const location = encodeURIComponent(contest.url);
  // Default to a 2 hour slot in UTC format
  const dateStr = "20250425T140000Z/20250425T163000Z";
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dateStr}`;
};
