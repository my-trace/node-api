
exports.up = function(knex) {
  return knex.raw(`
    DROP TABLE IF EXISTS places;
    CREATE TABLE places (
      id VARCHAR PRIMARY KEY,
      lat DECIMAL NOT NULL,
      lng DECIMAL NOT NULL,
      icon VARCHAR,
      name VARCHAR NOT NULL,
      place_id VARCHAR NOT NULL,
      types JSONB NOT NULL
    );
  `)
}

exports.down = function(knex) {
  return knex.raw('DROP TABLE IF EXISTS places')
}
