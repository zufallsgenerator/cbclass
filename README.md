CBClass
=======

A class libary with support for typed properties. Bind it to any prefix you want. MIT Licensed.

In your HTML file, include class.js

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
        return square * square;
      }
    });
    
    MyPrefix.Math.square(4); // 16
