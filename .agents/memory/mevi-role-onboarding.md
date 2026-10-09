---
name: Mevi role onboarding
description: Initial provisioning expectations for Mevi administrator and agency accounts.
---

New accounts default to the buyer role. Admin and agency access requires trusted Clerk public metadata; agency accounts also need their agency slug. The app does not yet include a screen that assigns these privileged roles.

**Why:** Self-service account creation must not grant administrative access, and no administrator exists inside a fresh installation to bootstrap another one.

**How to apply:** Provision the first administrator through a trusted Clerk dashboard/API path, then assign agency roles and slugs before expecting their protected dashboards to work. Any future in-app role assignment must be limited to already-authorized administrators.
