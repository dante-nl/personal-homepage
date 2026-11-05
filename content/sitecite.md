---
title: sitecite
summary: A self-hostable browser extension that shortens links and turns quotations into shareable images with extensive customisation options.
status: live
year: '2026'
stack: 'Web Extensions, Node, Express'
image: '/images/projects/sitecite.webp'
demo: 'https://sitecite.dantenl.com'
repo: 'https://github.com/sitecite/'
---

## Why was it made?

The origins are quite simple. They lie with [Arc Browser](<https://en.wikipedia.org/wiki/Arc_(web_browser)>) which had an amazing feature that I used all the time. Unfortunately, Arc has been sunsetted and before that they stopped providing feature updates. Because of that, I switched to [Zen Browser](https://zen-browser.app/), a Firefox-based browser which has a lot of the same features as Arc. Except for one: the ability to copy links to a selection with a really nice preview on platforms such as Discord.

![A Discord message showing a link to sitecite with an image appended to it showing a quote](/images/projects/sitecite/discord-example.png)

One of my core values is open source software, which could easily be done by making it an extension and server side code. This in turn easily allows someone to self-host the server side part of the code; which then has the benefit of allowing custom domains.

## How it works

sitecite is not that complicated. It consists of two main flows: the account flow, which is the signing and creating an account and then there's actual quoting part. I'll start with the main core of the project: sharing links.

### Quotations

The creating of quotations is really easy:

**1. User selects text and activates the extension**

_(The extension can be activated either with a keybind or from the right click menu)_

**2. The extension sends this to the server**

**3. The server stores the link in a database and attaches a random string to it**

To prevent duplicates, I've made a really simple system to check this. If a duplicate is found, it generates a random eight character long code instead. Here's a snippet from [`/api/shorten.js`](https://github.com/sitecite/server/blob/main/api/shorten.js) which is responsible for the shortening of links.

```js
let randomString = randomAlphanumeric(5).toLowerCase();

const stringSearch = /*...MySQL query for the just created randomString */

if (stringSearch.length) {
    // somehow we created a duplicate!
    logger.warn("Duplicate key generated. It's your lucky day if you ever see this appear!");
    randomString = randomAlphanumeric(8).toLowerCase();
}
```

The code generator currently puts everything in lowercase and all links are handled case-agnostically. But I've left in the possibility for differentiating upper- and lowercase letters should it be needed at some point.

**4. The link is sent back to the extension and copied to the clipboard**

The links don't contain any formatting information. Instead, when the shortened link is fetched, it gives the most up-to-date formatting available. Meaning, if you copy a link and then change your background colour, the latest background colour is reflected!

#### When the link is shared

By utilising Open Graph, I can include a lot of metadata on the link itself. Open Graph is a standard on sharing some information about a link; it may be used to give a small hint on where an article is about for example, and you've probably seen it before. Apps like Discord, iMessage, Twitter/X (sort of...) and many more read a bit of HTML from a page to automatically determine how to make the link look most enticing. sitecite uses this as well. Here's the OpenGraph that is generated with the fish and chips example from earlier:

```html
<meta property="og:title" content="en.wikipedia.org quote" />
<meta property="og:site_name" content="sitecite" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://sitecite.dantenl.com/l/ia9gw" />
<meta property="og:image" content="https://sitecite.dantenl.com/api/image/ia9gw" />
<meta property="og:image:type" content="image/png" />
<meta
    property="og:image:alt"
    content="Quoted text: Fish and chips is a hot dish consisting of battered and fried fish"
/>

<meta name="theme-color" content="#ff8383" />
```

This is placed in the `<head>` of the page. That gets scraped by bots. The most important things are the title and the image. Those two are what make sitecite possible.

### Accounts

For authentication, I decided on using a token-based system. Why? I'm familiar with how Discord handles things. Bots (small automated programs) are powered using a token, a long string of characters which is basically the password to the bot account. If you've got the bot token, you can do whatever you want with the bot.

This is how I set up user accounts. The tokens come in two flavours and both have different permissions:

- web tokens:

These are used on the website and can be used to delete generated links and to set a new background colour.

- extension tokens

These are the ones that can actually shorten links and generate images.

Both of these tokens are different and their permissions don't really overlap, except when it comes to fetching styles. A web token can not generate a URL and an extension token can not change the background colour.

To get started with the extension, users need to set up an account. There are three options but not all of them may be available, depending on the host.

- Sign in with Discord
- Sign in with Google
- Sign in with username & password

Some hosts may not want to set up OAuth2 for Google or Discord because it requires effort, especially with Google. Other hosts may prefer to disable username & password because it is the least secure of them all.
However, it is possible to make them all a little extra secure using allowlists. This will only allow a group of selected individuals to sign in on the host.

Once a user is signed in, they can generate a token for the extension, as well as customise sitecite. The changes are reflected on the webpage.

The user only needs to fill in the token inside the extension (as well as enter their host if it's self-hosted) and then they're ready.

## What I've built

I designed and built the full stack, from begining to end. However, there are quite a few things I have not built. Notable things include the Docker version, which is maintained by my dear friend Andrew, fonts and various libraries. Notably the node-canvas library which is used to generate all images. I also contact the abuse.ch API on the main host to (hopefully) prevent abuse. For a full list, you should read [the credits](https://sitecite.dantenl.com/credits)

## Anything I'd do differently?

Quite a few things to be honest. Looking back at the project now, the thing that annoys me most is the file structure. It's genuinely a mess and in projects after that I have started to improve. Also, I think there are a lot of improvements that can be done in terms of security. In terms of functionality, I'd make the UI a bit nicer, though I'm unsure what it would be. Its simplicity has its charms I guess!
