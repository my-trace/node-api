const test = require('ava')
const Cluster = require('../../locator/Cluster')

const epsilon = 0.0002

test.beforeEach(t => {
  const cluster = t.context.cluster = new Cluster(epsilon)
  const points = t.context.points = [
    { lat: 1, lng: 10 },
    { lat: 2, lng: 11.7 },
    { lat: 2.1, lng: 14 }
  ]
  cluster.push(...points)
})

test('should instantiate and add points to cluster', t => {
  const { cluster, points } = t.context
  t.deepEqual(cluster.points, points)
})

test('should calculate the center of all points', t => {
  const expect = {
    lat: 1.7,
    lng: 11.9
  }
  t.deepEqual(t.context.cluster.center(), expect)
})

test('should identify point inside the cluster', t => {
  const point = {
    lat: 1.7001,
    lng: 11.9001
  }
  t.truthy(t.context.cluster.contains(point))
})

test('should identify point outside the cluster', t => {
  const point = {
    lat: 1.7003,
    lng: 11.9003
  }
  t.falsy(t.context.cluster.contains(point))
})

