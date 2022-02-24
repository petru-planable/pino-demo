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

function makeTestRequest() {
  const logger = getLogger();

  axios.get(
    "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-ug.pdf"
  ).then(response => {
    const { config, data } = response;
    logger.info("[Axios]: response, %o", {
      statusText: response.statusText,
      status: response.status,
      config: {
        url: config.url,
        method: config.method,
      },

      // Error on huge payload, like pdf images blob
      data,
    });
  });
}

makeTestRequest();
