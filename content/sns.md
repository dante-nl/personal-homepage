---
title: SNS
summary: An Express-backed notification relay for iOS Shortcuts.
status: published
year: '2024'
stack: 'Node, Express, Shortcuts'
image: '/images/projects/sns.webp'
demo: 'https://routinehub.co/shortcut/17927/'
repo: ''
---

## Why I made it

SNS was my first project I built with Node.js. I wanted to test the limits of what I could do with Node.js and Express but also what possibilities that gave me within Siri Shortcuts.

Siri Shortcuts, or just Shortcuts, is an app made by Apple that works on macOS, iOS, iPadOS and watchOS. It basically allows you to "code" by dragging blocks around and it executes it from top to bottom. I started working with them with the release of one of the first betas for iPadOS 13 back in the Summer of 2019.

![A screenshot of the Shortcuts app on macOS with various actions; one asking for input asking the user's name and an if statement. If the name is equals to "Dante", it shows an alert with "Hey, that's my name". Else, it says "Nice to meet you"](/images/projects/sns/shortcuts-example.png)

I've spent a lot of time within this app thinking of various shortcuts. My [RoutineHub profile](https://routinehub.co/user/dante_nl) shows that I have accumulated **nearly 37,000 downloads** over the years, doing various projects, such as an updater and a shortcut for managing your clipboard.

Never in that time was I able to make a Shortcut that would contact my own API. Therefore, when I finally had the ability to do so, I was very curious to see what was possible.

## How it works

The Shortcut has two main features: channels and direct messages. Channels are basically mailing lists. Within the Shortcut, it authenticates you and allows you to open the ["store"](https://sns.dantenl.com/store.html) which allows you to subscribe to these mailing lists. From a channel, you can reach multiple people at once and send them notifications. This can be automated or sent from the SNS shortcut, which is great for announcements.

I've also added something that allows automations to directly message users. Every user has a unique ID that can be fetched using another shortcut, Sign in with ∞, which stores this ID and can pass it to another Shortcut. However, if you have this ID, it can also be used in direct requests via the API. Here is an example on contacting the API using Python:

```python
import requests

r = requests.post(f"https://sns.dantenl.com/send-notif", json={
    "token": "<insert token>",
    "title": "Hello world!",
    "description": "This was sent from Python!"
})

if r.ok:
    print("Notification sent!")
else:
    print("Something went wrong!")
```

## What I made

I made the full stack, from managing accounts to creating channels and sending notifications. The only packages I really used were Express and express-rate-limit.

## Anything I'd do differently?

Honestly, I'd do pretty much everything differently. I've kept the source code closed because it's from my early learning phase with Node.js. For example, I used a JSON file instead of a real database, and the auth flow has some shortcuts (pun intended). If I were to open-source it today, I'd need to rewrite the backend entirely. I'd try and figure out some way to encrypt and store data with Shortcuts, use a proper MySQL database and generally try and improve my code.
