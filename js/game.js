"use strict"

var Radius = 2000
var UpdateRate = 33
var PlayerAcc = 0.2
var PlayerRotSpd = Math.PI / 1000 * UpdateRate
var PropelSpd = 1 * UpdateRate
var FieldSpd = 0.15 * UpdateRate
var NFields = 20
var FieldRatio = 0.1

var keys = [].fill.call({length: 255}, 0)
var mouseDown = false
var time = 0
var timer

var player, timeScale = 1
var shots = []
var fields = []
var endField, endX, endY


function load(color) {
  if(!localStorage['high_score'])
    localStorage['high_score'] = 0
  document.getElementById("max_score").firstChild.nodeValue = localStorage['high_score']
  document.getElementById("intro").style.display = "none"
  document.getElementById("instruct").style.display = ""
  document.body.style.backgroundColor = color
  player = new Obj("img/obj0.png", 0, 0, 0, 0, Math.PI / 2)
  for (var i = 0; i < (NFields / FieldRatio - NFields) / 4; i++) {
    var p = randInCircle(0, 1000)
    var v = randInCircle(0, FieldSpd)
    shots[i] = new Obj("img/asteroid.png", p.x, p.y, v.x, v.y, Math.random() * Math.PI * 2)
    shots[i].velRot = (Math.random() - 0.5) * PlayerRotSpd * 4
  }
  for (var i = 0; i < NFields / 4; i++) {
    var p = randInCircle(500, 1000)
    var v = randInCircle(0, FieldSpd)
    fields[i] = new Obj("img/hole.png", p.x, p.y, v.x, v.y, 0)
    fields[i].div.style.zIndex = -1
  }
  update()
  timer = setInterval(update, UpdateRate)
  setTimeout(function() {
    document.getElementById("instruct").style.display = "none"
  }, 10000)
}

function update() {
  // create fields and asteroids
  while (fields.length < NFields + NFields * time / 120000) {
    var p = randInCircle(1000, 2000)
    var v = randInCircle(0, FieldSpd + FieldSpd * time / 120000)
    if (Math.random() < FieldRatio) {
      var field = new Obj("img/hole.png", player.x + p.x, player.y + p.y, player.dilatedVelX + v.x, player.dilatedVelY + v.y, 0)
      field.div.style.zIndex = -1
      fields[fields.length] = field
    } else {
      var shot = new Obj("img/asteroid.png", player.x + p.x, player.y + p.y, player.dilatedVelX + v.x, player.dilatedVelY + v.y, Math.random() * Math.PI * 2)
      shot.velRot = (Math.random() - 0.5) * PlayerRotSpd * 4
      shots[shots.length] = shot
    }
  }
  // rotate player using mouse or touch
  if (mouseDown) player.rot = Math.atan2(-mouseY + getWindowHeight() / 2, mouseX - getWindowWidth() / 2)
  // create rocket exhaust
  if (keys[38] && Math.random() < 0.02 * UpdateRate) propel(-1)
  if (keys[40] && Math.random() < 0.02 * UpdateRate) propel(1)
  updateObjs()
}

function updateObjs() {
  // move objects
  for (var i = 0; i < fields.length; i++) {
    fields[i].prevX = fields[i].x
    fields[i].prevY = fields[i].y
  }
  for (var i = 0; i < fields.length; i++) updatePos(fields[i], 0, 0)
  for (var i = 0; i < shots.length; i++) updatePos(shots[i], 0, shots[i].velRot)
  if (endField) {
    player.x = endField.x + endX
    player.y = endField.y + endY
  } else {
    updatePos(player, (keys[38] - keys[40]) * PlayerAcc, (keys[37] - keys[39]) * PlayerRotSpd)
  }
  // draw objects
  viewX = player.x - getWindowWidth() / 2
  viewY = player.y - getWindowHeight() / 2
  player.draw()
  for (var i = 0; i < shots.length; i++) {
    shots[i].draw()
    if (objDistSq(shots[i], player) > Radius * Radius) {
      shots[i].remove()
      shots.splice(i, 1)
      i--
    }
  }
  for (var i = 0; i < fields.length; i++) {
    fields[i].draw()
    if (objDistSq(fields[i], player) > Radius * Radius) {
      fields[i].remove()
      fields.splice(i, 1)
      i--
    }
  }
  // increment time
  time += UpdateRate
}

