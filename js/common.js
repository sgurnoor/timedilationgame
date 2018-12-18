"use strict";

var mouseX = 0, mouseY = 0;

// based on http://quirksmode.org/js/events_properties.html
function getMousePos(e) {
  if (!e) var e = window.event;
  if (e.pageX || e.pageY) {
    mouseX = e.pageX;
    mouseY = e.pageY;
  }
  else if (e.clientX || e.clientY) {
    mouseX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    mouseY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }
}

// based on http://www.howtocreate.co.uk/tutorials/javascript/browserwindow
function getWindowWidth() {
  if (typeof(window.innerWidth) == 'number') {
    // Non-IE
    return window.innerWidth;
  }
  else if (document.documentElement && document.documentElement.clientWidth) {
    // IE 6+ in 'standards compliant mode'
    return document.documentElement.clientWidth;
  }
}

// based on http://www.howtocreate.co.uk/tutorials/javascript/browserwindow
function getWindowHeight() {
  if (typeof(window.innerHeight) == 'number') {
    // Non-IE
    return window.innerHeight;
  }
  else if (document.documentElement && document.documentElement.clientHeight) {
    // IE 6+ in 'standards compliant mode'
    return document.documentElement.clientHeight;
  }
}

// based on http://quirksmode.org/js/events_properties.html
function findKey(e) {
  var code;
  if (!e) var e = window.event;
  if (e.keyCode) code = e.keyCode;
  else if (e.which) code = e.which;
  return code;
  //return String.fromCharCode(code);
}
