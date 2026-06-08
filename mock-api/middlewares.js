const { readFileSync } = require('fs')
const { join } = require('path')

module.exports = (req, _res, next) => {
  if (req.method === 'POST') {
    const db = JSON.parse(readFileSync(join(__dirname, 'db.json'), 'utf-8'))
    const resource = req.path.replace(/^\//, '')
    if (db[resource]) {
      const ids = db[resource].map(item => Number(item.id)).filter(n => Number.isFinite(n))
      req.body.id = String(ids.length > 0 ? Math.max(...ids) + 1 : 1)
    }
  }
  next()
}
