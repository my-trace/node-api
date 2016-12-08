## Running the app 

1. Run a PostgreSQL database.
1. Add the necessary environment vars (see `env.js`)
1. `npm install`
1. `npm run migrate`
1. `npm test`
1. `npm start`


## Register users

Just go to `/connect/facebook` in the browser and you will be in the database! You'll also receive an oauth token in the response body. Send it in the authorization header to start saving and fetching points.

## Database stuff

```shell
# run latest migrations
$ npm run migrate

# generate new migration file in /migrations
$ npm run gen-migrate

# load fixture data (from /test/fixtures) into tables (after migrating)
$ npm run fixtures
```

## Routes

### GET /health
A health check endpoint.

### POST /users
Register a user from Facebook. For testing, you can also visit `/connect/facebook` to save new users via oauth.
```yaml
headers:
  Authorization: <fb token>
  Content-Type: application/json

body:
  name: string
  email: string
  facebook_id: int
```

### POST /points
Save a user's points.
```yaml
headers:
  Authorization: <fb token>
  Content-Type: application/json

body: json-array of the attributes for the Point (see model section)
```

```js
[ { lat: 37.78627132548483,
    lng: -122.3976185810548,
    alt: 12.39452648162842,
    floor_level: null,
    horizontal_accuracy: 65,
    vertical_accuracy: 10,
    account_id: '3C332578-2A1F-40D5-9A16-EB9F7CE724DF',
    created_at: 1481191892160 },
  { lat: 37.78627132548483,
    lng: -122.3976185810548,
    alt: 12.39452648162842,
    floor_level: null,
    horizontal_accuracy: 65,
    vertical_accuracy: 10,
    account-id: '4ABCE83B-4557-4556-9421-51E0238656A7',
    created_at: '2016-12-08T10:11:58.933Z' } ]
```

### GET /points
Retrieve a user's points within a time interval (default the past week)
```yaml
headers:
  Authorization: <fb token>

querystring:
  from: unix timestamp milliseconds
  until: unix timestamp milliseconds
```

## Models

### Account
| attr | type |
| ---  | ---  |
| id   | uuid |
| name | varchar |
| email | varchar |
| facebook_id | BigInt |
| created_at | timestamptz |

### Point
| attr | type |
| ---  | ---  |
| id   | uuid |
| lat  | double |
| lng  | double |
| alt  | double |
| floor_level | int |
| vertical_accuracy | double |
| horizontal_accuracy | double |
| account_id | uuid |
| created_at | timestamptz |

