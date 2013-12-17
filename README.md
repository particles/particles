![Particles logo](https://raw.github.com/particles/particles/master/img/particles_logo_140.png)

# The Particles platform

Particles is a Node.js platform built on top of the [Scatter](https://github.com/mariocasciaro/scatter) IoC container. 

The Particles platform is composed by a core, providing basic services (e.g. log, configuration) plus a set of **ready-to-use, drop-in** solutions to create **modular and extensible** Node.js applications. 

Particles components can contain server side code as well as **client side scripts and assets like css, images and templates**!

Particles is not another framework, 
it does not want to impose the use of any particular library or technology, but on the other side it encourage the use of patterns like **Dependency Injection and Service locator** to build your app.

[![NPM](https://nodei.co/npm/particles.png?downloads=true)](https://nodei.co/npm/particles/)

[![Build Status](https://travis-ci.org/particles/particles.png)](https://travis-ci.org/particles/particles)
[![Dependency Status](https://david-dm.org/particles/particles.png)](https://david-dm.org/particles/particles)

## Stability

**1 - Experimental**

Please try it out and provide feedback.

## Basic usage

To create your own Particles-based app, just clone the `particles-seed` project

```
git clone https://github.com/particles/particles-seed.git
```

Install the new project

```
cd particles-seed
npm install
```

Run the app

```
node app
```

What happened? At startup Particles will execute the [Scatter service](https://github.com/mariocasciaro/scatter/wiki/Guide#services) `app_start`. In the file `app/entryPoint.js` you can find an example on how to execute some code at startup. 

Not too exciting for now, but let's start to build our app.

## Adding particles

Let's add a new particle to our app. Particles are drop-in components, it means **you don't need to initialize or require** them in your code in order to activate them. It's the magic of having an IoC container!

Let's add an express server to our application

```
npm install particles-express
```

That's it, yes really, not kidding. No custom executable to run, no code to write, just installing an `npm` package. Now you just  fire up your app again and see what happens

```
node app
```

Try to access [http://localhost:3000/](http://localhost:3000/) to check what your new server have to say.

## Using the services of a particle

Of course our express server is not that useful as it is right? Let's register a new route in our app internal particle. Create a new file `app/controllers/HelloController.js` and drop in this code:

```javascript
var self = module.exports = {
    helloWorld: function(req, res) {
        res.send('200', 'My first controller works!');
    },

    setup: function(express) {
      self.log.info("Initialize my first controller...");
      express.get("/hello", self.helloWorld);
    }
};
module.exports.__module = {
    properties: {
        log: "controllers/log"
    },
    provides: 'setup'
};
```

Restart your server and look at [http://localhost:3000/hello](http://localhost:3000/hello)

A couple of things to notice here:

* The `log` object (a core Particles service) is injected into our module by the IoC container. Almost any module can be injected and **shared across all the particles of your app!**
* To register a new route, a new service was exposed, called `setup`. This service is invoked by `particles-express` to register new routes. Yes, that's right, particles can communicate with each other not only by using DI, but also by invoking services across all the particles of your app.

## Working with assets

...coming soon

## Feedback & Social

Follow [@particlesjs](https://twitter.com/particlesjs) on Twitter for updates.

Also there is a Google group you can use to ask questions and discuss about Particles. 
Visit the Hadron [Particles Google group](http://groups.google.com/d/forum/particlesjs).

## Credits

* [Mario Casciaro](https://github.com/mariocasciaro) - Twitter [@mariocasciaro](https://twitter.com/mariocasciaro) - Creator/Maintainer
* Zbigniew Mrowinski - Particles logo
* your name here

-----


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/particles/particles/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

