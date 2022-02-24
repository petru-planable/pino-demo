const axios = require("axios");
const pino = require("pino");

const getLogger = () => {
  const configuration = {
    level: "debug",
    name: "demo",
    transport: {
      targets: [
        {
          target: "pino-pretty",
          level: "debug",
          options: {
            translateTime: true,
            colorize: true,
          },
        },
      ],
    },
  };

  return pino(configuration);
};

const setAxiosLogInterceptors = (logger) => {
  /**
   * Log each request from axios
   * @param config request configuration
   */
  const logRequestSuccess = (config) => {
    const { method, url, params, data, timeout, responseType } = config;
    logger.info("[Axios]: request, %o", {
      method,
      url,
      params,
      data,
      timeout,
      responseType,
    });
  };

  /**
   * this function handler and log an error event from axios request interceptor
   * @param error any the global handler from axios
   * @returns void
   */
  const logRequestError = (error) => {
    logger.error(
      error,
      "[Axios]: request, error message: $s, %o",
      error.message,
      error
    );
  };

  /**
   * Log the axios response object and user id
   * @param response axios response for the request
   */
  const logResponseSuccess = (response) => {
    const { config, data } = response;
    const contentType = response.headers["content-type"];
    // let data = {};

    // // The only acceptable page formats, otherwise there might be a file and the server will go out
    // // of memory if we attempt to read it.
    // if (
    //   contentType?.includes("text/html") ||
    //   contentType?.includes("application/json")
    // ) {
    //   data = response.data;
    // }

    logger.info("[Axios]: response, %o", {
      statusText: response.statusText,
      status: response.status,
      config: {
        url: config.url,
        method: config.method,
      },
       data,
    });
  };

  const logResponseError = (error) => {
    logger.error(
      error,
      "[Axios]: response, error message %s,\n%o",
      error.message,
      { stack: error.stack }
    );
  };

  axios.interceptors.request.use(
    (config) => {
      // log axios request configuration
      logRequestSuccess(config);
      return config;
    },
    (error) => {
      logRequestError(error);
      return Promise.reject(error);
    }
  );

  axios.interceptors.response.use(
    (response) => {
      // Any status code that lie within the range of 2xx cause this function to trigger
      // Do something with response data
      logResponseSuccess(response);

      return response;
    },
    (error) => {
      // Any status codes that falls outside the range of 2xx cause this function to trigger
      logResponseError(error);
      return Promise.reject(error);
    }
  );
};


function makeTestRequest(){
    const logger = getLogger();
    setAxiosLogInterceptors(logger);

    axios.get('https://file-examples-com.github.io/uploads/2017/10/file-example_PDF_1MB.pdf')

}


makeTestRequest();
