# Synopsis

This package is a wrapper around the [Scatter](https://github.com/mariocasciaro/scatter) IoC container,
providing essential services (config and log) and boilerplate to get up and running in no time with Scatter and the
Particles platform.

[![NPM](https://nodei.co/npm/particles.png?downloads=true)](https://nodei.co/npm/particles/)

# What is the "Particles" platform

Particles aims to be a platform made of Scatter components (called particles) created to **work well together**.
The idea is to have a set of components anyone can easily combine to create complete Node.js applications, from the
web server, to the browser, from the db to client side javascript.
Those components are glued together using the Scatter IoC container, at the core of `particles`, and thanks
to dependency injection they can be extended, replaced or overridden by simply reorganizing their dependencies.

Using a Particles component is most of the time a drop-in experience, or better as easy as adding a new dependency into
the `package.json`. No manual initialization, no passing of dependencies/services using code, no `require`s.

A Particles component reuses the configuration of its parent application, so it can be shared across all the components
and can be kept separated from code.


# Basic usage

Create a file called `app.js` (or whatever you like) and include the code below:

```javascript
require('particles').run();
```

That's it, now a new Scatter container is created, configured and the entry point (by default the Scatter service `app_start`)
will be invoked.

Attach any particles to your module to start composing your application.

Basic services like `config` and `log` are provided by default to all the particles attached to your application.

