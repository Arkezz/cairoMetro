import logger from "../src/modules/logger.js";
import chalk from "chalk";
import app from "../src/app.js";

const port = process.env.PORT || 5000;

app.listen(port, () => {
  logger.info(chalk.blue(`Server listening on port ${port}`));
});
