const uuid = require('uuid')

class User {
  constructor(props) {
    this.id = uuid.v4()
    this.name = props.name
    this.email = props.email
  }
}

module.exports = User

