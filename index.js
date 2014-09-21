/* jshint node: true */

var Filter = require('broccoli-filter');
var coffeeScript = require('coffee-script')
var CoffeeLint = require('CoffeeLint');

module.exports = CoffeeScriptFilter;
CoffeeScriptFilter.prototype = Object.create(Filter.prototype);
CoffeeScriptFilter.prototype.constructor = CoffeeScriptFilter;

function CoffeeScriptFilter (inputTree, options) {
  if (!(this instanceof CoffeeScriptFilter)) {
    return new CoffeeScriptFilter(inputTree, options);
  }
  Filter.call(this, inputTree, options);

  this.options = options || {};
  this.bare = options.bare;
  this.CoffeeLint = CoffeeLint;

  this.coffeelintOptions = options.coffeelintOptions || {};

  this.logger = options.logger || console.log.bind(console);

}

CoffeeScriptFilter.prototype.extensions = ['coffee','litcoffee','coffee.md'];
CoffeeScriptFilter.prototype.targetExtension = 'js';

CoffeeScriptFilter.prototype.processString = function (string, srcFile) {
  var coffeeScriptOptions = {
    bare: this.bare,
    literate: coffeeScript.helpers.isLiterate(srcFile)
  };
  var errors = this.CoffeeLint.lint(string, this.coffeelintOptions, coffeeScriptOptions.literate);

  if (errors && errors.length) {
      this.reportLintErrors(srcFile, errors);
  }

  try {
    return coffeeScript.compile(string, coffeeScriptOptions);
  } catch (err) {
    err.line = err.location && err.location.first_line;
    err.column = err.location && err.location.first_column;
    throw err;
  }
};

CoffeeScriptFilter.prototype.reportLintErrors = function CoffeeScriptFilter_reportLintErrors(relativePath, errors) {
    var self = this;

    for (var i = 0; i < errors.length; i++) {
        var e = errors[i];
        self.logger(relativePath + ':' + e.lineNumber + ': ' + e.message + (e.context? ': ' + e.context : ''));
    }
};