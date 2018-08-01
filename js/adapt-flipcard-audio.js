define([
    'coreViews/componentView',
    'coreJS/adapt'
], function(ComponentView, Adapt) {

    var FlipcardAudio = ComponentView.extend({

        events: {
            'click .flipcard-audio-item': 'onClickFlipItem'
        },

        preRender: function() {
            this.listenTo(Adapt, 'device:resize', this.reRender, this);
            this.checkIfResetOnRevisit();

            // Listen for text change on audio extension
            this.listenTo(Adapt, "audio:changeText", this.replaceText);

            this.itemFlipped = new Array();

            var itemLength = this.model.get("_items").length;

            for (var i = 0; i < itemLength; i++) {
              this.itemFlipped[i] = false;
            }

        },

        postRender: function() {
            if (!Modernizr.csstransforms3d) {
              this.$('.flipcard-audio-item-back').hide();
            } else {
              this.$('.flipcard-audio-item-front').addClass('animated');
              this.$('.flipcard-audio-item-back').addClass('animated');
              this.$('.flipcard-audio-item-face').addClass('animated');
            }

            this.$('.flipcard-audio-widget').imageready(_.bind(function() {
                this.setReadyStatus();
                this.reRender();
            }, this));

            if (Adapt.audio && this.model.get('_audio') && this.model.get('_audio')._reducedTextisEnabled) {
                this.replaceText(Adapt.audio.textSize);
            }
        },

        checkIfResetOnRevisit: function() {
            var isResetOnRevisit = this.model.get('_isResetOnRevisit');

            // If reset is enabled set defaults
            if (isResetOnRevisit) {
                this.model.reset(isResetOnRevisit);
            }

            _.each(this.model.get('_items'), function(item) {
                item._isVisited = false;
            });
        },

        reRender: function() {
            this.checkInRow();
            this.resizeHeights();
        },

        checkInRow: function($selectedElement) {
            if(Adapt.device.screenSize === "large") {
                var inRow = this.model.get("_inRow");
                var itemInRow = (98 / inRow) - inRow;

                this.$(".flipcard-audio-item").css({
                    width: itemInRow + "%"
                });
                this.setItemlayout();
                this.$(".flipcard-audio-item").css({ "margin-left" : "1%" });
                this.$(".flipcard-audio-item").css({ "margin-right" : "1%" });
            } else {
                this.$(".flipcard-audio-item").css({ "width" : "100%" });
                this.$(".flipcard-audio-item").css({ "margin-left" : "0px" });
                this.$(".flipcard-audio-item").css({ "margin-right" : "0px" });
            }
        },

        setItemlayout: function() {
            var columns = this.model.get("_inRow");
            var itemLength = this.model.get("_items").length;
            var $items = this.$(".flipcard-audio-item");
            var itemRemainder = itemLength % columns;
            if (itemRemainder !== 0) {
                if (itemRemainder === 1) {
                    var index = itemLength - 1;
                    var $item = $items.eq(index);
                    this.centerItem($item);
                } else {
                    var itemToAlignIndex = itemLength - itemRemainder;
                    var $item = $items.eq(itemToAlignIndex);
                    this.alignItem($item, itemRemainder);
                }
            }
        },

        centerItem: function(item) {
            item.css({
                float: "none",
                margin: "auto"
            });
        },

        alignItem: function(item, itemsToAlign) {
            var columns = this.model.get("_inRow");
            var itemWidth = 100 / columns;

            if (Adapt.config.get('_defaultDirection') == 'rtl') {
                var marginRight = itemWidth / 2;
                item.css({
                    marginRight: marginRight + "%"
                });
            } else {
                var marginLeft = itemWidth / 2;
                item.css({
                    marginLeft: marginLeft + "%"
                });
            }
        },

        resizeHeights: function() {
          var $items = this.$(".flipcard-audio-item");
          var itemLength = this.model.get("_items").length;

          for (var i = 0; i < itemLength; i++) {

            var height = null;

            var $item = $items.eq(i);
            var height = $item.find('.flipcard-audio-item-frontImage').height();

            var $frontflipcard = $item.find('.flipcard-audio-item-frontImage');
            var $backflipcard = $item.find('.flipcard-audio-item-back');

            // reset
            $item.css('height','auto');

            // Check if item is flipped
            if(this.itemFlipped[i] == true) {
              // Check if text is bigger than image
              if($backflipcard.outerHeight() > height) {
                height = $backflipcard.outerHeight();
              } else {
                height = $frontflipcard.height();
              }
            } else {
              height = $frontflipcard.height();
            }

            $item.height(height);

          }

        },

        onClickFlipItem: function(event) {
            if (event && event.preventDefault) event.preventDefault();

            ///// Audio /////
            if (this.model.has('_audio') && this.model.get('_audio')._isEnabled && Adapt.audio.audioClip[this.model.get('_audio')._channel].status==1) {
                Adapt.trigger('audio:pauseAudio', this.model.get('_audio')._channel);
            }
            ///// End of Audio /////

            var $selectedElement = $(event.currentTarget);

            var flipType = this.model.get('_flipType');
            if (flipType === 'allFlip') {
                this.performAllFlip($selectedElement);
            } else if (flipType === 'singleFlip') {
                this.performSingleFlip($selectedElement);
            }
            this.resizeHeights();
        },

        // This function will be responsible to perform All flip on flipcard where all cards can flip and stay in the flipped state.
        performAllFlip: function($selectedElement) {

          var flipcardElementIndex = this.$('.flipcard-audio-item').index($selectedElement);

          // Flip item that is clicked on
          this.flipItem(flipcardElementIndex, true);

          // Flip all other items
          var itemLength = this.model.get("_items").length;

          for (var i = 0; i < itemLength; i++) {
            if(i != flipcardElementIndex) {
              this.flipItem(i, false);
            }
          }

        },

        // This function will be responsible to perform Single flip on flipcard where only one card can flip and stay in the flipped state.
        performSingleFlip: function($selectedElement) {

          var flipcardElementIndex = this.$('.flipcard-audio-item').index($selectedElement);

          this.flipItem(flipcardElementIndex, true);

        },

        flipItem: function(index, active) {

          var $item = this.$('.flipcard-audio-item').eq(index);

          var flipTime = this.model.get('_flipTime') || 'fast';

          var $frontflipcard = $item.find('.flipcard-audio-item-front');
          var $backflipcard = $item.find('.flipcard-audio-item-back');

          var $itemTitle = $item.find('.flipcard-audio-item-back-title');
          var $itemBody = $item.find('.flipcard-audio-item-back-body');

          // If item isn't flipped
          if(this.itemFlipped[index] == false && active) {
            if (Modernizr.csstransforms3d) {
              $item.addClass('flipcard-audio-flip');
            } else {
              $frontflipcard.fadeOut(flipTime, function() {
                $backflipcard.fadeIn(flipTime);
              });
            }
            this.itemFlipped[index] = true;

            $frontflipcard.a11y_on(false);
            $backflipcard.a11y_on(true);

            $itemTitle.a11y_focus();

            ///// Audio /////
            var item = this.model.get('_items')[index];
            if (this.model.has('_audio') && this.model.get('_audio')._isEnabled && Adapt.audio.audioClip[this.model.get('_audio')._channel].status==1) {
              // Reset onscreen id
              Adapt.audio.audioClip[this.model.get('_audio')._channel].onscreenID = "";
              // Trigger audio
              Adapt.trigger('audio:playAudio', item._audio.src, this.model.get('_id'), this.model.get('_audio')._channel);
            }
            ///// End of Audio /////

            this.setVisited(index);
            $item.addClass("visited");

          } else {
            // Flip it back
            if (Modernizr.csstransforms3d) {
              $item.removeClass('flipcard-audio-flip');
            } else {
              $backflipcard.fadeOut(flipTime, function() {
                $frontflipcard.fadeIn(flipTime);
              });
            }

            this.itemFlipped[index] = false;

            $frontflipcard.a11y_on(true);
            $backflipcard.a11y_on(false);
          }

        },

        setVisited: function(index) {
            var item = this.model.get('_items')[index];
            item._isVisited = true;
            this.checkCompletionStatus();
        },

        getVisitedItems: function() {
            return _.filter(this.model.get('_items'), function(item) {
                return item._isVisited;
            });
        },

        checkCompletionStatus: function() {
            if (this.getVisitedItems().length === this.model.get('_items').length) {
                this.setCompletionStatus();
            }
        },

        // Reduced text
        replaceText: function(value) {
            // If enabled
            if (this.model.get('_audio') && this.model.get('_audio')._reducedTextisEnabled) {
                // Change each items title and body
                for (var i = 0; i < this.model.get('_items').length; i++) {
                    if(value == 0) {
                        this.$('.flipcard-audio-item-back-title').eq(i).html(this.model.get('_items')[i].backTitle);
                        this.$('.flipcard-audio-item-back-body').eq(i).html(this.model.get('_items')[i].backBody);
                    } else {
                        this.$('.flipcard-audio-item-back-title').eq(i).html(this.model.get('_items')[i].backTitleReduced);
                        this.$('.flipcard-audio-item-back-body').eq(i).html(this.model.get('_items')[i].backBodyReduced);
                    }
                }
            }
        }

    });

    Adapt.register('flipcard-audio', FlipcardAudio);

    return FlipcardAudio;

});
