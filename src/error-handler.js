import logger from "./logger";


const errorHandler = {
  onError(err) {
    logger.error(err.stack || err.toString());
  }
};

export default errorHandler;
