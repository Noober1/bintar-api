const config = require("./config");
const administrasi = require("./administrasi");
const media = require("./media");
const auth = require("./auth");
const user = require("./user");
const classAngkatan = require("./class");
const student = require("./student");
const prodi = require("./prodi");
const template = require("./template");
const exporting = require("./export");
const ppdb = require("./ppdb");

module.exports = {
  auth,
  config,
  user,
  student,
  administrasi,
  classAngkatan,
  media,
  prodi,
  template,
  exporting,
  ppdb,
};
