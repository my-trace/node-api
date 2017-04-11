const test = require('ava')
const _ = require('lodash')
const mobile_points = require('../fixtures/mobile_points')
let get_timestamp_bounds = require('../../server/util/points_utils')

test('get timestamp bounds', t => {
  let bounds = get_timestamp_bounds(_.shuffle(mobile_points))

  t.is(bounds[0].getTime(), (new Date(mobile_points[0]['timestamp']).getTime())) 
  t.is(bounds[1].getTime(), (new Date(mobile_points[3]['timestamp']).getTime())) 
})