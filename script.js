const mapElement = document.getElementById("map");
const mapLabelElement = document.getElementById("map-label");
const selectionElement = document.getElementById("selection");
const inventoryBodyElement = document.getElementById("inventory-body");
const defaultMapCenter = { latitude: 56.7705576, longitude: 16.3833692 };
const mapSpan = { latitude: 0.00045, longitude: 0.00075 };

mapLabelElement.textContent = `Default center: ${defaultMapCenter.latitude}, ${defaultMapCenter.longitude}`;

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
  const marker = document.createElement("button");
  marker.className = "plant-marker";
  marker.type = "button";
  marker.title = item.name;
  marker.setAttribute("aria-label", `Show details for ${item.name}`);

  const x =
    ((item.mapPosition.longitude - (defaultMapCenter.longitude - mapSpan.longitude)) /
      (2 * mapSpan.longitude)) *
    100;
  const y =
    ((item.mapPosition.latitude - (defaultMapCenter.latitude - mapSpan.latitude)) /
      (2 * mapSpan.latitude)) *
    100;

  marker.style.left = `${Math.min(Math.max(x, 0), 100)}%`;
  marker.style.top = `${Math.min(Math.max(y, 0), 100)}%`;
  marker.addEventListener("click", () => renderSelection(item));
  mapElement.append(marker);
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
