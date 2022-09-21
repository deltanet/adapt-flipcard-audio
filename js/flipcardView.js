import Adapt from 'core/js/adapt';
import a11y from 'core/js/a11y';
import device from 'core/js/device';
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
    const $backflipcard = $item.find('.flipcard-audio-item__back');
    const itemIndex = item.get('_index');

    if (isActive) {
      this.playAudio(item);
    } else {
      this.stopAudio();
    }

    this.itemFlipped[itemIndex] = isActive;

    a11y.toggleAccessibleEnabled($backflipcard, isActive);

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

    const $itemBack = this.$('.flipcard-audio-item__back');
    a11y.toggleAccessibleEnabled($itemBack, false);
  }

  resetLayout() {
    this.model.resetActiveItems();
  }

  checkInRow($selectedElement) {
    if (device.screenSize === 'large') {
      const inRow = this.model.get('_inRow');
      const itemWidth = 100 / inRow;
      this.$('.flipcard-audio-item').css({ width: (itemWidth - 1) + '%' });
    } else {
      this.$('.flipcard-audio-item').css({ 'width': '100%' });
    }
  }

  resizeHeights() {
    const $items = this.$('.flipcard-audio-item');
    const itemLength = this.model.get('_items').length;

    for (let i = 0; i < itemLength; i++) {
      const $item = $items.eq(i);
      let height = $item.find('.flipcard-audio-item__frontImage__image-container').height();

      const $frontflipcard = $item.find('.flipcard-audio-item__frontImage__image-container');
      const $backflipcard = $item.find('.flipcard-audio-item__back');

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
          this.$('.flipcard-audio-item__back-title').eq(i).html(this.model.get('_items')[i].backTitle);
          this.$('.flipcard-audio-item__back-body').eq(i).html(this.model.get('_items')[i].backBody);
        } else {
          this.$('.flipcard-audio-item__back-title').eq(i).html(this.model.get('_items')[i].backTitleReduced);
          this.$('.flipcard-audio-item__back-body').eq(i).html(this.model.get('_items')[i].backBodyReduced);
        }
      }
    }
  }
}

FlipcardView.template = 'flipcard.jsx';

export default FlipcardView;
