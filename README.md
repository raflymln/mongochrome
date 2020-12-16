# Mongochrome
Mongochrome is a simple and fast MongoDB wrapper that **cached it's data**, so that you don't need to always fetch it from the server! Also this package is super **beginner friendly**.

**[Notice]** This package is inspired from Quickmongo package, so that you'll find it's similar in some way.

## Features
1. Asynchronous
2. Cached its Data
3. Beginner Friendly
4. Somewhat similar to *Quickmongo* / *Quick.db*
5. Easy to use

## Usage Example
```js
const Mongochrome = require('mongoose');
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