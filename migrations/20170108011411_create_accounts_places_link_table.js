
exports.up = function(knex) {
  return knex.raw(`
    DROP TABLE IF EXISTS accounts_places_links;
    CREATE TABLE accounts_places_links (
      account_id UUID REFERENCES accounts (id),
      place_id VARCHAR REFERENCES places (id),
      duration BIGINT,
      startedAt TIMESTAMPTZ
    );
  `)
}

exports.down = function(knex) {
  return knex.raw('DROP TABLE IF EXISTS accounts_places_links')
}
