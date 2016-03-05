'use strict'
// ///////////////////
// VECTOR CLASS
// ///////////////////
class Vector {

  constructor (x, y) {
    this.x = x
    this.y = y
  }

  add (v) {
    return new Vector(this.x + v.x, this.y + v.y)
  }

  sub (v) {
    return new Vector(this.x - v.x, this.y - v.y)
  }

  mult (n) {
    return new Vector(this.x * n, this.y * n)
  }

  div (n) {
    return new Vector(this.x / n, this.y / n)
  }

  mag () {
    return Math.round(Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2)))
  }

  normalize () {
    var mag = this.mag()
    return mag === 0 ? this : this.div(mag)
  }

  dot (v) {
    return this.x * v.x + this.y * v.y
  }

  angleBetween (v) {
    return Math.acos(this.dot(v) / (this.mag() * v.mag()))
  }

  limit (n) {
    if (this.mag() > n) {
      return this.normalize().mult(n)
    }
    return this
  }

  heading () {
    return Math.atan2(this.y, this.x)
  }

}

// ///////////////////
// CHECKPOINT CLASS
// ///////////////////

class CheckPoint {

  constructor (position) {
    this.position = position
    this.radius = 600
  }

  draw (canvas) {
    var ctx = canvas.getContext('2d')
    ctx.save()
    ctx.scale(0.05, 0.05)
    ctx.translate(this.position.x, this.position.y)
    ctx.beginPath()
    ctx.arc(0, 0, this.radius, 0, 2 * Math.PI)
    ctx.lineWidth = 5
    ctx.stroke()
    ctx.fillStyle = 'rgba(120, 100, 255, 0.5)'
    ctx.fill()
    ctx.restore()
  }

}

// ///////////////////
// POD CLASS
// ///////////////////

class Pod {

  constructor (position, velocity, thrust, angle) {
    this.position = position
    this.velocity = velocity
    this.thrust = thrust
    this.angle = angle
    this.mass = 1
    this.radius = 400
    this.maxspeed = 1127
    this.maxthrust = 200
    this.frictionCoeficient = 0.85
    this.angleVelocity = 0
    this.angleAcceleration = 0
    this.currentCPId = 1
    this.checkpoints = []
    this.timeFactor = 1
  }

  setTimeFactor (timeFactor) {
    this.timeFactor = timeFactor
  }

  setCurrentCPId (currentCPId) {
    this.currentCPId = currentCPId
  }

  setCheckpoints (checkpoints) {
    this.checkpoints = checkpoints
  }

  setMass (mass) {
    this.mass = mass
  }

  setMaxspeed (maxspeed) {
    this.maxspeed = maxspeed
  }

  setAngleVelocity (angleVelocity) {
    this.angleVelocity = angleVelocity
  }

  setAngleAcceleration (angleAcceleration) {
    this.angleAcceleration = angleAcceleration
  }

  setAngle (angle) {
    this.angle = angle
  }

  update () {
    this.velocity = this.velocity.add(this.thrust).mult(this.frictionCoeficient)
    this.position = this.position.add(this.velocity.mult(this.timeFactor))
    this.angleVelocity += this.angleAccelarion
    this.angle += this.angleVelocity
    this.thrust = this.thrust.mult(0)
  }

  innerCP () {
    return this.position.sub(this.checkpoints[this.currentCPId].position).mag() <= 600
  }

  draw (canvas) {
    var ctx = canvas.getContext('2d')
    ctx.save()
    ctx.scale(0.05, 0.05)
    ctx.translate(this.position.x, this.position.y)
    ctx.rotate(this.velocity.heading())
    ctx.beginPath()
    ctx.arc(0, 0, this.radius, 0, 2 * Math.PI)
    ctx.lineWidth = 5
    ctx.stroke()
    ctx.fillStyle = 'rgba(255, 100, 255, 0.5)'
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(this.radius, 0)
    ctx.lineTo(0, this.radius / 2)
    ctx.lineTo(0, -this.radius / 2)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.fill()
    ctx.restore()
  }

  checkEdges (canvas) {
    if (this.position.x > canvas.width - this.radius) {
      this.position.x = canvas.width - this.radius
      this.velocity.x *= -1
    } else if (this.position.x < this.radius) {
      this.position.x = this.radius
      this.velocity.x *= -1
    }

    if (this.position.y > canvas.height - this.radius) {
      this.position.y = canvas.height - this.radius
      this.velocity.y *= -1
    } else if (this.position.y < this.radius) {
      this.position.y = this.radius
      this.velocity.y *= -1
    }
  }

  applyForce (force) {
    this.thrust = this.thrust.add(force.div(this.mass))
  }

  applyFriction () {
    this.velocity = this.velocity.mult(this.frictionCoeficient)
  }

  createHtmlElement (element, text) {
    var elem = document.createElement(element)
    elem.innerHTML = text
    return elem
  }

  displayInfo (div) {
    div.appendChild(this.createHtmlElement('p', 'Position: ' + '(' + Math.round(this.position.x) + ', ' + Math.round(this.position.y) + ')'))
    div.appendChild(this.createHtmlElement('p', 'Magnitude: ' + Math.trunc(this.velocity.mag())))
  }

}

// ///////////////////
// UTILS FUNCTIONS
// ///////////////////

function getRandom2D (min, max) {
  return new Vector(getRandomInt(min, max), getRandomInt(min, max))
}

function getRandomPosition (xmin, xmax, ymin, ymax) {
  return new Vector(getRandomInt(xmin, xmax), getRandomInt(ymin, ymax))
}

