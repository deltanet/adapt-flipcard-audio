import Adapt from 'core/js/adapt';
import ComponentView from 'core/js/views/componentView';

class FlipcardView extends ComponentView {

  events() {
    return {
      'click .js-flipcard-toggle': 'onClickFlipItem'
    };
  }

  initialize(...args) {
    super.initialize(...args);

    this.setUpModelData();
    this.setUpEventListeners();
    this.checkIfResetOnRevisit();
  }

  setUpModelData() {
    this.itemFlipped = [];

    const itemLength = this.model.get('_items').length;

    for (let i = 0; i < itemLength; i++) {
      this.itemFlipped[i] = false;
    }
  }

  setUpEventListeners() {
    this.listenTo(Adapt, {
      'device:resize': this.updateLayout,
      'audio:changeText': this.replaceText
    });
  }

  checkIfResetOnRevisit() {
    const isResetOnRevisit = this.model.get('_isResetOnRevisit');

    // If reset is enabled set defaults
    if (isResetOnRevisit) {
      this.model.reset(isResetOnRevisit);
    }

    _.each(this.model.get('_items'), function(item) {
      item._isVisited = false;
    });
  }

  postRender() {
    this.$('.flipcard-audio__item-front').addClass('animated');
    this.$('.flipcard-audio__item-back').addClass('animated');
    this.$('.flipcard-audio__item-face').addClass('animated');

    this.$('.flipcard-audio__widget').imageready(() => {
      this.setReadyStatus();
      this.updateLayout();
    });

    if (Adapt.audio && this.model.get('_audio') && this.model.get('_audio')._reducedTextisEnabled) {
      this.replaceText(Adapt.audio.textSize);
    }
  }

  updateLayout() {
    this.checkInRow();
    this.resizeHeights();
    this.handleTabs();
  }

  checkInRow($selectedElement) {
    if (Adapt.device.screenSize === 'large') {
      const inRow = this.model.get('_inRow');
      const itemInRow = (98 / inRow) - inRow;

      this.$('.flipcard-audio__listitem').css({
        width: itemInRow + '%'
      });

      this.setItemlayout();
      this.$('.flipcard-audio__listitem').css({ 'margin-left': '1%' });
      this.$('.flipcard-audio__listitem').css({ 'margin-right': '1%' });
    } else {
      this.$('.flipcard-audio__listitem').css({ 'width': '100%' });
      this.$('.flipcard-audio__listitem').css({ 'margin-left': '0px' });
      this.$('.flipcard-audio__listitem').css({ 'margin-right': '0px' });
    }
  }

  setItemlayout() {
    const columns = this.model.get('_inRow');
    const itemLength = this.model.get('_items').length;
    const $items = this.$('.flipcard-audio__listitem');
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
    const $items = this.$('.flipcard-audio__listitem');
    const itemLength = this.model.get('_items').length;

    for (let i = 0; i < itemLength; i++) {
      let height = null;

      const $item = $items.eq(i);
      height = $item.find('.flipcard-audio__item-frontImage').height();

      const $frontflipcard = $item.find('.flipcard-audio__item-frontImage');
      const $backflipcard = $item.find('.flipcard-audio__item-back');

      // reset
      $item.css('height', 'auto');

      // Check if item is flipped
      if (this.itemFlipped[i] === true) {
        // Check if text is bigger than image
        if ($backflipcard.outerHeight() > height) {
          height = $backflipcard.outerHeight();
        } else {
          height = $frontflipcard.height();
        }
      } else {
        height = $frontflipcard.height();
      }

      $item.height(height);
    }
  }

  handleTabs() {
    const $itemBack = this.$('.flipcard-audio__item-back');
    Adapt.a11y.toggleAccessibleEnabled($itemBack, false);
  }

  onClickFlipItem(event) {
    ///// Audio /////
    if (Adapt.audio && this.model.has('_audio') && this.model.get('_audio')._isEnabled && Adapt.audio.audioClip[this.model.get('_audio')._channel].status == 1) {
      Adapt.trigger('audio:pauseAudio', this.model.get('_audio')._channel);
    }
    ///// End of Audio /////

    const $selectedElement = $(event.currentTarget);

    const flipType = this.model.get('_flipType');
    if (flipType === 'allFlip') {
      this.performAllFlip($selectedElement);
    } else if (flipType === 'singleFlip') {
      this.performSingleFlip($selectedElement);
    }

    this.resizeHeights();
  }

  // This function will be responsible to perform All flip on flipcard where all cards can flip and stay in the flipped state.
  performAllFlip($selectedElement) {
    const flipcardElementIndex = this.$('.flipcard-audio__item').index($selectedElement);

    // Flip item that is clicked on
    this.flipItem(flipcardElementIndex, true);

    // Flip all other items
    const itemLength = this.model.get('_items').length;

    for (let i = 0; i < itemLength; i++) {
      if (i !== flipcardElementIndex) {
        this.flipItem(i, false);
      }
    }
  }

  // This function will be responsible to perform Single flip on flipcard where only one card can flip and stay in the flipped state.
  performSingleFlip($selectedElement) {
    const flipcardElementIndex = this.$('.flipcard-audio__item').index($selectedElement);

    this.flipItem(flipcardElementIndex, true);
  }

  flipItem(index, active) {
    const $item = this.$('.flipcard-audio__item').eq(index);
    const $backflipcard = $item.find('.flipcard-audio__item-back');

    // If item isn't flipped
    if (this.itemFlipped[index] === false && active) {
      $item.addClass('flipcard-audio-flip');
      this.itemFlipped[index] = true;

      ///// Audio /////
      const item = this.model.get('_items')[index];
      if (Adapt.audio && this.model.has('_audio') && this.model.get('_audio')._isEnabled && Adapt.audio.audioClip[this.model.get('_audio')._channel].status == 1) {
        // Reset onscreen id
        Adapt.audio.audioClip[this.model.get('_audio')._channel].onscreenID = '';
        // Trigger audio
        Adapt.trigger('audio:playAudio', item._audio.src, this.model.get('_id'), this.model.get('_audio')._channel);
      }
      ///// End of Audio /////

      this.setVisited(index);
      $item.addClass('is-visited');

      Adapt.a11y.toggleAccessibleEnabled($backflipcard, true);

    } else {
      // Flip it back
      $item.removeClass('flipcard-audio-flip');

      Adapt.a11y.toggleAccessibleEnabled($backflipcard, true);

      this.itemFlipped[index] = false;
    }
  }

  setVisited(index) {
    const item = this.model.get('_items')[index];
    item._isVisited = true;
    this.checkCompletionStatus();
  }

  getVisitedItems() {
    return _.filter(this.model.get('_items'), function(item) {
      return item._isVisited;
    });
  }

  checkCompletionStatus() {
    if (this.getVisitedItems().length === this.model.get('_items').length) {
      this.setCompletionStatus();
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

FlipcardView.template = 'flipcard';

export default FlipcardView;
