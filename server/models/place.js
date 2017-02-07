const Promise = require('bluebird')
const _ = require('lodash')

class Place {
  constructor() {}
}

// get all the points in a certain interval
Place.getByAccountId = function(knex, account_id, lower, upper) {
  lower = new Date(lower).toISOString()
  upper = new Date(upper).toISOString()
  return knex('accounts_places_links')
    .innerJoin('places', 'places.id', 'accounts_places_links.place_id')
    .select()
    .where({ 'accounts_places_links.account_id': account_id })
    .whereBetween('accounts_places_links.started_at', [ lower, upper ])
}

module.exports = Place

