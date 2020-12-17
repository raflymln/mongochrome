![Mongochrome](https://i.ibb.co/5Gd7rpX/Untitled-design-2-removebg-preview.png)

# Mongochrome
Mongochrome is a simple and fast MongoDB wrapper that **cached it's data**, so that you don't need to always fetch it from the server! Also this package is super **beginner friendly**.

**[Notice]** This package is inspired from Quickmongo package, so that you'll find it's similar in some way.

**[IMPORTANT]** Since this package is new, some features may be bugging, feel free to ask me if you have any question or if you found any bug!

## Links
1. Documentation: [mongochrome.my.id](https://mongochrome.my.id/)
2. Discord Support Server: [discord.gg/7z4CwpMF4w](https://discord.gg/7z4CwpMF4w)
3. NPM PACKAGE: [npmjs.com/package/mongochrome](https://www.npmjs.com/package/mongochrome)
3. Github: [github.com/raflymln/mongochrome](https://github.com/raflymln/mongochrome)
4. Bug Report: [github.com/raflymln/mongochrome/issues](https://github.com/raflymln/mongochrome/issues)

## Contribution
If you have any contributions, feel free to do a pull request against the *master* branch on Mongochrome github pages! I'll try to read on every pull request and accept it if it's good enough.

## Features
1. Asynchronous
2. Cached its Data
3. Beginner Friendly
4. Somewhat similar to *Quickmongo* / *Quick.db*
5. Easy to use

## Installation
[**📥 NPM PACKAGE**](https://www.npmjs.com/package/mongochrome)
```
npm install mongochrome
```

## Usage Example
```js
const Mongochrome = require('mongochrome');
const db = Mongochrome.Connect(url, connectOptions, options);

//This Function is Calling Database Class by Default
db(collectionName); 

// Setting Up a Single Object
db("character").set("user1", { stamina: {...} })

// Setting Up an Object in Object Value
db("character").set("user1.level", "5")

// Automatically create an array if data doesn't available before
db("character").push("list", ["char1", "char2"])

// You can also push directly into an Object
db("character").push("user1.items", ["sword", "banana"])

// Getting Full Data
db("items").get("sword")

// Getting an Object on Data
db("items").get("sword.level")

// Get All Collection Data
db("users").data
```