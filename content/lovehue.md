---
title: LoveHue
summary: Small Python utility which allows controlling Philips Hue lights directly from the terminal
status: archived
year: '2022'
stack: 'Python'
image: '/images/projects/lovehue.webp'
demo: ''
repo: 'https://github.com/dante-nl/LoveHue'
---

## Why it was made

LoveHue was built out of curiosity. I knew that the smart lights my father had installed were, well, smart. And that they could do things like fancy colours and stuff like that. But I was very curious on what I could actually do with them. That eventually resulted in LoveHue, a small tool to interact with the Philips Hue lights built with Python.

## How it works

LoveHue uses a Python module named [huesdk](https://pypi.org/project/huesdk/), which allows for easily interacting with Philips Hue. This was the basis for making the project. Most features implemented here are visualisations of the functions that huesdk provided and presenting them in an accessible manner. Apart from one, which is animations, a way to dynamically change the lighting colours and brightness.

Animations are built from a JSON file with a custom file extension: `.lhad`, LoveHue Animation Dictionary. I chose to use a different file extension to easily differentiate them from other JSON files that were unrelated to LoveHue. Here's an example of what such a file would look like:

```json
{
    "name": "Traffic Light",
    "colors": [
        {
            "color": "#FF0000",
            "brightness": 75,
            "time_until_next": 5
        },
        {
            "color": "#00FF00",
            "brightness": 100,
            "time_until_next": 8
        },
        {
            "color": "#FFFF00",
            "brightness": 50,
            "time_until_next": 3
        }
    ]
}
```

The keen eye might have spotted the fact I chose hex colours to change the lighting, even though this is not the best format for lamps. I chose to use hex colours because of my familiarity with them from my experiences developing websites and because I could live with the imperfections. For most colours, they translate quite nicely to lamps.

LoveHue reads the directory for the `.lhad` files and adds any it can find to a list for the user to choose from. LoveHue reads the `colors` array from top to bottom and therefore sets the lamps first to red, with a brightness of 75%. After waiting five seconds, it sets the lamps to green with 100% brightness and after eight more seconds it sets the colour to yellow with only 50% brightness. Once it finishes this animation, it checks how many more times it should be repeated according to the user and does it that many times again.

The animations are in my opinion the most interesting feature of this project, as it allows for deeper integration and had potential for starting an ecosystem.

## What I built

I built this project on top of the amazing `huesdk` package as the basis and later libraries like `pillow` and `pyautogui` to allow for automatically setting the lamps to match the content of the screen. This worked by getting the most common colour on the screen every second or so (I once broke the lighting in our house by overloading the Hue Bridge with requests from having too short of a delay... luckily that sorted itself out soon after disabling the script.) and then setting the lights to said colour. Dark colours would be accomodated for by simply turning off the lights.

## What I'd do differently

Apart from general organisational skills that I've learned since then (e.g. properly using Git, splitting things off into multiple files), I would probably improve the sturdiness. For example, I'd start using venv to manage the versions of the package and try to build the project to survive more than a couple demos. When I built it, it worked great, but it was a bit more difficult to get it working years later.
