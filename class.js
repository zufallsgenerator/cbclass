/*

The MIT License (MIT)

Copyright (c) 2013 Christer Byström

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---

### A class libary with support for typed properties. Bind it to any prefix you want

In your HTML file, include class.js

...
<script type="text/javascript" src="class.js"></script>
<script type="text/javascript>
  initClassLibraryWithPrefix("MyPrefix");  // Do once
</script>

<!-- Load the rest of your javascript files -->

To disable type checking, add true as the second parameter after your prefix.

Example usage:

    MyPrefix.Class("TestSprite", {
      image: null,   // Normal property
      "x:number": 0, // Type-checked property
      "y:number": 0,
    
      initialize: function() {
        console.log("Image name is: " + this.image);
        console.log("Pos is: (" + this.x + ", " + this.y + ")");
      },
      // ... more code
    });
    
    // Instantiate your class
    
    var sprite = new MyPrefix.TestSprite({
      x: 200,
      y: 300,
      image: "bunny.png"
    });

All properties in the dict passed to the constructor are copied to the
prototype of the new object.

To add static objects to your class, use

    MyPrefix.Class("Math", {}).addStatic({
      square: function(value) {
        return value * value;
      }
    });
    
    MyPrefix.Math.square(4); // 16

*/

/*jshint strict: true */
/*global window */
function initClassLibraryWithPrefix(prefix, disableTypeChecking) {
  'use strict';
  var scope = {};
  window[prefix] = scope;
  var USE_TYPING = Object.defineProperty && !disableTypeChecking ? true : false;
  
  function typedProp(obj, key, type) {
    Object.defineProperty(obj, key, {
      set: function(val) {
        if (typeof val !== type || (type === "number" && isNaN(val))) {
          throw "Property '" + key + "' should be of type '" + type + "', value is: '" + val + "' of type '" + typeof val + "'";
        }
        this["__" + key] = val;
      },
      get: function() {
        return this["__" + key];
      }
    });
  }
  
  /**
  * Function for creating a class
  *
  * @param {String} name
  *   name of the class
  *
  * @param {Object} members
  *    methods, constants and class variables
  *
  * @return {Function}
  *    The instantiated class
  */
  scope.Class = function(name, members) {
    var klass, key, split, propName, type;
    scope[name] = function(params) {
      var key, cls;
      cls = scope[name];
      if (params) {
        for(key in params) {
          if (params.hasOwnProperty(key)) {
            this[key] = params[key];
          }
        }
      }

      cls.__instanceCount__++;
      this._id = "" + name + "_" + cls.__instanceCount__;
      if (this.initialize) {
        this.initialize.apply(this,  arguments);
      }
    };
    klass = scope[name];

    // Copy member objects
    for (key in members) {
      if (members.hasOwnProperty(key)) {
        if (key.indexOf(":") > -1) {
          split = key.split(":");
          propName = split[0];
          type = split[1];
          if (USE_TYPING) {
            typedProp(klass.prototype, propName, type);
          }
          klass.prototype[propName] = members[key];
        } else {
          klass.prototype[key] = members[key];
        }
      }
    }
    
    // Extra functions on prototype
    klass.__instanceCount__ = 0;
    klass.prototype.className = name;

    klass.prototype.getId = klass.prototype.getInstanceId = function() {
      return this._id;
    };

    klass.prototype.toString = function() {
      return String("<" + prefix + "." + this._id + " instance>");
    };

    // Method for adding class methods/variables
    klass.addStatic = function(members) {
      for (var key in members) {
        if (members.hasOwnProperty(key)) {
          klass[key] = members[key];
        }
      }
      return klass;
    };
    return klass;
  };

  scope.namespace = function(namespace) {
    var parts = namespace.split("."), part, i, currentNode = scope;
    for(i=0;i<parts.length;i++) {
      part = parts[i];
      if (currentNode[part] === undefined) {
        currentNode[part] = {};
      }
      currentNode = currentNode[part];
    }
  };
}
