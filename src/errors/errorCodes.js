const ERLC_ERROR_CODES = {
  // System Errors (0-999)
  0: {
    message: "Unknown error occurred",
    description:
      "An unexpected error happened. If this persists, contact PRC via an API ticket.",
    category: "SYSTEM_ERROR",
    severity: "HIGH",
  },

  // Communication Errors (1000-1999)
  1001: {
    message: "Communication error with Roblox server",
    description:
      "Failed to communicate with Roblox or the in-game private server. The server may be experiencing issues.",
    category: "COMMUNICATION_ERROR",
    severity: "HIGH",
  },
  1002: {
    message: "Internal system error",
    description: "An internal system error occurred on the ERLC API servers.",
    category: "SYSTEM_ERROR",
    severity: "HIGH",
  },

  // Authentication Errors (2000-2999)
  2000: {
    message: "Missing server key",
    description: "You must provide a valid server-key header in your request.",
    category: "AUTHENTICATION_ERROR",
    severity: "HIGH",
  },
  2001: {
    message: "Invalid server key format",
    description: "The server-key you provided is incorrectly formatted.",
    category: "AUTHENTICATION_ERROR",
    severity: "HIGH",
  },
  2002: {
    message: "Invalid or expired server key",
    description:
      "The server-key you provided is invalid or has expired. Please check your server settings.",
    category: "AUTHENTICATION_ERROR",
    severity: "HIGH",
  },
  2003: {
    message: "Invalid global API key",
    description:
      "The global API key you provided is invalid. Please check your client configuration.",
    category: "AUTHENTICATION_ERROR",
    severity: "HIGH",
  },
  2004: {
    message: "Server key banned",
    description:
      "Your server-key has been banned from accessing the API. Contact PRC support for assistance.",
    category: "AUTHENTICATION_ERROR",
    severity: "CRITICAL",
  },

  // Request Errors (3000-3999)
  3001: {
    message: "Invalid command provided",
    description: "You must provide a valid command in the request body.",
    category: "REQUEST_ERROR",
    severity: "MEDIUM",
  },
  3002: {
    message: "Server offline",
    description:
      "The server you are trying to reach is currently offline (has no players).",
    category: "REQUEST_ERROR",
    severity: "MEDIUM",
  },

  // Rate Limiting & Restrictions (4000-4999)
  4001: {
    message: "Rate limited",
    description:
      "You are being rate limited. Please reduce your request frequency and try again later.",
    category: "RATE_LIMIT_ERROR",
    severity: "MEDIUM",
  },
  4002: {
    message: "Restricted command",
    description:
      "The command you are attempting to run is restricted and cannot be executed.",
    category: "PERMISSION_ERROR",
    severity: "MEDIUM",
  },
  4003: {
    message: "Prohibited message",
    description:
      "The message you're trying to send contains prohibited content.",
    category: "CONTENT_ERROR",
    severity: "MEDIUM",
  },

  // Access Errors (9000-9999)
  9998: {
    message: "Restricted resource",
    description: "The resource you are trying to access is restricted.",
    category: "ACCESS_ERROR",
    severity: "HIGH",
  },
  9999: {
    message: "Outdated server module",
    description:
      "The module running on the in-game server is out of date. Please kick all players and try again.",
    category: "VERSION_ERROR",
    severity: "HIGH",
  },
};

/**
 * Gets error information by code
 * @param {number} code - The ERLC error code
 * @returns {Object} Error information object
 */
function getErrorInfo(code) {
  const errorInfo = ERLC_ERROR_CODES[code];
  if (!errorInfo) {
    return {
      message: `Unknown ERLC error code: ${code}`,
      description:
        "This error code is not recognized. Please check the ERLC API documentation.",
      category: "UNKNOWN_ERROR",
      severity: "MEDIUM",
    };
  }
  return { ...errorInfo, code };
}

/**
 * Checks if an error code indicates a retryable error
 * @param {number} code - The ERLC error code
 * @returns {boolean} True if the error might be resolved by retrying
 */
function isRetryableError(code) {
  const retryableCodes = [1001, 1002, 4001]; // Communication errors and rate limits
  return retryableCodes.includes(code);
}

/**
 * Checks if an error code indicates an authentication issue
 * @param {number} code - The ERLC error code
 * @returns {boolean} True if the error is authentication-related
 */
function isAuthenticationError(code) {
  return code >= 2000 && code <= 2999;
}

/**
 * Gets suggested actions for an error code
 * @param {number} code - The ERLC error code
 * @returns {string[]} Array of suggested actions
 */
function getSuggestedActions(code) {
  const actions = {
    0: [
      "Contact PRC support via API ticket",
      "Check server logs for more details",
    ],
    1001: [
      "Check server status",
      "Verify server is online",
      "Try again in a few minutes",
    ],
    1002: ["Try again later", "Contact PRC support if issue persists"],
    2000: [
      "Add server-key header to your request",
      "Check API integration code",
    ],
    2001: [
      "Verify server-key format",
      "Get new server-key from server settings",
    ],
    2002: [
      "Get new server-key from server settings",
      "Verify server is still active",
    ],
    2003: [
      "Check global API token configuration",
      "Verify client initialization",
    ],
    2004: ["Contact PRC support immediately", "Review API usage policies"],
    3001: ["Check command format", "Ensure command is not empty"],
    3002: ["Wait for players to join server", "Check server status"],
    4001: [
      "Reduce request frequency",
      "Implement rate limiting in your code",
      "Wait before retrying",
    ],
    4002: ["Use a different command", "Check command permissions"],
    4003: ["Review message content", "Remove prohibited words or phrases"],
    9998: ["Check API permissions", "Contact server administrator"],
    9999: [
      "Kick all players from server",
      "Restart server",
      "Update server module",
    ],
  };

  return (
    actions[code] || [
      "Check ERLC API documentation",
      "Contact PRC support if needed",
    ]
  );
}

module.exports = {
  ERLC_ERROR_CODES,
  getErrorInfo,
  isRetryableError,
  isAuthenticationError,
  getSuggestedActions,
};
