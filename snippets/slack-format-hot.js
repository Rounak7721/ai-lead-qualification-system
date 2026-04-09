// Simplified Slack formatting logic for demonstration purposes.
// Production version includes richer formatting and edge-case handling.

function formatLead(data) {
  const name = data.name || "Unknown";
  const company = data.company || "N/A";
  const role = data.role || "N/A";
  const score = data.score || 0;

  return {
    text: `High Intent Lead: ${name} (${score}/100)`,

    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: "High Intent Lead" }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${name}* — *${score}/100*\n_${role} @ ${company}_`
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Message*\n> ${data.message || "N/A"}`
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Insight*\n> ${data.reason || "N/A"}`
        }
      }
    ]
  };
}
