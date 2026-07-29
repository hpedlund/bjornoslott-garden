const selectionElement = document.getElementById("selection");
const inventoryBodyElement = document.getElementById("inventory-body");
const defaultMapCenter = { latitude: 56.7705576, longitude: 16.3833692 };
const defaultZoomLevel = 19;

const map = L.map("map").setView(
  [defaultMapCenter.latitude, defaultMapCenter.longitude],
  defaultZoomLevel
);

L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    maxZoom: 19,
  }
).addTo(map);

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
  const marker = L.circleMarker(
    [item.mapPosition.latitude, item.mapPosition.longitude],
    {
      radius: 10,
      fillColor: "#2f7d32",
      color: "#2d4f2d",
      weight: 1,
      fillOpacity: 0.9,
    }
  );
  marker.bindTooltip(item.name);
  marker.on("click", () => renderSelection(item));
  marker.addTo(map);
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
