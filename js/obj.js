"use strict";

var viewX = 0, viewY = 0;

// game object class
function Obj(imgPath, x, y, velX, velY, rot) {
  this.x = x;
  this.y = y;
  this.velX = velX;
  this.velY = velY;
  this.dilatedVelX = velX;
  this.dilatedVelY = velY;
  this.rot = rot;
  this.div = document.createElement("div"); // use div instead of img so image is not selectable
  this.div.style.position = "fixed";
  this.div.style.display = "none";
  this.setImage(imgPath);
  document.body.appendChild(this.div);
}

Obj.prototype.setImage = function(imgPath) {
  if (imgPath != this.imgPath) {
    this.imgPath = imgPath;
    this.div.style.backgroundImage = "url('" + imgPath + "')";
    this.div.style.width = imgProp[imgPath].width + "px";
    this.div.style.height = imgProp[imgPath].height + "px";
  }
}

Obj.prototype.draw = function() {
  if (this.x - imgProp[this.imgPath].baseX + imgProp[this.imgPath].width > viewX && this.x - imgProp[this.imgPath].baseX < viewX + getWindowWidth()
      && this.y - imgProp[this.imgPath].baseY + imgProp[this.imgPath].height > viewY && this.y - imgProp[this.imgPath].baseY < viewY + getWindowHeight()) {
    this.div.style.left = (this.x - imgProp[this.imgPath].baseX - viewX) + "px";
    this.div.style.top = (this.y - imgProp[this.imgPath].baseY - viewY) + "px";
    this.div.style.transform = "rotate(" + (Math.PI / 2 - this.rot) + "rad)";
    //this.div.style.zIndex = Math.floor(this.y);
    this.div.style.display = "";
  }
  else {
    this.div.style.display = "none";
  }
}

Obj.prototype.remove = function() {
  document.body.removeChild(this.div);
}

function objDist(obj1, obj2) {
  return Math.sqrt(objDistSq(obj1, obj2));
}

function objDistSq(obj1, obj2) {
  return (obj2.x - obj1.x) * (obj2.x - obj1.x) + (obj2.y - obj1.y) * (obj2.y - obj1.y);
}

// sound class (loads ogg or mp3 file depending on browser support)
// html5 audio described at http://html5doctor.com/html5-audio-the-state-of-play
function Sound(path, nCopies) {
  this.next = 0;
  this.snds = [];
  if (window.Audio) {
    for (var i = 0; i < nCopies; i++) {
      this.snds[i] = new Audio();
      if (this.snds[i].canPlayType && this.snds[i].canPlayType("audio/ogg") != "") {
        this.snds[i].src = path + ".ogg";
      }
      else if (this.snds[i].canPlayType && this.snds[i].canPlayType("audio/mpeg") != "") {
        this.snds[i].src = path + ".mp3";
      }
    }
  }
}

Sound.prototype.play = function() {
  if (this.snds[this.next] && this.snds[this.next].currentSrc) {
    this.snds[this.next].play();
    this.next = (this.next + 1) % this.snds.length;
  }
}
