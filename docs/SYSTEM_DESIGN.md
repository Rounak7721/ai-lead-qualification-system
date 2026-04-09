# System Design — AI Lead Qualification System

---

## Table of Contents

- [Problem](#problem)
- [Solution](#solution)
- [Architecture](#architecture)
- [Workflows](#workflows)
- [Activity Logging Strategy](#activity-logging-strategy)
- [Key Design Decisions](#key-design-decisions)
- [Challenges & Mitigations](#challenges--mitigations)
- [Deployment Considerations](#deployment-considerations)
- [Future Improvements](#future-improvements)
- [Summary](#summary)

---

## Problem

Manual lead qualification is slow, inconsistent, and dependent on human effort. Sales
teams often spend time on low-quality leads while high-intent opportunities are delayed.
This leads to inefficiency and lost conversions.

---

## Solution

An automated, LLM-powered system that:

- Ingests leads from a web form
- Scores them using AI
- Classifies them into stages: Hot, Warm, or Cold
- Stores them in a CRM
- Notifies the sales team via Slack

All processes are fully automated.

---

## Architecture

![System Architecture](../assets/system-architecture.png)

The architecture follows a workflow-based design:

- Real-time processing pipeline for immediate lead handling
- Scheduled pipeline for batch processing of warm leads
- Centralized decision logic for stage classification

### Components

| Component            | Role                                           |
|----------------------|------------------------------------------------|
| Tally                | Lead intake form                               |
| n8n                  | Workflow orchestration engine                  |
| LLaMA 3.1 8B (Groq)  | Lead scoring model                             |
| Airtable             | CRM (Hot & Warm leads)                         |
| Google Sheets        | Append-only activity log and Cold lead archive |
| Slack                | Notifications                                  |
| SMTP                 | Confirmation emails                            |

---

## Workflows

### 4.1 Real-Time Workflow (Form Submission)

Triggered on every form submission.

**Steps:**

1. Normalize incoming form data
2. Validate required fields
3. Send confirmation email
4. Pass data to LLM with structured prompt
5. Parse JSON output (with fallback handling)
6. Check Airtable for duplicate (email-based)

**Duplicate Handling:**

- Existing lead → update record, reset `Notified = false`
- New lead → create record

**Routing by Score:**

| Score  | Tier    | Action                                              |
|--------|---------|-----------------------------------------------------|
| ≥ 80   | 🔴 Hot  | Slack alert (immediate) + Airtable (`Notified = true`)   |
| 50–79  | 🟡 Warm | Airtable only (`Notified = false`)                  |
| < 50   | 🔵 Cold | Logged in Google Sheets                             |

---

### 4.2 Warm Monitoring Workflow (Scheduled)

Runs at fixed intervals.

**Steps:**

1. Query Airtable for `Stage = Warm` AND `Notified = false`
2. If leads exist:
   - Sort by score
   - Select top entries
   - Build structured Slack message
   - Send notification
   - Update `Notified = true`
3. If no leads found → send fallback message to Slack

---

## Activity Logging Strategy

The system maintains a complete interaction history using an append-only model in
Google Sheets. Each time a lead is created, updated, reclassified, or processed,
a new record is appended.

### Benefits

- **Auditability** — Full trace of system decisions
- **Debugging** — Easy inspection of past states
- **Analytics-ready** — Enables trend analysis
- **Non-destructive** — No overwriting of historical data

---

## Key Design Decisions

- **LLM-based scoring** — Captures intent, urgency, and relevance from free-text input

- **State-based tracking (`Notified`)** — Prevents duplicate alerts; acts as a
  lightweight workflow state manager

- **Separation of workflows** — Real-time (Hot) and scheduled (Warm) run independently

- **Environment variable abstraction** — All integrations (Slack, APIs) are decoupled
  from workflow logic; improves portability and security

- **Structured JSON prompting** — Forces deterministic LLM output; reduces parsing
  ambiguity

- **Append-only logging (Google Sheets)** — Preserves full history of interactions;
  enables audit and analytics

---

## Challenges & Mitigations

| Challenge                   | Mitigation                                                  |
|-----------------------------|-------------------------------------------------------------|
| LLM output inconsistency    | Strict prompt + JSON extraction + fallback logic            |
| Duplicate submissions       | Email-based lookup before record creation                   |
| Polling overhead            | Accepted trade-off; event-driven triggers planned           |
| No retry mechanism          | Failures default to `score = 0`; retry logic planned        |

---

## Deployment Considerations

- Supports cloud LLMs (Groq) and local LLMs (Ollama)
- Sensitive credentials are handled via environment variables
- System is modular and adaptable:
  - PostgreSQL instead of Airtable
  - Local storage instead of cloud tools

---

## Future Improvements

- [ ] Replace polling with webhook/event-driven triggers
- [ ] Add fallback LLM model
- [ ] Implement retry and error queue
- [ ] Add lead enrichment APIs
- [ ] Introduce scoring confidence threshold
- [ ] Build analytics dashboard
- [ ] Add automated re-engagement flows

---

## Summary

This system transforms lead qualification into a fully automated, intelligent pipeline
that:

- Reduces manual effort
- Improves response time
- Prioritizes high-value opportunities
- Maintains clean, structured, and auditable lead data

It demonstrates practical application of LLMs in real-world business automation.