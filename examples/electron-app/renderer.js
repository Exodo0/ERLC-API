// DOM Elements
const globalTokenInput = document.getElementById("global-token");
const serverTokenInput = document.getElementById("server-token");
const cmdInput = document.getElementById("cmd-input");
const outputLog = document.getElementById("output-log");
const btnTheme = document.getElementById("btn-theme");

// Helper to log output
function syntaxHighlight(json) {
  if (typeof json !== "string") {
    json = JSON.stringify(json, undefined, 2);
  }
  json = json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function (match) {
      let cls = "json-number";
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "json-key";
        } else {
          cls = "json-string";
        }
      } else if (/true|false/.test(match)) {
        cls = "json-boolean";
      } else if (/null/.test(match)) {
        cls = "json-null";
      }
      return '<span class="' + cls + '">' + match + "</span>";
    },
  );
}

function log(data) {
  const timestamp = new Date().toLocaleTimeString();

  const placeholder = outputLog.querySelector(".log-placeholder");
  if (placeholder) {
    placeholder.remove();
  }

  const entryDiv = document.createElement("div");
  entryDiv.className = "log-entry";

  const timeSpan = document.createElement("span");
  timeSpan.className = "log-timestamp";
  timeSpan.textContent = `[${timestamp}]`;

  const contentDiv = document.createElement("div");
  contentDiv.className = "log-content";

  if (typeof data === "string") {
    contentDiv.textContent = data;
  } else {
    contentDiv.innerHTML = syntaxHighlight(data);
  }

  entryDiv.appendChild(timeSpan);
  entryDiv.appendChild(contentDiv);

  outputLog.insertBefore(entryDiv, outputLog.firstChild);
}

// Window Controls
document
  .getElementById("btn-min")
  .addEventListener("click", () => window.api.minimize());
document
  .getElementById("btn-max")
  .addEventListener("click", () => window.api.maximize());
document
  .getElementById("btn-close")
  .addEventListener("click", () => window.api.close());

// Theme Logic
async function initTheme() {
  const currentTheme = await window.api.getTheme();
  document.documentElement.setAttribute("data-theme", currentTheme);
  updateThemeIcon(currentTheme);
}

function updateThemeIcon(theme) {
  const icon = btnTheme.querySelector("i");
  if (theme === "dark") {
    icon.classList.remove("fa-sun");
    icon.classList.add("fa-moon");
  } else {
    icon.classList.remove("fa-moon");
    icon.classList.add("fa-sun");
  }
}

btnTheme.addEventListener("click", async () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  await window.api.setTheme(next);
  updateThemeIcon(next);
});

// Initialization
window.addEventListener("DOMContentLoaded", async () => {
  initTheme();

  // Load Credentials
  const creds = await window.api.getCredentials();
  if (creds) {
    globalTokenInput.value = creds.globalToken || "";
    serverTokenInput.value = creds.serverToken || "";
  }
});

// Platform Detection for UI adjustments
if (navigator.platform.toUpperCase().indexOf("MAC") >= 0) {
  document.body.classList.add("platform-darwin");
}

// API Actions
document
  .getElementById("btn-save-creds")
  .addEventListener("click", async () => {
    const globalToken = globalTokenInput.value.trim();
    const serverToken = serverTokenInput.value.trim();

    try {
      const res = await window.api.saveCredentials({
        globalToken,
        serverToken,
      });
      if (res.success) log("Credentials saved and verified.");
    } catch (err) {
      log(`Error saving credentials: ${err.message}`);
    }
  });

document
  .getElementById("btn-get-server")
  .addEventListener("click", async () => {
    try {
      log("Fetching server info...");
      const data = await window.api.getServer();
      log(data);
    } catch (err) {
      log(`Error: ${err.message}`);
    }
  });

document
  .getElementById("btn-get-players")
  .addEventListener("click", async () => {
    try {
      log("Fetching players list...");
      const data = await window.api.getPlayers();
      log(data);
    } catch (err) {
      log(`Error: ${err.message}`);
    }
  });

// New API Actions
const handleApiCall = async (methodName, logMsg) => {
  try {
    log(logMsg);
    const data = await window.api[methodName]();
    log(data);
  } catch (err) {
    log(`Error: ${err.message}`);
  }
};

document
  .getElementById("btn-get-staff")
  .addEventListener("click", () =>
    handleApiCall("getStaff", "Fetching staff list..."),
  );
document
  .getElementById("btn-get-queue")
  .addEventListener("click", () =>
    handleApiCall("getQueue", "Fetching queue..."),
  );
document
  .getElementById("btn-get-vehicles")
  .addEventListener("click", () =>
    handleApiCall("getVehicles", "Fetching vehicles..."),
  );
document
  .getElementById("btn-get-bans")
  .addEventListener("click", () =>
    handleApiCall("getBans", "Fetching bans..."),
  );
document
  .getElementById("btn-get-kill-logs")
  .addEventListener("click", () =>
    handleApiCall("getKillLogs", "Fetching kill logs..."),
  );
document
  .getElementById("btn-get-join-logs")
  .addEventListener("click", () =>
    handleApiCall("getJoinLogs", "Fetching join logs..."),
  );
document
  .getElementById("btn-get-cmd-logs")
  .addEventListener("click", () =>
    handleApiCall("getCommandLogs", "Fetching command logs..."),
  );
document
  .getElementById("btn-get-mod-logs")
  .addEventListener("click", () =>
    handleApiCall("getModLogs", "Fetching mod call logs..."),
  );

document.getElementById("btn-run-cmd").addEventListener("click", async () => {
  const cmd = cmdInput.value.trim();
  if (!cmd) return;

  try {
    log(`Running command: ${cmd}`);
    const success = await window.api.runCommand(cmd);
    log(`Command executed: ${success ? "Success" : "Failed"}`);
  } catch (err) {
    log(`Error: ${err.message}`);
  }
});

document.getElementById("btn-clear").addEventListener("click", () => {
  outputLog.innerHTML =
    '<div class="log-placeholder" style="padding:15px; color: var(--text-secondary);">Waiting for action...</div>';
});
