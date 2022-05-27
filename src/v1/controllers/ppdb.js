const express = require("express");
const router = express.Router();
const { sendError } = require("../utils");
const db = require("../../../lib/db");
const httpStatus = require("http-status");
const jwt = require("jsonwebtoken");
const { withAuthToken } = require("../utils/useJWT");

router.route("/login").post(async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      throw new sendError({
        code: "ERR_UNAUTHORIZED",
        status: httpStatus.UNAUTHORIZED,
        message: "Username dan password harus diisi",
      });
    }
    const getData = await db("PPDBsiswa").select('id','email','no_telpon').where({
      email: username,
      no_telpon: password,
    }).first();

    if (getData) {
      const accessToken = jwt.sign({
        id: getData.id,
        email: getData.email
      }, process.env.ACCESS_TOKEN_SECRET)
      return res.json({
        success: true,
        accessToken: accessToken
      })
    }
    
    throw new sendError({
      code: "ERR_AUTH_INVALID",
      message: "Username atau password salah",
      status: httpStatus.UNAUTHORIZED,
    })
  } catch (error) {
    next(error);
  }
});

router
  .route('/profile')
  .get(
    withAuthToken,
    async (req, res, next) => {
      try {
        console.log(req.auth)
        const getData = await db("PPDBsiswa").where('id', req.auth.id).first()
    
        return res.json(getData)
      } catch (error) {
        next(error)
      }
    }
  )

module.exports = router;
