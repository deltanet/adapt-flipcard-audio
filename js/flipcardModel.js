import ItemsComponentModel from 'core/js/models/itemsComponentModel';

export default class FlipcardModel extends ItemsComponentModel {

  defaults() {
    return ItemsComponentModel.resultExtend('defaults', {
      _flipType: "singleFlip",
      _inRow: 2,
      _animation: "flipY"
    });
  }

  checkIfResetOnRevisit() {
    this.resetActiveItems();
    super.checkIfResetOnRevisit();

    _.each(this.get('_items'), function(item) {
      item._isVisited = false;
    });
  }

  toggleItemsState(index) {
    const item = this.getItem(index);
    const previousActiveItem = this.getActiveItem();

    item.toggleActive();
    item.toggleVisited(true);

    if (!previousActiveItem || this.get('_flipType') == "singleFlip") return;
    previousActiveItem.toggleActive(false);
  }
}
