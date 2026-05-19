# Security Policy

## Supported Versions

The `main` branch receives security updates.

## Reporting a Vulnerability

Report vulnerabilities privately through GitHub security advisories if enabled for the repository. Do not include exploit details in public issues.

## Self-Hosted Security Model

This project is self-hosted by default. Each deployer should run their own server connected to their own Supabase project.

Do not operate a public shared memory service for unrelated users until you add tenant isolation, stronger authentication, audit logging, rate limiting, and abuse controls.

## Bearer Token Auth

v1 uses `MEMORY_MCP_TOKEN` as a simple bearer token. Use a long random value and rotate it if exposed.

## Supabase Service Role Key

`SUPABASE_SERVICE_ROLE_KEY` must only be used server-side. Never expose it to browsers, clients, logs, screenshots, issue reports, or public repos.

## Never Store Secrets As Memory

Do not store API keys, passwords, tokens, credentials, private keys, recovery codes, Claude login details, or deployment secrets as memories.

## Public SaaS Warning

OAuth or equivalent multi-user authentication and authorization should be implemented before offering this project as a public SaaS.
