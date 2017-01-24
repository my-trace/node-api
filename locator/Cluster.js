const { minBy } = require('lodash')

module.exports = class Cluster {
  constructor(epsilon, ...points) {
    this.epsilon = epsilon
    this.points = points
  }

  center() {
    const sums = this.points.reduce((a, b) => {
      return {
        lat: a.lat + b.lat,
        lng: a.lng + b.lng
      }
    })
    return {
      lat: sums.lat / this.points.length,
      lng: sums.lng / this.points.length
    }
  }

  push(...points) {
    this.points.push(...points)
  }

  contains(point) {
    const center = this.center()
    const dist = Math.sqrt(Math.pow(center.lat - point.lat, 2) + Math.pow(center.lng - point.lng, 2))
    return dist <= this.epsilon
  }

  get duration() {
    const min = Math.min(...this.points.map(p => p.created_at.valueOf()))
    const max = Math.max(...this.points.map(p => p.created_at.valueOf()))
    return max - min
  }

  startedAt() {
    return minBy(this.points.map(p => p.created_at), date => date.valueOf())
  }
}

