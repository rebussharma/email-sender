# email-sender

Shared `EmailSender` used across multiple sites. Not published to npm -
installed directly from this git repo.

## Install

In any consuming project:

```bash
npm install git+https://github.com/rebussharma/email-sender.git
```

To pin a stable version instead of always tracking `main`, tag a release here
(`git tag v1.0.0 && git push --tags`) and install with:

```bash
npm install git+https://github.com/rebussharma/email-sender.git#v1.0.0
```

**Next.js note:** since this ships raw TypeScript (no build step), add it to
`transpilePackages` in `next.config.js`:

```js
module.exports = { transpilePackages: ["email-sender"] };
```

Plain React (Vite/CRA) projects need no extra config.

## Which subpath to import

Only install the SDK your project actually uses - the other is never pulled in.

| Project setup | Install | Import |
|---|---|---|
| Next.js + EmailJS | `npm i @emailjs/browser` | `email-sender/emailjs`, used in a client component |
| Next.js + Resend | `npm i resend` | `email-sender/resend`, used in a Server Action or Route Handler |
| Plain React + EmailJS | `npm i @emailjs/browser` | `email-sender/emailjs`, used anywhere in the app |
| Plain React + Resend | `npm i` nothing extra | `email-sender/resend-proxy`, pointed at a shared deployed proxy (see below) |

## Examples

**Next.js or plain React, using EmailJS:**

```ts
import { EmailSender } from "email-sender";
import { EmailJSProvider } from "email-sender/emailjs";

const sender = new EmailSender(
  new EmailJSProvider({ serviceId: "service_abc", publicKey: "pub_key" })
);

await sender.send({ templateId: "welcome", templateParams: { name: "Jane" } });
```

**Next.js, using Resend (inside a Server Action or Route Handler):**

```ts
import { EmailSender } from "email-sender";
import { ResendServerProvider } from "email-sender/resend";

const sender = new EmailSender(
  new ResendServerProvider({ apiKey: process.env.RESEND_API_KEY!, from: "Site <noreply@yourdomain.com>" })
);

await sender.send({ to: "jane@example.com", subject: "Hi", html: "<p>Hello</p>" });
```

**Plain React, using Resend (via a shared proxy you deploy once):**

```ts
import { EmailSender } from "email-sender";
import { ResendProxyProvider } from "email-sender/resend-proxy";

const sender = new EmailSender(
  new ResendProxyProvider({ proxyUrl: "https://your-shared-proxy.vercel.app/api/send-email" })
);

await sender.send({
  to: "jane@example.com",
  from: "This Site <noreply@thissite.com>",
  subject: "Hi",
  html: "<p>Hello</p>",
});
```

The shared proxy itself is just `ResendServerProvider` exposed over HTTP -
deploy one small function (Vercel/Cloudflare) holding `RESEND_API_KEY`, and
every plain-React + Resend site can point at the same URL, passing its own
`from` address per call.

## Contact form UI

Lives in a separate repo: `contact-form-module`. It has no dependency on
this module - it just exposes an `onSubmit` callback you wire to whichever
provider above fits the site. See that repo's README for usage.
