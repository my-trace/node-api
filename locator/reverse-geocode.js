const env = require('../env')
const request = require('request-promise')
const API_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'

function reverseGeocode(lat, lng) {
  const reqOpts = {
    qs: {
      key: env.GOOGLE_API_KEY,
      rankby: 'distance',
      location: `${lat},${lng}`
    },
    url: API_URL
  }
  return request(reqOpts)
    .then(JSON.parse)
    .then(res => res.results[0])
}

/*
reverseGeocode(34.057930, -118.4430863)
  .then(console.log)
*/

module.exports = reverseGeocode
