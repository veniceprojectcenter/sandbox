

class DivOverlay extends google.maps.OverlayView {
  constructor(bounds, divId, map, renderfunction) {
    super();

    this.bounds_overlay = bounds;
    this.divId_overlay = divId;
    this.map_overlay = map;
    this.div_overlay = null;
    this.renderfunction = renderfunction;

    this.setMap(map);
  }

  onAdd() {
    const div = document.createElement('div');
    div.id = this.divId_overlay;

    div.style.borderStyle = 'none';
    div.style.borderWidth = '0px';
    div.style.position = 'absolute';
    div.style.transform = 'translate(-50%, 50%)';

    this.div_overlay = div;

    const panes = this.getPanes();
    // panes.overlayLayer.appendChild(div);
    panes.overlayMouseTarget.appendChild(div);

    this.renderfunction(this.divId_overlay);
  }

  draw() {
    const overlayProjection = this.getProjection();

    const sw = overlayProjection.fromLatLngToDivPixel(this.bounds_overlay.getSouthWest());
    const ne = overlayProjection.fromLatLngToDivPixel(this.bounds_overlay.getNorthEast());

    const div = this.div_overlay;
    div.style.left = `${sw.x}px`;
    div.style.top = `${ne.y}px`;
    div.style.width = `${ne.x - sw.x}px`;
    div.style.height = `${sw.y - ne.y}px`;
  }

}

export default DivOverlay;
