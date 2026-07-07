# rain-dms

A self-hosted document management system with OCR-powered full-text search — deployable via Docker Compose (single-node) or Kubernetes (k3s) with event-driven autoscaling.

Upload a document, it gets stored, OCR'd, indexed, and becomes instantly searchable — including inside scanned images and PDFs.

## Features

| Feature            | Notes                                                                              |
| ------------------ | ---------------------------------------------------------------------------------- |
| Document upload    | Drag-and-drop, SHA-256 dedup check before upload                                   |
| OCR pipeline       | Async text extraction from images/PDFs via PaddleOCR, indexed for search           |
| Full-text search   | Meilisearch-backed, with tag filters, exclusions, and date ranges                  |
| Object storage     | S3-compatible storage via SeaweedFS                                                |
| Auth               | JWT-based, gated at the reverse proxy via `auth_request`                           |
| Encryption at rest | Files are encrypted server-side before being written to storage (work in progress) |
| Live log viewer    | Dozzle, auth-protected                                                             |
| Autoscaling (k3s)  | KEDA scales OCR workers based on RabbitMQ queue depth                              |

## Architecture

nginx is the sole ingress point — the only thing reachable from outside. From there:

```
client ──► nginx ──┬──► server ──┬──► postgres
                    │             ├──► RabbitMQ
                    │             └──► meilisearch
                    ├──► S3 (SeaweedFS)
                    └──► RabbitMQ
```

- **nginx**: single entry/exit point, auth-gated (`auth_request`), also proxies directly to S3 and RabbitMQ where needed.
- **`server`** (Bun + Hono): REST API, auth, orchestration; talks to Postgres, RabbitMQ, and Meilisearch.
- **workers**: file watching, merging, OCR — decoupled from the API via RabbitMQ.
- **SeaweedFS**: S3-compatible object storage for raw files and page images.
- **Meilisearch**: indexes OCR'd text and metadata.

<details>
<summary>Security details</summary>

- nginx additionally verifies a shared OpenSSL-generated hex identifier on each request, to confirm traffic is reaching the intended server.
- nginx accepts client IPs from an explicit allowlist (LAN ranges plus a small set of specific Tailscale IPs).
- Containers sit on scoped Docker networks (`internal: true`) rather than one flat network, so each service can generally only reach what it depends on. Not yet exhaustively audited, but the intent is least-privilege by default.
- **Dozzle ships with a default login** (`docker/config/users-dozzle.yml`) that is **not** randomized by the install script — unlike every other secret in `.env`, this one is a static bcrypt hash committed to the repo. If you enable Dozzle, generate your own before exposing it:
  ```bash
  docker run -it --rm amir20/dozzle generate admin --password YOUR_PASSWORD --email you@example.com --name "Admin" > docker/config/users-dozzle.yml
  ```
  Then restart the `dozzle` container to pick up the new file.

</details>

See [`frontend/README.md`](./frontend/README.md) for frontend details.

## Tech stack

- **Backend:** Bun, Hono, PostgreSQL (Drizzle ORM), RabbitMQ, SeaweedFS, Meilisearch
- **OCR:** PaddleOCR — model size (tiny / small / medium) is currently configured in code
- **Frontend:** React, TypeScript, Vite, Tailwind
- **Infra:** Docker Compose (single-node) or Kubernetes (k3s) with Calico CNI + KEDA autoscaling, provisioned via Ansible

## Setup

Everything — Docker Compose or k3s — is set up through the same install script:

```bash
curl -fsSL https://raw.githubusercontent.com/ninja-boldo/rain-dms/refs/heads/main/deployment/deploy.sh | bash
```

This clones the repo, installs dependencies, generates certs, and creates a `.env` with random secrets.

### Single-node, local OCR only

For a simpler single-node setup without the distributed OCR path, swap in `docker/local-ocr-compose.yml` in place of `docker/compose.yml` (same install script).

<details>
<summary>Known limitations</summary>

- Encryption isn't supported yet on this path (tested without it, works well).
- Intermittent TLS cert bug that can surface after a few minutes of uptime — not yet root-caused.

</details>

### Kubernetes / k3s

After the install script, populate `deployment/hosts.ini` with your nodes:

<details>
<summary>hosts.ini example</summary>

```ini
[k3s_orchestrator]
orchestrator-host ansible_host=192.168.1.X ansible_user=youruser ansible_password=yourpass ansible_become_password=yourpass

[k3s_workers]
worker-1 ansible_host=192.168.1.Y ansible_user=youruser ansible_password=yourpass ansible_become_password=yourpass
worker-2 ansible_host=192.168.1.Z ansible_user=youruser ansible_password=yourpass ansible_become_password=yourpass
```

`hosts.ini` holds plaintext SSH credentials — it's gitignored and should never be committed. Beyond a closed home LAN, switch to key-based SSH auth and drop password auth from `sshd_config`.

</details>

Then run `./deployment/apply-kubectl.sh` — provisions k3s + Calico via Ansible, pulls the kubeconfig, and starts the cluster workloads.

<details>
<summary>Autoscaling details</summary>

- **KEDA** scales OCR worker replicas based on live RabbitMQ queue depth over AMQPS, using a custom CA trust chain for the TLS handshake.
- A CronJob dynamically adjusts `maxReplicaCount` based on free cluster CPU, so autoscaling stays within actual cluster capacity.
- An egress controller enforces baseline cluster policy.

</details>

<details>
<summary>Known open issues</summary>

- k3s deployment still has rough edges and hasn't been tested across a range of different systems yet.

</details>

## Project structure

```
backend/          Bun/Hono API server, workers, OCR pipeline, DB schema (Drizzle)
frontend/         React/Vite/TypeScript SPA
docker/           Compose stack: nginx, server, postgres, SeaweedFS, RabbitMQ, Meilisearch, Dozzle
deployment/       Ansible playbooks, k3s manifests, KEDA scaler, cluster bootstrap scripts
```

## Status

Actively developed. Core pipeline (upload → OCR → index → search) is stable; encryption-at-rest and k3s hardening are ongoing work.

## License

MIT
