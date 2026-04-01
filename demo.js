async function postJSON(url, data) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  let payload = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  return { ok: response.ok, status: response.status, data: payload };
}

const codeForm = document.getElementById("codeForm");
if (codeForm) {
  codeForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const code = document.getElementById("accessCode").value.trim();
    const message = document.getElementById("codeMessage");
    message.textContent = "";

    const result = await postJSON("/api/validate-code", { code });

    if (!result.ok) {
      message.textContent = result.data.message || "Access code invalid or expired.";
      return;
    }

    window.location.href = "/nda.html";
  });
}

const ndaForm = document.getElementById("ndaForm");
if (ndaForm) {
  ndaForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const companyName = document.getElementById("companyName").value.trim();
    const message = document.getElementById("ndaMessage");
    message.textContent = "";

    const result = await postJSON("/api/accept-nda", { companyName });

    if (!result.ok) {
      message.textContent = result.data.message || "Unable to save agreement.";
      return;
    }

    window.location.href = "/watch-demo.html";
  });
}

const videoContainer = document.getElementById("videoContainer");
if (videoContainer) {
  fetch("/api/check-session")
    .then((res) => res.json())
    .then((data) => {
      if (!data.authorized) {
        window.location.href = "/demo.html";
        return;
      }

      videoContainer.innerHTML = data.embedHtml;
    })
    .catch(() => {
      const message = document.getElementById("videoMessage");
      message.textContent = "Unable to load demo. Please re-enter your access code.";
    });
}