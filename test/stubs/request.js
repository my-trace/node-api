module.exports = opts => {
  if (/facebook/.test(opts.url)) {
    if (/me/.test(opts.url)) {
      if (opts.headers.Authorization === 'Bearer andyToken') {
        return {
          id: '1119072518111932',
          name: 'Andy Carlson',
          email: '2yinyang2@gmail.com'
        }
      } else if (opts.headers.Authorization === 'Bearer johnToken') {
        return {
          id: '1119072518111933',
          name: 'John Doe',
          email: 'john@doe.com'
        }
      }
    } else if (/debug/.test(opts.url)) {
      if (opts.qs.input_token === 'andyToken') {
        return {
          data: {
            is_valid: true,
            user_id: 1119072518111932
          }
        }
      }
    }
  }
}
