const express = require('express')
const { engine } = require('express-handlebars')
const path = require('path')
const morgan = require('morgan')
const rootRouter = require('./router')
const qs = require('qs')
const { sequelize } = require('./models')
const cookieSession = require('cookie-session')
const cookieParser = require('cookie-parser')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { MessageModel } = require('./models')
const axios = require('axios')
require('dotenv').config()
const createMessage = require('./utils/CreateMessage')
const { CLIENT_RENEG_LIMIT } = require('tls')
const { encode, decode } = require('./utils/encodeAndDecode')

const port = process.env.PORT

const filter = new Filter()
const publicPath = path.join(__dirname, '../public')
const app = express()

app.use(
  express.urlencoded({
    extended: true,
  })
)
app.use(express.json())

const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(publicPath))

app.engine(
  '.hbs',
  engine({
    extname: '.hbs',
    helpers: {
      ifEquals: (arg1, arg2, options) => {
        return arg1 == arg2 ? options.fn(this) : options.inverse(this)
      },
    },
  })
)

app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'resources', 'views'))
app.use(cookieParser())
app.use(
  cookieSession({
    keys: 'thanh',
  })
)
app.use(rootRouter)

//xử lý socket io
//Khi client connect
io.on('connection', (socket) => {
  let dataOn = {
    status: true,
  }

  let dataOff = {
    status: false,
  }
  // join room
  socket.on('client join room', async ({ userNameF, room }) => {
    dataOn.userName = userNameF
    dataOff.userName = userNameF
    try {
      const status = await axios.post(
        'http://localhost:3002/user/updateStatus',
        dataOn
      )
    } catch (error) {
      console.log(error)
    }

    socket.join(room)
    //xử lý tin nhắn (chat)
    socket.on('send-message-to-server', async (data, callback) => {
      let dataMess = {
        userNameF: data.userNameF,
        userNameT: data.userNameT,
        fullName: data.fullName,
        userNameT_FullName: data.userNameT_FullName,
        message: data.message,
      }

      const messDecode = decode(dataMess.message)
      dataMess.message = messDecode
      try {
        let newMessage = await axios.post(
          'http://localhost:3002/user/createMessage',
          dataMess
        )

        const messEncode = encode(newMessage.data.newMessage.message)
        newMessage.data.newMessage.message = messEncode
        io.to(room).emit('server-send-message-to-client', {
          userNameF: newMessage.data.newMessage.userNameF,
          userNameT: newMessage.data.newMessage.userNameT,
          message: newMessage.data.newMessage,
          userF: newMessage.data.userF,
          userNameChat: data.userNameChat,
        })
      } catch (error) {
        console.log('Error Server in [Send message to server]')
        console.log(error)
      }
    })

    //xử lý share location
    socket.on('share-location', async (data) => {
      let { latitude, longitude } = data
      latitude = decode(latitude)
      longitude = decode(longitude)

      let linkLocation = createMessage(
        `https://www.google.com/maps?q=${latitude},${longitude}`
      )

      const dataMess = {
        userNameF: data.userNameF,
        userNameT: data.userNameT,
        fullName: data.fullName,
        userNameT_FullName: data.userNameT_FullName,
        message: linkLocation.message,
      }

      try {
        const newMessage = await axios.post(
          'http://localhost:3002/user/createMessage',
          dataMess
        )
        linkLocation.message = encode(linkLocation.message)
        io.to(room).emit('server-send-location-to-client', {
          userNameF: newMessage.data.newMessage.userNameF,
          userNameT: newMessage.data.newMessage.userNameT,
          message: newMessage.data.newMessage,
          userF: newMessage.data.userF,
          messEncode: linkLocation.message,
        })
      } catch (error) {
        console.log('Error Server in [Err locate server]')
        console.log(error)
      }
    })
  })

  // disconnect
  socket.on('disconnect', async () => {
    try {
      const status = await axios.post(
        'http://localhost:3002/user/updateStatus',
        dataOff
      )
    } catch (error) {
      console.log('Loix off')
    }
  })
})

server.listen(port, 'localhost')

server.on('listening', async function () {
  try {
    await sequelize.authenticate()
    console.log('Connection has been established successfully.')
    console.log(`App running on http://localhost:${port}`)
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
})
