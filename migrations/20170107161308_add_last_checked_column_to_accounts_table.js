
exports.up = function(knex) {
  return knex.raw('ALTER TABLE accounts ADD COLUMN checked_at TIMESTAMPTZ')
}

exports.down = function(knex) {
  return knex.raw('ALTER TABLE accounts DROP COLUMN IF EXISTS checked_at TIMESTAMPTZ')
}
