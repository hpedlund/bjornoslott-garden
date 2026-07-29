const mapElement = document.getElementById("map");
const selectionElement = document.getElementById("selection");
const inventoryBodyElement = document.getElementById("inventory-body");

function renderSelection(item) {
  selectionElement.replaceChildren();

  const name = document.createElement("strong");
  name.textContent = item.name;
  selectionElement.append(name, document.createElement("br"));

  const fields = [
    `Type: ${item.type}`,
    `Age: ${item.age}`,
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
  marker.style.left = `${item.mapPosition.x}%`;
  marker.style.top = `${item.mapPosition.y}%`;
  marker.title = item.name;
  marker.setAttribute("aria-label", `Show details for ${item.name}`);
  marker.addEventListener("click", () => renderSelection(item));
  mapElement.append(marker);
}

function addInventoryRow(item) {
  const row = document.createElement("tr");
  [item.name, item.type, item.age, item.location, item.details].forEach((value) => {
    const cell = document.createElement("td");
    cell.textContent = value;
    row.append(cell);
  });
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
