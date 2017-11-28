class BoundarySelector {
  constructor(map) {
    this.map = map;
  }

  clickActionSelection(event) {
    // We are currently selecting
  }

  selectPoints() {
    if (this.currentlySelecting === undefined) {
      this.map.registerClickAction(this.clickActionSelection);
      this.currentlySelection = true;
    } else {
      // currentlySelecting is defined

    }
  }
}

export default BoundarySelector;
