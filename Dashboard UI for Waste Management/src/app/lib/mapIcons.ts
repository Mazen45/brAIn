import L from 'leaflet';

export const depotIcon = L.divIcon({
  className: 'depot-div-icon',
  html: '<div class="depot-pin">🏭</div>',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

export const landfillIcon = L.divIcon({
  className: 'landfill-div-icon',
  html: '<div class="landfill-pin">🗑️</div>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});
