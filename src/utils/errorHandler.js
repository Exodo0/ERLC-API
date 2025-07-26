const ErlcError = require("../errors/ErlcError.js");
const {
  getErrorInfo,
  getSuggestedActions,
  isRetryableError,
} = require("../errors/errorCodes.js");

/**
 * Handles API response errors and creates appropriate ErlcError instances
 * @param {Response} response - The fetch response object
 * @param {Object} errorData - The parsed error data from response
 * @returns {ErlcError} Formatted ERLC error
 */
function handleApiError(response, errorData) {
  const status = response.status;

  // Check if error data contains ERLC error code
  if (errorData && typeof errorData.code === "number") {
    const errorInfo = getErrorInfo(errorData.code);
    const suggestions = getSuggestedActions(errorData.code);

    const message = `${errorInfo.message}: ${errorInfo.description}`;
    const error = new ErlcError(message, errorData.code, status);
    error.category = errorInfo.category;
    error.severity = errorInfo.severity;
    error.suggestions = suggestions;
    error.retryable = isRetryableError(errorData.code);

    return error;
  }

  // Handle HTTP status codes when no ERLC error code is provided
  let message, code;

  switch (status) {
    case 400:
      message = "Bad Request: The request was invalid or malformed";
      code = "HTTP_400";
      break;
    case 401:
      message = "Unauthorized: Authentication failed or missing credentials";
      code = "HTTP_401";
      break;
    case 403:
      message = "Forbidden: Access denied or insufficient permissions";
      code = "HTTP_403";
      break;
    case 404:
      message = "Not Found: The requested resource was not found";
      code = "HTTP_404";
      break;
    case 422:
      message = "Unprocessable Entity: The server has no players";
      code = "HTTP_422";
      break;
    case 429:
      message = "Too Many Requests: Rate limit exceeded";
      code = "HTTP_429";
      break;
    case 500:
      message = "Internal Server Error: Problem communicating with Roblox";
      code = "HTTP_500";
      break;
    case 502:
      message = "Bad Gateway: Server received invalid response";
      code = "HTTP_502";
      break;
    case 503:
      message = "Service Unavailable: Server temporarily unavailable";
      code = "HTTP_503";
      break;
    default:
      message = `HTTP Error ${status}: ${
        errorData?.error || response.statusText || "Unknown error"
      }`;
      code = `HTTP_${status}`;
  }

  const error = new ErlcError(message, code, status);
  error.category = "HTTP_ERROR";
  error.severity = status >= 500 ? "HIGH" : "MEDIUM";
  error.retryable = [429, 500, 502, 503].includes(status);

  return error;
}

/**
 * Handles network and other non-API errors
 * @param {Error} originalError - The original error object
 * @returns {ErlcError} Formatted ERLC error
 */
function handleNetworkError(originalError) {
  let message, code, category;

  if (originalError.code === "ENOTFOUND") {
    message =
      "Network Error: Unable to connect to ERLC API (DNS resolution failed)";
    code = "NETWORK_DNS_ERROR";
    category = "NETWORK_ERROR";
  } else if (originalError.code === "ECONNREFUSED") {
    message = "Network Error: Connection refused by ERLC API server";
    code = "NETWORK_CONNECTION_REFUSED";
    category = "NETWORK_ERROR";
  } else if (
    originalError.code === "ETIMEDOUT" ||
    originalError.name === "AbortError"
  ) {
    message = "Request Timeout: API took too long to respond";
    code = "REQUEST_TIMEOUT";
    category = "TIMEOUT_ERROR";
  } else if (originalError.message?.includes("JSON")) {
    message = "Parse Error: Invalid JSON response from API";
    code = "JSON_PARSE_ERROR";
    category = "PARSE_ERROR";
  } else {
    message = `Unexpected Error: ${originalError.message}`;
    code = "UNEXPECTED_ERROR";
    category = "UNKNOWN_ERROR";
  }

  const error = new ErlcError(message, code, null, originalError);
  error.category = category;
  error.severity = "MEDIUM";
  error.retryable = [
    "NETWORK_DNS_ERROR",
    "REQUEST_TIMEOUT",
    "NETWORK_CONNECTION_REFUSED",
  ].includes(code);

  return error;
}

/**
 * Main error handler that processes any error and returns a standardized ErlcError
 * @param {Error|Response} error - The error to handle
 * @param {Object} [errorData] - Additional error data if available
 * @returns {ErlcError} Standardized ERLC error
 */
async function processError(error, errorData = null) {
  // If it's already an ErlcError, return as-is
  if (error instanceof ErlcError) {
    return error;
  }

  // If it's a Response object (from fetch), handle as API error
  if (error && typeof error.status === "number") {
    return handleApiError(error, errorData);
  }

  // Handle as network/system error
  return handleNetworkError(error);
}

module.exports = {
  handleApiError,
  handleNetworkError,
  processError,
};
