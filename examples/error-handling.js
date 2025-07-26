const erlc = require("../index.js");

// Initialize the client
const client = new erlc.Client({
  globalToken: "your-global-token-here",
});

client.config();

/**
 * Example of comprehensive error handling with the new ERLC error system
 */
async function demonstrateErrorHandling() {
  const serverToken = "your-server-token-here";

  try {
    // This might fail with various ERLC error codes
    const serverInfo = await erlc.getServer(serverToken);
    console.log("✅ Server info retrieved successfully:", serverInfo.Name);
  } catch (error) {
    // The error is now an ErlcError instance with detailed information
    console.error("❌ Error occurred:");
    console.error(`Code: ${error.code}`);
    console.error(`Message: ${error.message}`);
    console.error(`Category: ${error.category}`);
    console.error(`Severity: ${error.severity}`);

    if (error.suggestions) {
      console.error("💡 Suggested actions:");
      error.suggestions.forEach((suggestion, index) => {
        console.error(`   ${index + 1}. ${suggestion}`);
      });
    }

    if (error.retryable) {
      console.error("🔄 This error might be resolved by retrying");
    }

    // Handle specific error codes
    switch (error.code) {
      case 2002:
        console.error(
          "🔑 Your server key is invalid or expired. Please get a new one from your server settings."
        );
        break;
      case 4001:
        console.error(
          "⏱️ You're being rate limited. Waiting 60 seconds before retry..."
        );
        // Implement retry logic here
        break;
      case 3002:
        console.error(
          "🏃 Server is offline (no players). Waiting for players to join..."
        );
        break;
      case 9999:
        console.error(
          "🔄 Server module is outdated. Please kick all players and restart the server."
        );
        break;
      default:
        console.error("🤔 Unexpected error occurred");
    }
  }
}

/**
 * Example of handling multiple API calls with proper error handling
 */
async function handleMultipleApiCalls() {
  const serverToken = "your-server-token-here";

  const apiCalls = [
    { name: "Server Info", call: () => erlc.getServer(serverToken) },
    { name: "Players", call: () => erlc.getPlayers(serverToken) },
    { name: "Staff", call: () => erlc.getStaff(serverToken) },
    { name: "Vehicles", call: () => erlc.getVehicles(serverToken) },
  ];

  for (const { name, call } of apiCalls) {
    try {
      const result = await call();
      console.log(`✅ ${name}: Success`);
    } catch (error) {
      console.error(`❌ ${name}: Failed`);
      console.error(`   Code: ${error.code}`);
      console.error(`   Message: ${error.message}`);

      // Skip retryable errors for this example
      if (!error.retryable) {
        console.error(`   This is a non-retryable error, stopping execution`);
        break;
      }
    }
  }
}

/**
 * Example of implementing retry logic for retryable errors
 */
async function withRetry(apiCall, maxRetries = 3, delayMs = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);

      if (!error.retryable || attempt === maxRetries) {
        throw error; // Don't retry non-retryable errors or if max retries reached
      }

      // Wait before retrying (exponential backoff)
      const delay = delayMs * Math.pow(2, attempt - 1);
      console.log(`Waiting ${delay}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

/**
 * Example usage of retry logic
 */
async function demonstrateRetryLogic() {
  const serverToken = "your-server-token-here";

  try {
    const players = await withRetry(() => erlc.getPlayers(serverToken));
    console.log("✅ Players retrieved successfully:", players.length);
  } catch (error) {
    console.error("❌ Failed after all retries:", error.message);

    if (error.suggestions) {
      console.error("💡 Try these suggestions:");
      error.suggestions.forEach((suggestion) =>
        console.error(`   - ${suggestion}`)
      );
    }
  }
}

// Run examples
if (require.main === module) {
  console.log("🚀 ERLC API Error Handling Examples\n");

  demonstrateErrorHandling()
    .then(() => console.log("\n" + "=".repeat(50) + "\n"))
    .then(() => handleMultipleApiCalls())
    .then(() => console.log("\n" + "=".repeat(50) + "\n"))
    .then(() => demonstrateRetryLogic())
    .catch(console.error);
}

module.exports = {
  demonstrateErrorHandling,
  handleMultipleApiCalls,
  withRetry,
  demonstrateRetryLogic,
};
