import Adapt from 'core/js/adapt';
import ComponentView from 'core/js/views/componentView';

class FlipcardView extends ComponentView {

  preRender() {
    this.onClick = this.onClick.bind(this);
    this.listenTo(this.model.getChildren(), 'change:_isActive', this.onItemsActiveChange);

    this.listenTo(Adapt, {
      'device:resize': this.updateLayout,
      'device:changed': this.resetLayout,
      'audio:changeText': this.replaceText
    });

    this.itemFlipped = [];
    for (let i = 0; i < this.model.get('_items').length; i++) {
      this.itemFlipped[i] = false;
    }
  }

  postRender() {
    this.$('.flipcard-audio__widget').imageready(() => {
      this.setReadyStatus();
      this.updateLayout();
    });

    if (Adapt.audio && this.model.get('_audio') && this.model.get('_audio')._reducedTextisEnabled) {
      this.replaceText(Adapt.audio.textSize);
    }
  }

  onClick(event) {
    this.model.toggleItemsState($(event.currentTarget).data('index'));
  }

  onItemsActiveChange(item, isActive) {
    this.toggleItem(item, isActive);
  }

  toggleItem(item, isActive) {
    const $item = this.getItemElement(item);
    const $backflipcard = $item.find('.flipcard-audio__item-back');
    const itemIndex = item.get('_index');

    if (isActive) {
      this.playAudio(item);
    } else {
      this.stopAudio();
    }

    this.itemFlipped[itemIndex] = isActive;

    Adapt.a11y.toggleAccessibleEnabled($backflipcard, isActive);

    this.resizeHeights();
  }

  getItemElement(item) {
    if (!item) return;
    const index = item.get('_index');
    return this.$('.js-flipcard-item').filter(`[data-index="${index}"]`);
  }

  updateLayout() {
    this.checkInRow();
    this.resizeHeights();

    const $itemBack = this.$('.flipcard-audio__item-back');
    Adapt.a11y.toggleAccessibleEnabled($itemBack, false);
  }

  resetLayout() {
    this.model.resetActiveItems();
  }

  checkInRow($selectedElement) {
    if (Adapt.device.screenSize === 'large') {
      const inRow = this.model.get('_inRow');
      const itemWidth = 100 / inRow;

      this.$('.flipcard-audio__item').css({
        width: (itemWidth - 1) + '%'
      });

      this.setItemlayout();
    } else {
      this.$('.flipcard-audio__item').css({ 'width': '100%' });
    }
  }

  setItemlayout() {
    const columns = this.model.get('_inRow');
    const itemLength = this.model.get('_items').length;
    const $items = this.$('.flipcard-audio__item');
    const itemRemainder = itemLength % columns;
    let $item;
    let itemToAlignIndex;

    if (itemRemainder !== 0) {
      if (itemRemainder === 1) {
        $item = $items.eq(itemLength - 1);
        this.centerItem($item);
      } else {
        itemToAlignIndex = itemLength - itemRemainder;
        $item = $items.eq(itemToAlignIndex);
        this.alignItem($item, itemRemainder);
      }
    }
  }

  centerItem(item) {
    item.css({
      float: 'none',
      margin: 'auto'
    });
  }

  alignItem(item, itemsToAlign) {
    const columns = this.model.get('_inRow');
    const itemWidth = 100 / columns;

    if (Adapt.config.get('_defaultDirection') === 'rtl') {
      let marginRight = itemWidth / 2;
      item.css({
        marginRight: marginRight + '%'
      });
    } else {
      let marginLeft = itemWidth / 2;
      item.css({
        marginLeft: marginLeft + '%'
      });
    }
  }

  resizeHeights() {
    const $items = this.$('.flipcard-audio__item');
    const itemLength = this.model.get('_items').length;

    for (let i = 0; i < itemLength; i++) {
      const $item = $items.eq(i);
      let height = $item.find('.flipcard-audio__item-frontImage__image-container').height();

      const $frontflipcard = $item.find('.flipcard-audio__item-frontImage__image-container');
      const $backflipcard = $item.find('.flipcard-audio__item-back');

      // reset
      $item.css('height', 'auto');

      // Check if item is flipped
      if (this.itemFlipped[i] === true) {
        // Check if text is bigger than image
        if ($backflipcard.outerHeight() > height) {
          height = $backflipcard.outerHeight();
        } else {
          height = $frontflipcard.outerHeight();
        }
      } else {
        height = $frontflipcard.outerHeight();
      }

      $item.height(height + 6);
    }
  }

  playAudio(item) {
    if (!Adapt.audio || Adapt.course.get('_audio') && !Adapt.course.get('_audio')._isEnabled) return;

    if (this.model.has('_audio') && this.model.get('_audio')._isEnabled && Adapt.audio.audioClip[this.model.get('_audio')._channel].status==1) {
      // Reset onscreen id
      Adapt.audio.audioClip[this.model.get('_audio')._channel].onscreenID = "";
      // Trigger audio
      Adapt.trigger('audio:playAudio', item.get('_audio').src, this.model.get('_id'), this.model.get('_audio')._channel);
    }
  }

  stopAudio() {
    if (!Adapt.audio || Adapt.course.get('_audio') && !Adapt.course.get('_audio')._isEnabled) return;

    if (this.model.has('_audio') && this.model.get('_audio')._isEnabled) {
      Adapt.trigger('audio:pauseAudio', this.model.get('_audio')._channel);
    }
  }

  // Reduced text
  replaceText(value) {
    // If enabled
    if (this.model.get('_audio') && this.model.get('_audio')._reducedTextisEnabled) {
      // Change each items title and body
      for (let i = 0; i < this.model.get('_items').length; i++) {
        if (value === 0) {
          this.$('.flipcard-audio__item-back-title').eq(i).html(this.model.get('_items')[i].backTitle);
          this.$('.flipcard-audio__item-back-body').eq(i).html(this.model.get('_items')[i].backBody);
        } else {
          this.$('.flipcard-audio__item-back-title').eq(i).html(this.model.get('_items')[i].backTitleReduced);
          this.$('.flipcard-audio__item-back-body').eq(i).html(this.model.get('_items')[i].backBodyReduced);
        }
      }
    }
  }
}

FlipcardView.template = 'flipcard.jsx';

export default FlipcardView;
