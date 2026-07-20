const STORAGE_KEY = "mudSlinginAssistantDataV1";

const state = loadState();
let deferredInstallPrompt = null;

const $ = (id) => document.getElementById(id);
const nowIso = () => new Date().toISOString();
const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

function defaultState() {
  return {
    loads: [],
    inspections: [],
    locations: [],
    settings: { defaultCompany: "Briggs", defaultLease: "H&P 388" }
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...defaultState(), ...saved, settings: { ...defaultState().settings, ...(saved?.settings || {}) } };
  } catch {
    return defaultState();
  }
}

function saveState(message = "Saved") {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  renderAll();
  showToast(message);
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2300);
}

function formatDate(iso) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

function formatTime(iso) {
  return new Intl.DateTimeFormat(undefined, { timeStyle: "short" }).format(new Date(iso));
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function materialCategory(material) {
  return /cuttings|solids/i.test(material) ? "solid" : "liquid";
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("GPS is not supported on this device."));
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      }),
      () => reject(new Error("Location permission was denied or GPS was unavailable.")),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  });
}

function setDefaults() {
  $("companyName").value = state.settings.defaultCompany || "";
  $("leaseName").value = state.settings.defaultLease || "";
  $("defaultCompany").value = state.settings.defaultCompany || "";
  $("defaultLease").value = state.settings.defaultLease || "";
}

function updateCapacity() {
  const equipment = $("equipmentType").value;
  if (equipment.startsWith("80")) $("barrels").value = 80;
  if (equipment.startsWith("79")) $("barrels").value = 79;
}

function renderMetrics() {
  const liquid = state.loads.filter((item) => item.category === "liquid");
  const solids = state.loads.filter((item) => item.category === "solid");
  const sum = (items) => items.reduce((total, item) => total + Number(item.barrels || 0), 0);

  $("liquidLoads").textContent = liquid.length;
  $("liquidBarrels").textContent = sum(liquid).toLocaleString(undefined, { maximumFractionDigits: 1 });
  $("solidLoads").textContent = solids.length;
  $("solidBarrels").textContent = sum(solids).toLocaleString(undefined, { maximumFractionDigits: 1 });
  $("totalBarrels").textContent = sum(state.loads).toLocaleString(undefined, { maximumFractionDigits: 1 });
  $("inspectionCount").textContent = state.inspections.length;
}