function getRandomInt (min, max) {
  return Math.random() * (max - min) + min
}

var VECTOR_ZERO = new Vector(0, 0)
var PROD_ENV = false
var pods = []
var checkpoints = []

// ///////////////////
// CODINGAME
// ///////////////////
if (PROD_ENV) {
  var laps = parseInt(readline())
  var checkpointCount = parseInt(readline())

  for (var i = 0; i < checkpointCount; i++) {
    var inputs = readline().split(' ')
    var checkpointX = parseInt(inputs[0])
    var checkpointY = parseInt(inputs[1])
    checkpoints.push(new Vector(checkpointX, checkpointY))
  }

  Pod.prototype.seek = function () {
    var desired = this.currentCP.sub(this.position).normalize().mult(this.maxspeed)
    var steer = desired.sub(this.velocity).limit(this.maxthrust)
    this.applyForce(steer)
    var thrust = this.thrust.mag()
    this.update()
    print(Math.round(this.position.x) + ' ' + Math.round(this.position.y) + ' ' + thrust)
  }

  // game loop
  while (true) {
    for (var i = 0; i < 4; i++) {
      var inputs = readline().split(' ')

      var x = parseInt(inputs[0])
      var y = parseInt(inputs[1])

      var position = new Vector(x, y)

      var vx = parseInt(inputs[2])
      var vy = parseInt(inputs[3])
      var velocity = new Vector(vx, vy)

      var angle = parseInt(inputs[4])

      var ncpid = parseInt(inputs[5])

      var pod = new Pod(position, velocity, new Vector(0, 0), checkpoints[ncpid], checkpoints[(ncpid + 1) % checkpointCount])

      pods.push(pod)
    }

    // Write an action using print()
    // To debug: printErr('Debug messages...')

    pods[0].seek()
    print('8000 4500 SHIELD')
  }
}

// ///////////////////
// LOCAL TEST
// ///////////////////

if (!PROD_ENV) {
  var generateCheckPoints = function (n) {
    var array = []
    for (var i = 0; i < n; i++) {
      array.push(new CheckPoint(getRandomPosition(1200, 14000, 1200, 7800)))
    }
    return array
  }

  var generatePods = function (n) {
    var array = []
    for (var i = 0; i < n; i++) {
      array.push(new Pod(getRandom2D(0, 100), VECTOR_ZERO, VECTOR_ZERO))
      array[i].setCheckpoints(checkpoints)
    }
    return array
  }

  checkpoints = generateCheckPoints(4)
  pods = generatePods(1)

  var thrust = 100

  var timeFactor = 1

  var thrustInput = document.getElementById('thrust')

  thrustInput.value = thrust

  var timeFactorInput = document.getElementById('timeFactorInput')

  timeFactorInput.value = 1

  document.getElementById('button').onclick = function () {
    thrust = thrustInput.value
    timeFactor = timeFactorInput.value
  }

  var drawFollowingBall = function () {
    var canvas = document.getElementById('mycanvas')
    var ctx = canvas.getContext('2d')
    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.restore()
    for (var i = 0; i < pods.length; i++) {
      pods[i].setTimeFactor(timeFactor)
      pods[i].applyForce(checkpoints[pods[i].currentCPId].position.sub(pods[i].position).normalize().mult(thrust))
      // pods[i].applyForce(mousePosition.sub(pods[i].position).normalize().mult(100))
      // pods[i].applyForce(new Vector(0.1, 0))
      // pods[i].applyForce(new Vector(0, 0.5))
      // pods[i].applyForce(pods[i].friction())
      pods[i].update()
      // pods[i].checkEdges(canvas)
      pods[i].draw(canvas)
      if (pods[i].innerCP()) {
        pods[i].setCurrentCPId((pods[i].currentCPId + 1) % checkpoints.length)
      }
    }
    for (var j = 0; j < checkpoints.length; j++) {
      checkpoints[j].draw(canvas)
    }

    var info = document.getElementById('info')
    info.innerHTML = ''
    pods[0].displayInfo(info)
  // this.thrust = mousePosition.sub(this.position).normalize().mult(0.5)
  }

  var drawBouncingSquare = function () {
    var canvas = document.getElementById('mycanvas')
    var ctx = canvas.getContext('2d')
    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.restore()
    for (var i = 0; i < pods.length; i++) {
      pods[i].applyForce(new Vector(0.1, 0))
      pods[i].applyForce(new Vector(0, 0.5))
      pods[i].applyForce(pods[i].friction())
      pods[i].update()
      pods[i].checkEdges(canvas)
      pods[i].draw(canvas)
    }
  }

  var fps = 60
  var now
  var then = Date.now()
  var interval = 1000 / fps
  var delta

  var animate = function (highResTimestamp) {
    requestAnimationFrame(animate)
    now = Date.now()
    delta = now - then
    if (delta > interval) {
      drawFollowingBall()
      then = now - (delta % interval)
    }
  }

  var getMousePos = function (canvas, evt) {
    var rect = canvas.getBoundingClientRect()
    return new Vector(evt.clientX - rect.left, evt.clientY - rect.top).mult(20)
  }

  var mousePosition = VECTOR_ZERO

  var addMouseEventListener = function (canvas) {
    canvas.addEventListener('mousemove', function (evt) {
      mousePosition = getMousePos(canvas, evt)
    }, false)
  }

  // addMouseEventListener(document.getElementById('mycanvas'))
  requestAnimationFrame(animate)
}
