const formatTime = require('date-format')

const createMessage = (message) => {
  return {
    message,
    createdAt: formatTime('dd/MM/yyyy - hh:mm:ss', new Date()),
  }
}

module.exports = createMessage
