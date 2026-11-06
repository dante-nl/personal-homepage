---
title: Custime
summary: Fully customisable clockface
status: published
year: '2022-2023'
stack: 'JavaScript, HTML, CSS'
image: '/images/projects/custime.webp'
demo: 'https://custi.me'
repo: 'https://github.com/dante-nl/Custime/'
---

## Why I made it

This is the original text from my note containing a list of ideas. It's actually the first one in there.

> A website similar to Android 12 where you can customize things like background, palette and widgets. The main purpose would be to show the time and maybe the weather and some other features.

The Material You design language was announced in 2021 at Google I/O. Material You was in my opinion a very clean looking UI that allowed for a lot of customisation. Granted, I haven't used it myself, but it looked really nice.

I was inspired by this and wanted to make my own adaptive UI product. Originally starting with just a small preset of colours and fonts, it gradually grew bigger thanks to lots of feedback from a classmate and dear friend. Updates allowed for more colours and an advanced editor, featuring gradient backgrounds, image backgrounds and more font options.

## How it works

The core of Custime is quite straightforward. It stores data in the localStorage on the browser, allowing you to easily load it back again when on a next page visit. This wasn't something I had done before back then, so I was particularly proud of that.

All cusotmisation options are accessible directly on the clock itself, without any menus:

- **Click the time** to change the font
- **Click the text below the time** to switch between displaying world times and the date
- **Click the coloured circles** at the bottom to switch between a 24-hour and a 12-hour clock.
- **Use the settings panel** to open the advanced editor, disable localStorage overrides or clear your stored data.

For custom Custimes, the app reads the configuration directly via URL parameters. From there, a lot of customisation is possible. You can use any font from Google Fonts, any hex colour for the background, and any hex colour for the text. The background also supports gradients (rotated by an arbitrary amount) and images from any URL you want.

To make this easier, I built an [advanced editor](https://custi.me/advanced) as well as a more intuitive [Custime generator](https://generator.custi.me/).

![A webpage showing two toggle optoins for a gradient background and an image background. Gradient background is enabled. The main content shows various options for a background gradient, a text colour and a dropdown menu for a font. On the bottom is a button with the text "open in Custime".](/images/projects/custime/custime-generator.png)

[Here's what that custime looks like](http://custi.me?time=24&date=t&bgcolor=81decb,81b5de,123&textcolor=f9faf9&customfont=Atkinson%20Hyperlegible%20Mono)

## What I've built

I built this entirely from scratch, back before AI code assistants became standard. Everything was handwritten. It was around the time ChatGPT launched, but it was not really usable yet and I don't think I used it in any part of the process. Coding back then was honestly a lot more fun, but also a lot more difficult.

## Anything I'd do differently?

The core idea and logic hold up well, but my approach to maintainability has evolved significantly since then. If I were to rebuild it today, I would extract the hardcoded colours in the CSS into CSS variables to make theming easier. I'd also organise the file structure better and actually use Git for version control.

Despite its age, Custime was a stepping stone. The design philosophy for customisability later influenced how I designed the sharing system for [sitecite](/projects/sitecite).
