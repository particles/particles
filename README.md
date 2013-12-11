![Particles logo](https://raw.github.com/particles/particles/master/img/particles_logo_140.png)

# The Particles platform

Particles is a set of Node.js components (specifically [Scatter](https://github.com/mariocasciaro/scatter) particles) 
created to **work well together**. Particles is a *platform*, not a framework, 
it does not want to impose the use of any library or technology, instead, it wants to package ready-to-use solutions in 
the form of [Scatter](https://github.com/mariocasciaro/scatter) particles.
The idea is to have a set of components anyone can easily combine to create complete Node.js applications.

[![NPM](https://nodei.co/npm/particles.png?downloads=true)](https://nodei.co/npm/particles/)


# Basic usage

Create a file called `app.js` (or whatever you like) and include the code below:

```javascript
require('particles').run();
```

That's it, now a new Scatter container is created, configured and the entry point (by default the Scatter service `app_start`)
will be invoked.

Attach any particles to your module to start composing your application.

Basic services like `config` and `log` are provided by default to all the particles attached to your application.

## Credits

* [Mario Casciaro](https://github.com/mariocasciaro) - Twitter [@mariocasciaro](https://twitter.com/mariocasciaro) - Creator/Maintainer
* Zbigniew Mrowinski - Particles logo
* your name here

Feedback & Social

Follow [@particlesjs](https://twitter.com/particlesjs) on Twitter for updates.

Also there is a Google group you can use to ask questions and discuss about Particles. 
Visit the Hadron [Particles Google group](http://groups.google.com/d/forum/particlesjs).

---


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/particles/particles/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

