const express = require("express");
const router = express.Router();
const { validatorRules, validationHandler } = require("../utils");
const { withAuthToken } = require("../utils/useJWT");
const ppdb = require("../middlewares/ppdb")

router.route("/login").post(ppdb.postLogin);

// profile
router.route("/profile").get(withAuthToken, ppdb.getProfile);

// bio
router.get('/bio', withAuthToken, ppdb.getBio)
router.put('/bio/basic', withAuthToken, ppdb.putBioBasic)
router.put('/bio/number', withAuthToken, ppdb.putBioNumber)
router.put('/bio/advanced', withAuthToken, ppdb.putBioAdvanced)
router.put('/bio/address', withAuthToken, ppdb.putBioAddress)
router.put('/bio/additional', withAuthToken, ppdb.putBioAdditional)
router.put('/bio/parent', withAuthToken, ppdb.putBioParent)

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
