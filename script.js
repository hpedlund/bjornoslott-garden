const selectionElement = document.getElementById("selection");
const inventoryBodyElement = document.getElementById("inventory-body");
const defaultMapCenter = { latitude: 56.7705576, longitude: 16.3833692 };
const defaultZoomLevel = 18;

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

function renderSelection(item) {
  selectionElement.replaceChildren();

  const name = document.createElement("strong");
  name.textContent = item.name;
  selectionElement.append(name, document.createElement("br"));

  const fields = [
    `Type: ${item.type}`,
    `Planted timestamp: ${item.plantedAt}`,
    `Location: ${item.location}`,
    `Details: ${item.details}`,
  ];

  fields.forEach((text, index) => {
    selectionElement.append(text);
    if (index !== fields.length - 1) {
      selectionElement.append(document.createElement("br"));
    }
  });
}

function addMarker(item) {
  const markerElement = document.createElement("button");
  markerElement.type = "button";
  markerElement.className = "map-marker";
  markerElement.setAttribute("aria-label", item.name);

  markerElement.addEventListener("click", () => renderSelection(item));

  const marker = new maplibregl.Marker({
    element: markerElement,
    anchor: "center",
  })
    .setLngLat([item.mapPosition.longitude, item.mapPosition.latitude])
    .addTo(map);

  marker.getElement().title = item.name;
}

function addInventoryRow(item) {
  const row = document.createElement("tr");
  const nameCell = document.createElement("td");
  nameCell.textContent = item.name;
  row.append(nameCell);

  const typeCell = document.createElement("td");
  typeCell.textContent = item.type;
  row.append(typeCell);

  const plantedAtCell = document.createElement("td");
  plantedAtCell.textContent = item.plantedAt;
  row.append(plantedAtCell);

  const locationCell = document.createElement("td");
  locationCell.textContent = item.location;
  row.append(locationCell);

  const detailsCell = document.createElement("td");
  detailsCell.textContent = item.details;
  row.append(detailsCell);

  inventoryBodyElement.append(row);
}

async function init() {
  try {
    const response = await fetch("./data/plants.json");
    if (!response.ok) {
      throw new Error(`Unable to load inventory (${response.status})`);
    }

    const plants = await response.json();
    plants.forEach((item) => {
      addMarker(item);
      addInventoryRow(item);
    });
  } catch (error) {
    selectionElement.textContent = "Unable to load plant inventory data.";
    console.error(error);
  }
}

init();
