import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import express from 'express';
import rateLimit from 'express-rate-limit';
import ume from '@dantenl/umejs';
import fs from 'node:fs';
import { parse } from 'node-html-parser';
import matter from 'lite-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// # config
const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? '127.0.0.1';
const SITE_URL = process.env.SITE_URL ?? `http://localhost:${PORT}`;
const IS_PROD = process.env.NODE_ENV === 'production';

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL ?? '';
const FORM_KEY = process.env.FORM_KEY || crypto.randomBytes(32).toString('hex');
const TURNSTILE_KEY = process.env.TURNSTILE_KEY;

const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const TEMPLATES_DIR = path.join(ROOT, 'templates');
const PARTIALS_DIR = path.join(ROOT, 'content', 'partials');
const PROJECTS_CONTENT_DIR = path.join(ROOT, 'content');

if (IS_PROD && !process.env.FORM_KEY) {
    console.warn('[warn] FORM_KEY unset — using an ephemeral key; form tokens die on restart.');
}
if (!DISCORD_WEBHOOK_URL) {
    console.warn('[warn] DISCORD_WEBHOOK_URL unset — /contact will return 503.');
} else if (
    !/^https:\/\/(canary\.|ptb\.)?discord(app)?\.com\/api\/webhooks\/\d+\/[\w-]+$/.test(
        DISCORD_WEBHOOK_URL,
    )
) {
    console.warn('[warn] DISCORD_WEBHOOK_URL does not look like a Discord webhook URL.');
}

// # express setup
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

// # umejs setup
const umeConfig = ume({
    contentDir: PROJECTS_CONTENT_DIR,
    templatePath: path.join(TEMPLATES_DIR, 'projects.ume.html'),
    templatesDir: TEMPLATES_DIR,
    partialsDir: PARTIALS_DIR,
    mode: IS_PROD ? 'production' : 'development',
    helpers: {
        currentYear: {
            helper: () => String(new Date().getFullYear()),
            cache: false,
        },
    },
    builders: [projectsIndexBuilder],
    nextUsage: true,
});

// builders
function projectsIndexBuilder(req, res, slug, html) {
    // only run this builder on the index page
    const normalizedSlug = slug.startsWith('/') ? slug : `/${slug}`;
    if (normalizedSlug !== '/index') {
        return html;
    }

    const root = parse(html, { comment: true });
    const grid = root.querySelector('#project-grid');
    if (!grid) return html;

    // read all markdown files except index.md
    const files = fs
        .readdirSync(PROJECTS_CONTENT_DIR)
        .filter((f) => f.endsWith('.md') && f !== 'index.md');

    // extract frontmatter, sort by newest first
    const projects = files
        .map((file) => {
            const filePath = path.join(PROJECTS_CONTENT_DIR, file);
            const parsed = matter(fs.readFileSync(filePath, 'utf8'));
            return {
                slug: file.replace('.md', ''),
                ...parsed.data,
            };
        })
        .sort((a, b) => String(b.year).localeCompare(String(a.year)));

    // generate card html
    let cardsHtml = '';
    for (const p of projects) {
        const badgeClass =
            p.status === 'live' ? 'badge-live' : p.status === 'archived' ? 'badge-archived' : '';
        const statusText = p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : '';

        cardsHtml += `
            <article class="card">
                <div class="card-media">
                <img src="${p.image}" alt="${p.title} screenshot" width="1200" height="750" loading="lazy" decoding="async">
                </div>
                <div class="card-body">
                <div class="card-top">
                    <h3><a href="/projects/${p.slug}">${p.title}</a></h3>
                    ${statusText ? `<span class="badge ${badgeClass}">${statusText}</span>` : ''}
                </div>
                <p class="card-summary">${p.summary}</p>
                <ul class="stack" aria-label="Built with">
                    ${p.stack
                        .split(',')
                        .map((s) => `<li>${s.trim()}</li>`)
                        .join('')}
                </ul>
                <p class="card-year">${p.year}</p>
                </div>
            </article>
        `;
    }

    // add cards to grid
    grid.set_content(cardsHtml);

    return root.toString();
}

// # security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader(
        'Content-Security-Policy',
        [
            "default-src 'self'",
            "img-src 'self' data:",
            "style-src 'self' 'unsafe-inline'",
            "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
            "font-src 'self'",
            "form-action 'self'",
            "frame-src 'self' https://challenges.cloudflare.com",
            "frame-ancestors 'none'",
            "base-uri 'self'",
        ].join('; '),
    );
    next();
});

// # signed timestamp cookie
// hopefully this can catch some automations
const FORM_COOKIE = 'ft';
const FORM_MIN_AGE_MS = 2_000;
const FORM_MAX_AGE_MS = 1 * 60 * 60 * 1_000;
// 1 hour

const signTimestamp = (ts) =>
    `${ts}.${crypto.createHmac('sha256', FORM_KEY).update(String(ts)).digest('base64url')}`;

function verifyTimestamp(token) {
    if (typeof token !== 'string') return false;
    const [ts, mac] = token.split('.');
    if (!ts || !mac) return false;
    const expected = crypto.createHmac('sha256', FORM_KEY).update(ts).digest('base64url');
    const a = Buffer.from(mac);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
    const age = Date.now() - Number(ts);
    return Number.isFinite(age) && age >= FORM_MIN_AGE_MS && age <= FORM_MAX_AGE_MS;
}

