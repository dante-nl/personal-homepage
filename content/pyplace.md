---
title: PyPlace
summary: A simple Python programme which allows downloading and running Python files through a simple UI.
status: archived
year: '2022-2025'
stack: 'Python'
image: '/images/projects/pyplace.webp'
demo: ''
repo: 'https://github.com/dante-nl/pyplace'
---

## Why I made it

Back when I started working on it in 2022, I was very active with Siri Shortcuts, an app by Apple for iOS, iPadOS, macOS and watchOS designed to code little programmes by dragging and dropping actions. At the same time, I was also making various little Python programmes as I found it a fun language. I wanted to combine the accessibility of coding with Shortcuts with a proper coding language that I enjoyed writing in.

And writing I did, as I ended up building an entire ecosystem behind PyPlace. I've built features as **multi language support**, a **simple-to-use store** with a **built-in updater** as well as a system of **distributing beta versions**, directly from within the app. It was an incredibly fun project to work on, and it taught me the fundamentals of managing a larger application.

## How it was built

The general flow is very simple. The user starts up the program, it checks for updates and then it shows the main menu. This has been copied from the general flow of how shortcuts are built up. From the main menu, users can choose to open an app, add new ones, check for updates of apps and open the settings menu.

If the user chooses option 1 to open an app, it reads a JSON file containing data on what apps you've got installed. Here's a small snippet:

```json
{
    "apps": {
        "LoveHue - Control Hue lights in Python": {
            "name": "LoveHue - Control Hue lights in Python",
            "file_name": "LoveHue.py",
            "author": "dante_nl",
            "StoreApp": "true",
            "version": 1.3
        }
    }
}
```

PyPlace reads this file and then adds it to the list of programmes on the menu. From there, it can be easily executed by simply pressing the number of the corresponding menu item. _(Looking back now, arbitrary code execution given to files downloaded from the internet without a sandbox was a major security risk, something I realise all too well now...)_

Adding a file was also quite straightforward. It simply asked you where the file is located; either in your PyPlace directory, on the store, in the "experiments browser" (a staging area where I tested new features in the form of small apps before integrating them in PyPlace) or somewhere on the internet.

The store and experiments browser both fetched a JSON dictionary from a Netlify instance that is built from the GitHub repository. This Netlify build was automatically generated via a GitHub repository. It acted as an early CI/CD pipeline, allowing users to download apps directly and receive automatic updates.

A user can also download an app from the internet by entering a URL to a Python file and PyPlace fetches it and adds it for the user. In hindsight, once again not a terrific idea because of security concerns.

Finally, software from the system could also be added. That would just add it to the JSON file containing a list of apps installed.

## What I built

All code has been hand-written/ The only external Python package used is `requests`. One of my main philosophies was trying to do as much as I could without requiring extra dependencies. The web side of things has been built with Netlify, as I wasn't able to set up my own webserver back then. I also never bothered to migrate it over, after all, if it ain't broke...

## What I'd do differently

Quite a lot. This project has been great in improving my coding abilities with Python, but looking back at it now, it shows that I didn't know how to manage a project. The code, while it isn't solid, shows the basics and it has some nice thoughts. But I didn't know about venv, proper file structuring or much about security. While the architecture was ambitious, I built this before I understood sandboxing, which is a major reason the project is now archived. I do know a ton more about these sorts of things compared to when I was 14.
