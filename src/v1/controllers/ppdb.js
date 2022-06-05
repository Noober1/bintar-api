const express = require("express");
const router = express.Router();
const { validatorRules, validationHandler } = require("../utils");
const { withAuthToken } = require("../utils/useJWT");
const ppdb = require("../middlewares/ppdb")

router.route("/login").post(ppdb.postLogin);

// profile
router.route("/profile").get(withAuthToken, ppdb.getProfile);

// bio
router
  .route('/bio')
  .get(
    withAuthToken, ppdb.getBio
  )

// get sekolah list
router
  .get("/sekolah", ppdb.getSekolah)

// get jurusan list
router
  .get("/jurusan", ppdb.getJurusan)

// post register
router
  .route('/register')
  .post(
    validatorRules.PPDBRegister(),
    validationHandler,
    ppdb.postRegister
  )

module.exports = router;