function readCookie(req, name) {
    const raw = req.headers.cookie;
    if (!raw) return undefined;
    for (const part of raw.split(';')) {
        const i = part.indexOf('=');
        if (i === -1) continue;
        if (part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
    }
    return undefined;
}

app.use((req, res, next) => {
    if (req.method === 'GET') {
        res.cookie(FORM_COOKIE, signTimestamp(Date.now()), {
            httpOnly: true,
            sameSite: 'lax',
            secure: SITE_URL.startsWith('https://'),
            maxAge: FORM_MAX_AGE_MS,
            path: '/',
        });
    }
    next();
});

// # register static files
app.use(
    express.static(PUBLIC_DIR, {
        extensions: ['html'],
        maxAge: IS_PROD ? '7d' : 0,
        setHeaders(res, filePath) {
            if (/\.(avif|webp|png|jpe?g|svg|woff2)$/i.test(filePath)) {
                // set cache for certain files
                res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
            }
        },
    }),
);

// define where umejs should be sued
app.use('/projects/{*slug}', umeConfig);

app.get('/health', (req, res) => res.type('text/plain').send('ok'));

// # contact form
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1_000,
    limit: 5,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { ok: false, error: 'Too many submissions. Please try again later.' },
});

// submits
app.post(
    '/contact',
    contactLimiter,
    express.urlencoded({ extended: false, limit: '32kb' }),
    express.json({ limit: '32kb' }),
    async (req, res) => {
        const wantsJson =
            req.is('application/json') || (req.get('accept') ?? '').includes('application/json');

        // honeypot: pretend success so bots don't learn the field is a trap.
        if (typeof req.body?.website === 'string' && req.body.website.trim() !== '') {
            return respond({ ok: true });
        }

        if (!verifyTimestamp(readCookie(req, FORM_COOKIE))) {
            return respond(
                {
                    ok: false,
                    error: 'Your form session expired. Please reload the page and try again.',
                },
                400,
            );
        }

        // get form fields, strip for whitespaces
        const token = String(req.body?.['cf-turnstile-response'] ?? '')
            .replace(/[\r\n]+/g, ' ')
            .trim();
        const name = String(req.body?.name ?? '')
            .replace(/[\r\n]+/g, ' ')
            .trim();
        const email = String(req.body?.email ?? '')
            .replace(/[\r\n]+/g, '')
            .trim();
        const message = String(req.body?.message ?? '').trim();

        // check turnstile captcha
        const validation = await validateTurnstile(token, req.ip);

        if (!validation.success) {
            // user failed captcha
            return respond({ ok: false, error: 'Invalid verification' }, 400);
        }

        // validate email and name and message
        if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return respond({ ok: false, error: 'Please enter a valid email address.' }, 400);
        }
        if (name.length > 100) {
            return respond({ ok: false, error: 'That name is a bit too long.' }, 400);
        }
        if (message.length < 10 || message.length > 4_000) {
            return respond(
                { ok: false, error: 'Please write a message between 10 and 4000 characters.' },
                400,
            );
        }

        if (!DISCORD_WEBHOOK_URL) {
            console.error('[contact] DISCORD_WEBHOOK_URL not configured');
            return respond(
                { ok: false, error: 'The contact form is temporarily unavailable.' },
                503,
            );
        }

        try {
            // try and sent it to discord
            await sendToDiscord({ name, email, message });
            return respond({ ok: true });
        } catch (err) {
            // something went wrong with discy ):
            console.error('[contact] webhook failed:', err.message);
            return respond(
                {
                    ok: false,
                    error: 'Something went wrong sending your message. Please email me directly.',
                },
                502,
            );
        }

        // simple response if user doesnt have js
        function respond(body, status = 200) {
            if (wantsJson) return res.status(status).json(body);
            if (status === 200) return res.redirect(303, '/?status=sent#contact');
            return res.redirect(303, '/?status=error#contact');
        }
    },
);

// * cloudflare turnstile verification
async function validateTurnstile(token, remoteip) {
    try {
        const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                secret: TURNSTILE_KEY,
                response: token,
                remoteip: remoteip,
            }),
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Turnstile validation error:', error);
        return { success: false, 'error-codes': ['internal-error'] };
    }
}

// * discord webhook
const truncate = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

async function sendToDiscord({ name, email, message }) {
    const payload = {
        allowed_mentions: { parse: [] }, // disallow pinging
        embeds: [
            {
                title: 'New message via dantenl.com',
                color: 0xff51eb,
                fields: [
                    { name: 'Name', value: name || '—', inline: true },
                    { name: 'E-mail', value: email, inline: true },
                ],
                description: truncate(message, 4_000), // embed description limit is 4096
                timestamp: new Date().toISOString(),
            },
        ],
    };

    const res = await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (res.status === 429) {
        const body = await res.json().catch(() => ({}));
        throw new Error(`discord rate limited (retry_after=${body.retry_after ?? '?'})`);
    }
    if (!res.ok) {
        const detail = await res.text().catch(() => '');
        throw new Error(`discord ${res.status}: ${detail.slice(0, 200)}`);
    }
}

// # 404 and 500s
app.use((req, res) => {
    res.status(404).sendFile(__dirname + '/public/404.html');
});

app.use((err, req, res, next) => {
    console.error('[error]', err);
    if (res.headersSent) return next(err);
    res.status(500).type('text/plain').send('Internal server error');
});

// # start and shutdown
const server = app.listen(PORT, HOST, () => {
    console.log(`Listening on http://${HOST}:${PORT}`);
});

let shuttingDown = false;
async function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`${signal} received, shutting down`);
    server.close(async () => {
        try {
            await umeConfig.close();
        } catch (err) {
            console.error('[shutdown] umejs close failed:', err);
        }
        process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
