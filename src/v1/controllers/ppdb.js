const express = require("express");
const router = express.Router();
const { sendError, checkPageAndLimit } = require("../utils");
const db = require("../../../lib/db");
const httpStatus = require("http-status");
const jwt = require("jsonwebtoken");
const { withAuthToken } = require("../utils/useJWT");
const pagination = require("../../../lib/pagination");
const axios = require("axios");

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
    const getData = await db("PPDBsiswa")
      .select("id", "email", "no_telpon")
      .where({
        email: username,
        no_telpon: password,
      })
      .first();

    if (getData) {
      const accessToken = jwt.sign(
        {
          id: getData.id,
          email: getData.email,
        },
        process.env.ACCESS_TOKEN_SECRET
      );
      return res.json({
        success: true,
        accessToken: accessToken,
      });
    }

    throw new sendError({
      code: "ERR_AUTH_INVALID",
      message: "Username atau password salah",
      status: httpStatus.UNAUTHORIZED,
    });
  } catch (error) {
    next(error);
  }
});

// profile route
router.route("/profile").get(withAuthToken, async (req, res, next) => {
  try {
    console.log(req.auth);
    const getData = await db("PPDBsiswa")
      .select("nama_depan", "nama_belakang", "email")
      .where("id", req.auth.id)
      .first();

    return res.json({
      firstName: getData.nama_depan,
      lastName: getData.nama_belakang,
      fullName: getData.nama_depan + " " + getData.nama_belakang,
    });
  } catch (error) {
    next(error);
  }
});

// get sekolah

router
  .route("/sekolah")
  .get(
    async (req, res, next) => {
      try {
        const getSekolah = await db("dbsekolah").where('nama_sekolah', 'like', `%${req.query.search || ''}%`)
        return res.json(getSekolah)
      } catch (error) {
        next(error)
      }
    })

router
  .route("/jurusan")
  .get(async (req, res, next) => {
    try {
      const getJurusan = await db("dbjurusan").where('dbjurusan', 'like', `%${req.query.search || ''}%`)
      return res.json(getJurusan)
    } catch (error) {
      next(error)
    }
  })

router
  .route('/register')
  .post(async (req, res, next) => {
    try {
      const fetch = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${req.body.captchaToken}`,
        {},
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
          },
        },
      );
      if (!fetch.data.success) {
        throw new sendError({
          status: httpStatus.FORBIDDEN,
          message: "Captcha invalid",
          code: "ERR_CAPTCHA_INVALID",
        })
      }

      // TODO: register execution script need to be here
      res.json({ success: true })
    } catch (error) {
      next(error)
    }
  })

module.exports = router;
