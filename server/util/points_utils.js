// for logging purposes
function get_timestamp_bounds(locations) {
  let timestamps = locations.map((location) => location['timestamp'])
  let min_timestamp = Math.min.apply( null, timestamps)
  let max_timestamp = Math.max.apply( null, timestamps)
  return [new Date(min_timestamp), new Date(max_timestamp)]
}

module.exports = get_timestamp_bounds;
