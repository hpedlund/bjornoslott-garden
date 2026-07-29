const inventoryBodyElement = document.getElementById("inventory-body");
const yearSelectElement = document.getElementById("year-select");
const defaultMapCenter = { latitude: 56.7705576, longitude: 16.3833692 };
const defaultZoomLevel = 16.2;
const baselineYears = [1860, 2026];
const markerInstances = [];
let activePopup = null;
let allPlants = [];

const map = new maplibregl.Map({
  container: "map",
  style: {
    version: 8,
    sources: {
      openstreetmap: {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      },
    },
    layers: [
      {
        id: "osm",
        type: "raster",
        source: "openstreetmap",
      },
    ],
  },
  center: [defaultMapCenter.longitude, defaultMapCenter.latitude],
  zoom: defaultZoomLevel,
});

function getPlantedYear(item) {
  const parsedDate = new Date(item.plantedAt);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate.getUTCFullYear();
}

function buildPopupContent(item) {
  const wrapper = document.createElement("div");
  const title = document.createElement("strong");
  title.textContent = item.name;
  wrapper.append(title);

  const fields = [
    `Type: ${item.type}`,
    `Year: ${getPlantedYear(item) ?? "-"}`,
    `Area: ${item.area}`,
    `Location: ${item.location}`,
    `Details: ${item.details}`,
  ];

  fields.forEach((text) => {
    const line = document.createElement("p");
    line.textContent = text;
    line.style.margin = "0.35rem 0 0";
    wrapper.append(line);
  });

  return wrapper;
}

function addMarker(item) {
  const markerElement = document.createElement("button");
  markerElement.type = "button";
  markerElement.className = "map-marker";
  markerElement.setAttribute("aria-label", item.name);

  const marker = new maplibregl.Marker({
    element: markerElement,
    anchor: "center",
  })
    .setLngLat([item.mapPosition.longitude, item.mapPosition.latitude])
    .addTo(map);

  markerElement.addEventListener("click", () => {
    if (activePopup) {
      activePopup.remove();
    }
    const popup = new maplibregl.Popup({ closeOnClick: true })
      .setLngLat([item.mapPosition.longitude, item.mapPosition.latitude])
      .setDOMContent(buildPopupContent(item))
      .addTo(map);
    activePopup = popup;
  });

  marker.getElement().title = item.name;
  markerInstances.push(marker);
}

function addInventoryRow(item) {
  const row = document.createElement("tr");
  const nameCell = document.createElement("td");
  nameCell.textContent = item.name;
  row.append(nameCell);

  const typeCell = document.createElement("td");
  typeCell.textContent = item.type;
  row.append(typeCell);

  const yearCell = document.createElement("td");
  yearCell.textContent = getPlantedYear(item) ?? "-";
  row.append(yearCell);

  const areaCell = document.createElement("td");
  areaCell.textContent = item.area;
  row.append(areaCell);

  const locationCell = document.createElement("td");
  locationCell.textContent = item.location;
  row.append(locationCell);

  const detailsCell = document.createElement("td");
  detailsCell.textContent = item.details;
  row.append(detailsCell);

  inventoryBodyElement.append(row);
}

function renderEmptyInventoryMessage(year) {
  const row = document.createElement("tr");
  const messageCell = document.createElement("td");
  messageCell.colSpan = 6;
  messageCell.textContent = `No plants or trees are mapped for year ${year}.`;
  row.append(messageCell);
  inventoryBodyElement.append(row);
}

function clearMapMarkers() {
  markerInstances.forEach((marker) => marker.remove());
  markerInstances.length = 0;
  if (activePopup) {
    activePopup.remove();
    activePopup = null;
  }
}

function renderYearView(year) {
  const visibleItems = allPlants.filter((item) => {
    const plantedYear = getPlantedYear(item);
    return plantedYear !== null && plantedYear <= year;
  });

  clearMapMarkers();
  inventoryBodyElement.replaceChildren();

  visibleItems.forEach((item) => {
    addMarker(item);
    addInventoryRow(item);
  });

  if (visibleItems.length === 0) {
    renderEmptyInventoryMessage(year);
  }
}

function setupYearSelector(plants) {
  const dataYears = plants
    .map((item) => getPlantedYear(item))
    .filter((year) => year !== null);
  const yearOptions = [...new Set([...baselineYears, ...dataYears])].sort((a, b) => a - b);

  yearSelectElement.replaceChildren();
  yearOptions.forEach((year) => {
    const option = document.createElement("option");
    option.value = String(year);
    option.textContent = String(year);
    yearSelectElement.append(option);
  });

  const defaultYear = Math.max(...yearOptions);
  yearSelectElement.value = String(defaultYear);
  yearSelectElement.addEventListener("change", (event) => {
    renderYearView(Number(event.target.value));
  });
  renderYearView(defaultYear);
}

async function init() {
  try {
    const response = await fetch("./data/plants.json");
    if (!response.ok) {
      throw new Error(`Unable to load inventory (${response.status})`);
    }

    const plants = await response.json();
    allPlants = plants;
    setupYearSelector(plants);
  } catch (error) {
    inventoryBodyElement.replaceChildren();
    const row = document.createElement("tr");
    const messageCell = document.createElement("td");
    messageCell.colSpan = 6;
    messageCell.textContent = "Unable to load plant inventory data.";
    row.append(messageCell);
    inventoryBodyElement.append(row);
    console.error(error);
  }
}

init();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.error("Service worker registration failed", error);
    });
  });
}
