# Onclick-event-protection
The most advanced techniques to protect onclick event

![https://murka007.github.io/onclick-event-protection/](https://i.imgur.com/2Iku7FA.png)

### What is it for?
Detecting modified prototypes is useful when you don't want third party scripts from changing content on your web page - including anti cheats for browser games.

### Try it out
Even though the most advanced techniques are used here, it is still possible to bypass this protection.

You can try to write your own hooks, so it will pass all checks when you call `document.getElementById("btn").click();`

Look at preview: https://murka007.github.io/onclick-event-protection/

### More about
- it has Chrome and FireFox support
- Object, Event and PointerEvent checks are not included
  - Only prototypes that are related to the onclick event
