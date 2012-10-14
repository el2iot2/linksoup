#linksoup

With a name inspired by the arcane art of [tag soup parsing](http://en.wikipedia.org/wiki/Tag_soup), *linksoup* seeks to handle links embedded into text in a robust and safe way.

When given a string:

```javascript
var text = "Visit [my site](http://automatonic.net \"automanual\") (or http://twitter.com/automatonically)";
```
    
*linksoup* returns structured data as "spans":

```javascript
var spans = [{
  text: "Visit "
},{
  text: "my site",
  title: "automanual",
  href: "http://automatonic.net"
},{
  text: " (or "
},{
  href: "http://twitter.com/automatonically"
},{
  text: ")"
}];
```

that allows you to represent the "link soup" in a templating system (with appropriate escaping) and rendering to HTML.

##Status

This project is in an "alpha" status, and not yet suitable for casual use.

###To Do

 * Port twitter-text 
   * ~~make routines lint friend(lier)~~
   * ~~remove unused/irrelevant routines~~
   * ~~adapt url test cases~~
 * ~~Support markdown style links~~
 * Ensure multi-use code
   * browser wrapper
   * node.js
 * Create simple demo/docs

##Getting Started

###Node.js

Install the module with: `npm install linksoup`

```javascript
var linksoup = require('linksoup');
var text = "...";
var spans = linksoup.parseSpans(text);
```

###Browser / Client side

_(Coming soon)_

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/gruntjs/grunt).

### Building
*linksoup* uses grunt.js...

### Tests

Tests are defined as [Jasmine specs](http://pivotal.github.com/jasmine/) and launched via `jasmine-node`. Like the code itself, some test cases are adapted from the `twitter-text` project.

####Initial setup:

The Jasmine harness for node is installed globally (to facilitate command-line execution):

    npm install jasmine-node -g

####Running tests:

From the root project directory (along side `grunt.js`), run:

    jasmine-node spec

## Release History
_(Nothing yet)_

##Acknowledgments

 * [twitter-text](https://github.com/twitter/twitter-text-js)
 * [jasmine](https://github.com/pivotal/jasmine)
 * [jasmine-node](https://github.com/mhevery/jasmine-node)

## License
Copyright (c) 2012 Elliott B. Edwards  
Licensed under the [MIT license](https://github.com/automatonic/linksoup/blob/master/LICENSE-MIT).
