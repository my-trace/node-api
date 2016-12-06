exports.up = function(knex) {
  return knex.raw(`
    DROP TABLE IF EXISTS accounts;
    CREATE TABLE accounts(
      id UUID PRIMARY KEY,
      facebook_id BIGINT NOT NULL,
      name VARCHAR NOT NULL,
      email VARCHAR NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    DROP TABLE IF EXISTS points;
    CREATE TABLE points (
      id UUID PRIMARY KEY,
      lat DECIMAL NOT NULL,
      lng DECIMAL NOT NULL,
      alt DECIMAL,
      floor_level INTEGER,
      vertical_accuracy	DECIMAL,
      horizontal_accuracy	DECIMAL,
      account_id UUID NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      CONSTRAINT "points_account_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts" ("id") ON DELETE CASCADE,
      CHECK ("created_at" > '2015-01-01')
    );
  `)
}

exports.down = function(knex) {
  return knex.raw(`
    DROP TABLE IF EXISTS accounts;
    DROP TABLE IF EXISTS points;
  `)
}
