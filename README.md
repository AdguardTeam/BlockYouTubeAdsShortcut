# Block YouTube Ads in Safari on iPhone/iPad

This repository contains code for the shortcut that we use to block YouTube ads on iPhone/iPad.

The problem is that Safari Content Blocking capabilities is [not enough](https://adguard.com/en/blog/youtube-ads-in-safari-explained.html) to handle YouTube ads anymore. Our last resort is using iOS Shortcuts which require some additional manual actions.

![](https://cdn.adguard.com/public/Adguard/Blog/safari-problems/shortcut-in-safari-en.jpeg)

## How to use this

1. [Get the shortcut](https://agrd.io/ios_youtube_shortcut). In order to install it, you need to [allow untrusted shortcuts](https://www.macworld.com/article/233447/how-to-allow-untrusted-shortcuts-in-ios-13.html) first.
2. Open YouTube in Safari (it's important, it will only work in Safari)
3. Click the "Share button"
4. Choose "Block YouTube Ads (by AdGuard)" from the list of actions
5. You probably want to make this action "Favourite". Tap "Edit actions..." and then the "Plus" icon to do that.
6. Done! Now YouTube is ad free.

Please note, that every time you refresh the page, you need to run this shortcut again.

## Remote version

With the standard version of the shortcut, you need to reinstall it to get the latest changes we make in this repo. If you are tired of doing that, there's also a "remote" version of the shortcut. It downloads the latest version of the code from this repo everytime it is launched.

[Get the remote version](https://agrd.io/ios_youtube_shortcut_remote).

## Development
To build scripts from source you need yarn

First install dependencies
```
yarn install
```

After that you can build
```
yarn build
```

Result of the build should appear in the `dist` directory
