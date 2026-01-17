import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { logger } from "./logger";

interface RetryConfig extends InternalAxiosRequestConfig {
  _retryCount?: number;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

function createApiClient(): AxiosInstance {
  const client = axios.create({
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  client.interceptors.request.use(
    (config) => {
      logger.debug("API Request", {
        method: config.method?.toUpperCase(),
        url: config.url,
      });
      return config;
    },
    (error) => {
      logger.error("API Request Error", error);
      return Promise.reject(error);
    }
  );

  client.interceptors.response.use(
    (response) => {
      logger.debug("API Response", {
        status: response.status,
        url: response.config.url,
      });
      return response;
    },
    async (error: AxiosError) => {
      const config = error.config as RetryConfig;

      if (!config) {
        return Promise.reject(error);
      }

      config._retryCount = config._retryCount ?? 0;

      const shouldRetry =
        config._retryCount < MAX_RETRIES &&
        (!error.response || error.response.status >= 500);

      if (shouldRetry) {
        config._retryCount++;
        const delay = RETRY_DELAY * Math.pow(2, config._retryCount - 1);

        logger.warn("API Retry", {
          attempt: config._retryCount,
          url: config.url,
          delay,
        });

        await new Promise((resolve) => setTimeout(resolve, delay));
        return client(config);
      }

      const errorMessage =
        error.response?.data && typeof error.response.data === "object"
          ? (error.response.data as { error?: string }).error || error.message
          : error.message;

      logger.error("API Error", error, {
        status: error.response?.status,
        url: config.url,
        message: errorMessage,
      });

      return Promise.reject(error);
    }
  );

  return client;
}

export const apiClient = createApiClient();
export default apiClient;
