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
// router.put('/bio/number', withAuthToken, ppdb.putBio)
// router.put('/bio/advanced', withAuthToken, ppdb.putBio)
// router.put('/bio/additional', withAuthToken, ppdb.putBio)
// router.put('/bio/address', withAuthToken, ppdb.putBio)
// router.put('/bio/parent', withAuthToken, ppdb.putBio)

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
