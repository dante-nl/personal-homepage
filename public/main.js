// if you see this, you probably know a thing or two of web development!
// uhm
// i guess
// ONE RING TO RULE THEM ALL!!

// # theme toggle
const toggle = document.getElementById('theme-toggle');
const label = toggle?.querySelector('.theme-toggle-label');
const hljsLight = document.getElementById('hljs-theme-light');
const hljsDark = document.getElementById('hljs-theme-dark');

function syncToggle() {
    const isLight = document.documentElement.dataset.theme === 'light';
    toggle?.setAttribute('aria-pressed', String(isLight));
    if (label) label.textContent = isLight ? 'Switch to dark theme' : 'Switch to light theme';
    if (hljsLight) hljsLight.disabled = !isLight;
    if (hljsDark) hljsDark.disabled = isLight;
}

if (toggle) {
    syncToggle();
    toggle.addEventListener('click', () => {
        const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
        document.documentElement.dataset.theme = next;
        try {
            localStorage.setItem('theme', next);
        } catch {}
        syncToggle();
    });
}

// # footer year
// because not everything can be done with umejs sadly
const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());

// # contact form
const form = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

// submissions
if (form && formStatus) {
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const button = form.querySelector('button[type="submit"]');
        button.disabled = true;
        formStatus.textContent = 'Sending...';

        try {
            const res = await fetch(form.action, {
                method: 'POST',
                headers: { Accept: 'application/json' },
                body: new URLSearchParams(new FormData(form)),
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok && data.ok) {
                form.reset();
                formStatus.textContent =
                    'Thanks! Your message has been sent! :D I usually reply within a day or so.';
            } else {
                formStatus.textContent =
                    data.error ?? 'Something went wrong. Please email me directly!';
            }
        } catch {
            formStatus.textContent = 'Could not reach the server. Please email me directly!';
        } finally {
            button.disabled = false;
        }
    });
}

// # highlight.js initialistation
if (typeof hljs !== 'undefined') {
    document.querySelectorAll('code').forEach((block) => {
        // if there's a language, add it
        const hasLanguage = Array.from(block.classList).some((cls) => cls.startsWith('language-'));
        // if not, add plaintext filter
        if (!hasLanguage) block.classList.add('language-plaintext');
        hljs.highlightElement(block);

        // inline code has no <pre> parent, dont add copy button there
        addCopyButton(block);
    });
}

// add copy buttons to code blocks
function addCopyButton(codeElement) {
    const pre = codeElement.closest('pre');
    if (!pre) return;

    let wrapper = pre.parentElement;
    if (!wrapper.classList.contains('code-wrapper')) {
        wrapper = document.createElement('div');
        wrapper.className = 'code-wrapper';
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);
    }

    if (wrapper.querySelector('.copy-btn')) return;

    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.type = 'button';
    btn.textContent = 'Copy';
    btn.setAttribute('aria-label', 'Copy code to clipboard');

    btn.addEventListener('click', async () => {
        const text = codeElement.textContent;
        try {
            await navigator.clipboard.writeText(text);
            flashCopied(btn);
        } catch {
            fallbackCopy(text, btn);
        }
    });

    wrapper.appendChild(btn);
}

// show confirm feedback
function flashCopied(btn) {
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
        btn.textContent = 'Copy';
        btn.classList.remove('copied');
    }, 2000);
}

// not everything may support the newest way of copying
// so here's fallback
// in the uk, would it be autumnback? /j
// i cant wait for me to find this in god knows how many years
// hi dante! -dante from november 2026
function fallbackCopy(text, btn) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
        document.execCommand('copy');
        flashCopied(btn);
    } catch {
        btn.textContent = 'Copy failed';
    } finally {
        document.body.removeChild(ta);
    }
}
