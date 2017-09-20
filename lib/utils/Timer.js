function Timer(callback, delay) {
  var timerId,
    start,
    remaining = delay

  this.pause = function() {
    clearTimeout(timerId)
    remaining -= new Date() - start
  }

  this.resume = function() {
    start = new Date()
    clearTimeout(timerId)
    timerId = setTimeout(callback, remaining)
  }

  this.stop = function() {
    clearTimeout(timerId)
  }

  this.resume()
}

export default Timer