function allRecords() {
  return [
    ...state.loads.map((item) => ({ ...item, recordType: "load" })),
    ...state.inspections.map((item) => ({ ...item, recordType: "inspection" })),
    ...state.locations.map((item) => ({ ...item, recordType: "location" }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function recordMatches(record, term) {
  if (!term) return true;
  return JSON.stringify(record).toLowerCase().includes(term.toLowerCase());
}

function badgeForInspection(result) {
  if (result === "Passed") return "success";
  if (result === "Out of service") return "danger";
  return "warn";
}

function renderWorkLog() {
  const recentRecords = allRecords().slice(0, 5);
  const workLogList = $("workLog");
  const workLogCount = $("workLogCount");

  workLogCount.textContent = state.loads.length + state.inspections.length;

  if (recentRecords.length === 0) {
    workLogList.innerHTML = '<div class="empty">No activity yet. Start by logging a load or inspection.</div>';
    return;
  }

  workLogList.innerHTML = recentRecords.map((record) => {
    let title = "";
    let meta = "";
    let icon = "";

    if (record.recordType === "load") {
      icon = "📦";
      title = `${escapeHtml(record.material)} - ${Number(record.barrels).toLocaleString()} bbl`;
      meta = `${escapeHtml(record.equipment)} · ${escapeHtml(record.lease || "No lease")}`;
    } else if (record.recordType === "inspection") {
      icon = "✅";
      title = `Inspection: ${escapeHtml(record.equipment)}`;
      meta = `Result: ${escapeHtml(record.result)}`;
    } else {
      icon = "📍";
      title = `Location: ${escapeHtml(record.name)}`;
      meta = `${escapeHtml(record.company || "No company")}`;
    }

    return `
      <div class="work-log-item">
        <div class="work-log-content">
          <div class="work-log-title">${icon} ${title}</div>
          <div class="work-log-meta">${meta}</div>
        </div>
        <div class="work-log-time">${formatTime(record.createdAt)}</div>
      </div>
    `;
  }).join("");
}

function renderRecord(record) {
  if (record.recordType === "load") {
    const map = record.location ? `<a href="https://maps.google.com/?q=${record.location.latitude},${record.location.longitude}" target="_blank" rel="noreferrer">Open Map</a>` : "";
    return `
      <article class="record">
        <div class="record-header">
          <div>
            <span class="badge">LOAD</span>
            <h3>${escapeHtml(record.material)}</h3>
          </div>
          <strong>${Number(record.barrels).toLocaleString()} bbl</strong>
        </div>
        <div class="record-meta">
          ${escapeHtml(record.equipment)} · ${escapeHtml(record.lease || "No lease recorded")}<br>
          ${escapeHtml(record.company || "No company recorded")} · ${formatDate(record.createdAt)}
          ${record.notes ? `<br>${escapeHtml(record.notes)}` : ""}
        </div>
        <div class="record-actions">${map}<button data-delete-type="load" data-delete-id="${record.id}">Delete</button></div>
      </article>`;
  }

  if (record.recordType === "inspection") {
    return `
      <article class="record">
        <div class="record-header">
          <div>
            <span class="badge ${badgeForInspection(record.result)}">${escapeHtml(record.result)}</span>
            <h3>${escapeHtml(record.equipment)}</h3>
          </div>
        </div>
        <div class="record-meta">
          ${formatDate(record.createdAt)}${record.operator ? ` · ${escapeHtml(record.operator)}` : ""}<br>
          Checks: ${escapeHtml((record.checks || []).join(", ") || "None selected")}
          ${record.meterReading ? `<br>Meter: ${escapeHtml(record.meterReading)}` : ""}
          ${record.notes ? `<br>${escapeHtml(record.notes)}` : ""}
        </div>
        <div class="record-actions"><button data-delete-type="inspection" data-delete-id="${record.id}">Delete</button></div>
      </article>`;
  }

  const map = record.latitude && record.longitude ? `<a href="https://maps.google.com/?q=${record.latitude},${record.longitude}" target="_blank" rel="noreferrer">Open Map</a>` : "";
  return `
    <article class="record">
      <div class="record-header">
        <div>
          <span class="badge">LOCATION</span>
          <h3>${escapeHtml(record.name)}</h3>
        </div>
      </div>
      <div class="record-meta">
        ${escapeHtml(record.company || "No company recorded")} · ${formatDate(record.createdAt)}
        ${record.latitude && record.longitude ? `<br>${record.latitude.toFixed(6)}, ${record.longitude.toFixed(6)}` : ""}
        ${record.notes ? `<br>${escapeHtml(record.notes)}` : ""}
      </div>
      <div class="record-actions">${map}<button data-delete-type="location" data-delete-id="${record.id}">Delete</button></div>
    </article>`;
}

function renderHistory() {
  const filter = $("historyFilter")?.value || "all";
  const term = $("historySearch")?.value || "";
  const records = allRecords().filter((item) => (filter === "all" || item.recordType === filter) && recordMatches(item, term));
  $("historyList").innerHTML = records.length ? records.map(renderRecord).join("") : `<div class="empty">No matching records yet.</div>`;
}

function renderLocations() {
  const records = state.locations
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((item) => renderRecord({ ...item, recordType: "location" }));
  $("savedLocations").innerHTML = records.length ? records.join("") : `<div class="empty">No saved locations yet.</div>`;
}

function renderAll() {
  renderMetrics();
  renderWorkLog();
  renderHistory();
  renderLocations();
}

function deleteRecord(type, id) {
  const key = type === "load" ? "loads" : type === "inspection" ? "inspections" : "locations";
  state[key] = state[key].filter((item) => item.id !== id);
  saveState("Record deleted");
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function csvEscape(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function exportCsv() {
  const header = ["Record Type", "Date", "Material/Equipment/Location", "Barrels", "Company", "Lease", "Result", "Latitude", "Longitude", "Notes"];
  const rows = allRecords().map((record) => {
    if (record.recordType === "load") {
      return ["Load", record.createdAt, record.material, record.barrels, record.company, record.lease, "", record.location?.latitude || "", record.location?.longitude || "", record.notes];
    }
    if (record.recordType === "inspection") {
      return ["Inspection", record.createdAt, record.equipment, "", "", "", record.result, "", "", `${(record.checks || []).join("; ")} ${record.notes || ""}`.trim()];
    }
    return ["Location", record.createdAt, record.name, "", record.company, "", "", record.latitude || "", record.longitude || "", record.notes];
  });
  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
  downloadFile(`mud-slingin-records-${new Date().toISOString().slice(0,10)}.csv`, csv, "text/csv;charset=utf-8");
  showToast("CSV exported");
}

function addLiquidLoad() {
  $("materialType").value = "water-based mud";
  $("equipmentType").value = "80 bbl tanker";
  $("barrels").value = "80";
  updateCapacity();
  document.querySelector(".tab-btn[data-tab='loads']").click();
  $("companyName").focus();
}

function addSolidsLoad() {
  $("materialType").value = "oil-based solids";
  $("equipmentType").value = "79 bbl slinger";
  $("barrels").value = "79";
  updateCapacity();
  document.querySelector(".tab-btn[data-tab='loads']").click();
  $("companyName").focus();
}

// Event Listeners

$("equipmentType").addEventListener("change", updateCapacity);

$("loadForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const material = $("materialType").value;
  let location = null;

  if ($("includeLocation").checked) {
    try { location = await getCurrentPosition(); }
    catch (error) { showToast(error.message); }
  }

  state.loads.push({
    id: uid(),
    createdAt: nowIso(),
    material,
    category: materialCategory(material),
    equipment: $("equipmentType").value,
    barrels: Number($("barrels").value),
    lease: $("leaseName").value.trim(),
    company: $("companyName").value.trim(),
    truck: $("truckName").value.trim(),
    notes: $("loadNotes").value.trim(),
    location
  });

  $("loadForm").reset();
  $("barrels").value = "80";
  saveState("Load saved");
});

$("inspectionForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const checks = [...document.querySelectorAll('input[name="inspectionCheck"]:checked')].map((input) => input.value);
  state.inspections.push({
    id: uid(),
    createdAt: nowIso(),
    equipment: $("inspectionEquipment").value,
    operator: $("inspectionOperator").value.trim(),
    checks,
    result: $("inspectionResult").value,
    meterReading: $("meterReading").value.trim(),
    notes: $("inspectionNotes").value.trim()
  });
  event.target.reset();
  saveState("Inspection saved");
});

$("captureLocation").addEventListener("click", async () => {
  try {
    const position = await getCurrentPosition();
    $("latitude").value = position.latitude;
    $("longitude").value = position.longitude;
    showToast("GPS captured");
  } catch (error) {
    showToast(error.message);
  }
});

$("locationForm").addEventListener("submit", (event) => {
  event.preventDefault();
  state.locations.push({
    id: uid(),
    createdAt: nowIso(),
    name: $("locationName").value.trim(),
    company: $("locationCompany").value.trim(),
    latitude: $("latitude").value ? Number($("latitude").value) : null,
    longitude: $("longitude").value ? Number($("longitude").value) : null,
    notes: $("locationNotes").value.trim()
  });
  event.target.reset();
  saveState("Location saved");
});

$("historyFilter").addEventListener("change", renderHistory);
$("historySearch").addEventListener("input", renderHistory);
$("exportCsv").addEventListener("click", exportCsv);
$("exportJson").addEventListener("click", () => {
  downloadFile(`mud-slingin-backup-${new Date().toISOString().slice(0,10)}.json`, JSON.stringify(state, null, 2), "application/json");
  showToast("Backup exported");
});

$("saveSettings").addEventListener("click", () => {
  state.settings.defaultCompany = $("defaultCompany").value.trim();
  state.settings.defaultLease = $("defaultLease").value.trim();
  setDefaults();
  saveState("Defaults saved");
});

$("importJson").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const imported = JSON.parse(await file.text());
    Object.assign(state, defaultState(), imported);
    state.settings = { ...defaultState().settings, ...(imported.settings || {}) };
    setDefaults();
    saveState("Backup restored");
  } catch {
    showToast("That backup file is invalid");
  }
  event.target.value = "";
});

$("clearData").addEventListener("click", () => {
  if (!confirm("Erase every load, inspection, location, and setting stored by this app?")) return;
  Object.assign(state, defaultState());
  setDefaults();
  saveState("All app data erased");
});

// Quick action buttons
$("quickAddLiquid").addEventListener("click", addLiquidLoad);
$("quickAddSolids").addEventListener("click", addSolidsLoad);

document.addEventListener("click", (event) => {
  const tab = event.target.closest(".tab-btn");
  if (tab) {
    document.querySelectorAll(".tab-btn").forEach((button) => button.classList.toggle("active", button === tab));
    document.querySelectorAll(".panel").forEach((panel) => panel.classList.toggle("active-panel", panel.id === tab.dataset.tab));
  }

  const deleteButton = event.target.closest("[data-delete-id]");
  if (deleteButton && confirm("Delete this record?")) {
    deleteRecord(deleteButton.dataset.deleteType, deleteButton.dataset.deleteId);
  }
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  $("installButton").classList.remove("hidden");
});

$("installButton").addEventListener("click", async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  $("installButton").classList.add("hidden");
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js"));
}

setDefaults();
renderAll();
