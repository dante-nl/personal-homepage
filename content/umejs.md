---
title: umejs
summary: A library for Express designed to easily spin up websites from Markdown
status: live
year: '2026'
stack: 'Node, Express, Markdown'
image: '/images/projects/umejs.webp'
demo: 'https://ume.dantenl.com'
repo: 'https://github.com/dante-nl/umejs'
---

## Why was it made?

A combination of three things: first, a friend of mine had built an amazing site using [Astro](https://astro.build/) for showcasing his drone photography. I found it a really cool idea that he was able to build a site using just some Markdown files and it became something really great. At the same time, I was also building [sitecite](./sitecite.md) and I needed something to write documentation. And then the final "nail in the coffin", the final trigger that caused me to make it, was a really interesting [video made by Core Dumped](https://www.youtube.com/watch?v=XJC5WB2Bwrc) that showcased why and how some projects use multiple coding languages. But the thing I found most interesting was the general flow of a compiler. By combining all of this, I finally came up with the idea on not only _what_ I was going to make, but also _how_ I wanted to make it work.

## How it works

umejs was originally titled "Untitled Markdown Engine". It technically still is, but I rarely use this name. I don't even think the name fully describes what umejs is; the Markdown parsing is actually done using [marked](https://www.npmjs.com/package/marked).

What umejs does is even more intersting: it basically acts like a lightweight compiler. So, how does it work? I think the best way to explain this is by following how a typical user would run their project.

First, a user creates a small template or installs a theme. A template is just a small HTML file that has `\{_BODY}` placed somewhere within it. That's a small variable that umejs replaces with the HTML generated from Markdown. This is the basics of any umejs project. **If the Markdown is a person, then the template is the clothing.**

A simple umejs project might have a file structure like this:

```
.
├── blog
│   └── hello.md
├── index.js
├── package-lock.json
├── package.json
└── template
    └── layout.ume.html
```

From a file structure like this, umejs can easily be fired up. I'm not going to go too much into detail on how to set it up as this is not meant to be a tutorial; for full details I'd recommend reading the [umejs quickstart guide](https://ume.dantenl.com/v1/quick-start). But it basically involves mounting umejs as an Express middleware and then just starting the server. In this case, an ume config might look something like this:

```js
ume({
    contentDir: path.join(__dirname, 'blog'),
    templatePath: path.join(__dirname, 'template', 'layout.ume.html'),
});
```

When a user starts up the server, umejs begins its lifecylce. It starts by splitting your helpers into two categories: cached and non-cached helpers. Helpers are basically `{variables}` that are defined from the umejs config or by themes. They run a JS function and replace the helper with its output. The cached helpers are run on startup, while the others are run on page load and those need to be postponed a bit.

Next, it loads the cache and spins up multiple workers to spread the work of building pages across multiple CPU cores (if enabled). It reads all files in the content directory, passes the Markdown to the parsers to generate HTML, injects the cached helpers and stores the result in memory.

If development mode is enabled, it starts up a file watcher to automaticlly reuild pages when changes are detected. Once everything is built, the server is ready.

Even after the initial build, imejs still does tasks on request. Mainly helpers (as addressed earlier) and builders, functions that get HTML parsed and are requested to return HTML back. That HTML is what the user finally gets. After builders are done, the page finally gets served to the user, and it does it pretty quickly at that. Because all files are stored in memory, they can be served pretty quickly.

## What I've built

I built quite a few things. I've made various tests, some GitHub workflows to automatically run said tests as well as automatically publish (pre-)releases. The main stack is all me, though it wouldn't be possible without the incredibly open source ecosystem. It relies heavily on [marked](https://www.npmjs.com/package/marked), [markdown-frontmatter-parser](https://www.npmjs.com/package/markdown-frontmatter-parser) and [workerpool](https://www.npmjs.com/package/workerpool), alongside various development tools.

## Anything I'd do differently?

I'd definitely write it in TypeScript instead of as CommonJS. CommonJS is great for general projects (though I'd use ESM these days), but I would definitely prefer to have more type safety and integrated in a better way, that's also more easily transferrable to projects that rely on umejs, be it personal projects or themes. I currently do have types but they are a bit bolted on and utilise JSDoc strings. The usage of TypeScript would make the project more robust. On the long term roadmap, I do have the idea of converting this project into TS.
