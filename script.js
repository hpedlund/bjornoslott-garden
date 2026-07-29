const mapElement = document.getElementById("map");
const selectionElement = document.getElementById("selection");
const inventoryBodyElement = document.getElementById("inventory-body");

function renderSelection(item) {
  selectionElement.innerHTML = `
    <strong>${item.name}</strong><br>
    Type: ${item.type}<br>
    Age: ${item.age}<br>
    Location: ${item.location}<br>
    Details: ${item.details}
  `;
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
  row.innerHTML = `
    <td>${item.name}</td>
    <td>${item.type}</td>
    <td>${item.age}</td>
    <td>${item.location}</td>
    <td>${item.details}</td>
  `;
  inventoryBodyElement.append(row);
}

async function init() {
  const response = await fetch("./data/plants.json");
  const plants = await response.json();

  plants.forEach((item) => {
    addMarker(item);
    addInventoryRow(item);
  });
}

init();
