// Simplified Slack formatting logic for demonstration purposes.
// Production version includes richer formatting and edge-case handling.

function formatWarmLeads(leads) {
  const topLeads = leads
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const text = topLeads.map((lead, i) => {
    return `${i + 1}. *${lead.name}* — ${lead.score}/100
_${lead.role} @ ${lead.company}_

> ${lead.reason}`;
  }).join("\n\n---\n\n");

  return {
    text: `*Warm Leads Summary*\n\n${text}`
  };
}
