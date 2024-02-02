import axios, {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

function getResponse(response: AxiosResponse) {
  return response;
}

async function rejectResponse(error: AxiosError): Promise<AxiosError> {
  const { message, response: { status = 500 } = {} } = error;

  const messageError = { status, message } as AxiosError;

  if (!status && !message)
    return { status: 500, message: "Request error" } as AxiosError;

  console.error("Intercept: ", JSON.stringify(messageError, null, 2));

  return messageError;
}

function onRequestConfig(
  config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig {
  return config;
}

export { onRequestConfig, rejectResponse, getResponse };
