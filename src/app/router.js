const { errorHandlers, FileRouter } = require("utils");
const router = require("express").Router();

/********************
 * @Router /api     *
 ********************/

router.get("/errors", errorHandlers.list);

router.use("/static", FileRouter);

router.use("/auth", require("./auth/router"));

router.use("/country", require("./country/router"));

router.use("/city", require("./city/router"));

router.use("/specialty", require("./specialty/router"));

router.use("/user", require("./user/router"));

module.exports = router;