function updatePos(obj, fwd, rot) {
  var field, dist, mul = 1
  // update velocity
  obj.velX += fwd * Math.cos(obj.rot)
  obj.velY += -fwd * Math.sin(obj.rot)
  // find closest field
  for (var i = 0; i < fields.length; i++) {
    if (fields[i] != obj) {
      var d = objDist(obj, {x: fields[i].prevX, y: fields[i].prevY})
      var m = Math.max(0, Math.min(1, d / 500 - 0.2)) // possible to compute this after loop, or use a weighted average instead (sum up all delta v's won't work b/c 2 close fields would repel player)
      if (m < 1 && (!field || d < dist)) {
        field = fields[i]
        dist = d
        mul = m
      }
    }
  }
  // update position and rotation
  if (field) {
    obj.dilatedVelX = field.dilatedVelX + (obj.velX - field.dilatedVelX) * mul
    obj.dilatedVelY = field.dilatedVelY + (obj.velY - field.dilatedVelY) * mul
  } else {
    obj.dilatedVelX = obj.velX
    obj.dilatedVelY = obj.velY
  }
  obj.x += obj.dilatedVelX / timeScale
  obj.y += obj.dilatedVelY / timeScale
  obj.rot += rot * mul / timeScale
  if (obj == player && !endField) {
    if (mul >= UpdateRate / 1500) timeScale = mul // update time travel factor
    else {
      // player reached a singularity
      endField = field
      endX = player.x - field.x
      endY = player.y - field.y
      let gametime = Math.floor(time/1000)
      if (gametime > localStorage['high_score'])
        localStorage['high_score'] = gametime
      document.getElementById("score").firstChild.nodeValue = gametime
      document.getElementById("max_score").firstChild.nodeValue = localStorage['high_score']
      // can't simulate an infinite time interval in one update
      // so instead, exponentially increase time travel speed for about 100 ms
      timeScale = UpdateRate / 1500
      clearInterval(timer)
      timer = setInterval(function() {
        updateObjs()
        timeScale /= 2
        if (timeScale < 0.00005) {
          // game over
          document.body.style.backgroundColor = "gray"
          document.getElementById("back").style.display = "" // workaround for safari
          document.getElementById("instruct").style.display = "none"
          document.getElementById("gameover").style.display = ""
          clearInterval(timer)
        }
      }, 10)
    }
  }
}

function propel(dir) {
  var shot = new Obj("img/propel.png", player.x, player.y,
                     player.velX + PropelSpd * Math.cos(player.rot) * dir + (Math.random() - 0.5) * PropelSpd / 3,
                     player.velY - PropelSpd * Math.sin(player.rot) * dir + (Math.random() - 0.5) * PropelSpd / 3, 0)
  shot.velRot = 0
  shots[shots.length] = shot
}

function randInCircle(min, max) {
  var x, y, d
  do {
    x = (Math.random() - 0.5) * max * 2
    y = (Math.random() - 0.5) * max * 2
    d = x*x + y*y
  } while (d < min * min || d > max * max)
  return {x: x, y: y}
}

window.onkeydown = function(e) {
  var key = findKey(e)
  //document.title = key
  keys[key] = 1
}

window.onkeyup = function(e) {
  var key = findKey(e)
  keys[key] = 0
  if (key == 32) {
    location.reload();
  }
}

window.onmousedown = function() {
  window.onkeydown({keyCode: 38})
  mouseDown = true
}

window.onmouseup = function() {
  window.onkeyup({keyCode: 38})
  mouseDown = false
}

window.onmousemove = getMousePos

window.ontouchstart = function(e) {
  getMousePos(e.changedTouches[0])
  window.onmousedown()
}

window.ontouchend = window.onmouseup

window.ontouchmove = function(e) {
  getMousePos(e.changedTouches[0])
  if (player) e.preventDefault()
}
