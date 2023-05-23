const jwt = require('jsonwebtoken')

const authenticate = (req, res, next) => {
  const token = req.cookies.auth
  try {
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        res.cookie('userInfo', req.user)
        return next()
      } catch (error) {
        res.status(200).clearCookie('auth')
        res
          .status(401)
          .send(
            '<script>alert("Đăng nhập đã hết hạn, vui lòng đăng nhập lại. ");window.location.href ="/user/login";</script>'
          )
        //('Đăng nhập đã hết hạn, vui lòng đăng nhập lại. <a href = /user/login>Đăng nhập </a>')
      }
    } else {
      // res
      //   .status(403)
      //   .send(
      //     "Bạn chưa đăng nhập. <a href = /user/login>Đăng nhập </a>.  <a href = /user/register>Đăng Ký </a>"
      //   );

      res.status(403).redirect('user/login')
    }
  } catch (error) {
    res.send({ message: error.message })
  }
}

module.exports = { authenticate }
