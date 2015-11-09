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
        },

        postRender: function() {
            if (!Modernizr.csstransforms3d) {
                this.$('.flipcard-audio-item-back').hide();
            }

            this.$('.flipcard-audio-widget').imageready(_.bind(function() {
                this.setReadyStatus();
                this.reRender();
            }, this));
			
			this.checkInRow();
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
            var imageHeight = this.$('.flipcard-audio-item-frontImage').eq(0).height();
            if (imageHeight) {
                this.$('.flipcard-audio-item').height(imageHeight);
            }
			
			this.checkInRow();
        },
		
		checkInRow: function($selectedElement) {
			if(Adapt.device.screenSize === "large") {
				var inRow = this.model.get("_inRow");
				var itemInRow = (100 / inRow) - 1.5;
				
				$(".flipcard-audio-item").css({
					width: itemInRow + "%"
				});
			} else {
				$(".flipcard-audio-item").css({ "width" : "100%" });
			}
		},
		
        onClickFlipItem: function(event) {
            if (event && event.preventDefault) event.preventDefault();

            ///// Audio /////
            if (this.model.get('_audio')) {
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
        },

        // This function will be responsible to perform All flip on flipcard where all cards can flip and stay in the flipped state.
        performAllFlip: function($selectedElement) {
            if (!Modernizr.csstransforms3d) {
                var $frontflipcard = $selectedElement.find('.flipcard-audio-item-front');
                var $backflipcard = $selectedElement.find('.flipcard-audio-item-back');
                var flipTime = this.model.get('_flipTime') || 'fast';
                if ($frontflipcard.is(':visible')) {
                    $frontflipcard.fadeOut(flipTime, function() {
                        $backflipcard.fadeIn(flipTime);
                    });
                } else if ($backflipcard.is(':visible')) {
                    $backflipcard.fadeOut(flipTime, function() {
                        $frontflipcard.fadeIn(flipTime);
                    });
                }
            } else {
                $selectedElement.toggleClass('flipcard-audio-flip');
            }

            var flipcardElementIndex = this.$('.flipcard-audio-item').index($selectedElement);
            this.setVisited(flipcardElementIndex);

            ///// Audio /////
            if ($selectedElement.hasClass('flipcard-audio-flip') && this.model.get('_audio')) {
                var item = this.model.get('_items')[flipcardElementIndex];
                if (Adapt.audio.audioClip[this.model.get('_audio')._channel].canPlayType('audio/ogg')) this.audioFile = item._audio.ogg;
                if (Adapt.audio.audioClip[this.model.get('_audio')._channel].canPlayType('audio/mpeg')) this.audioFile = item._audio.mp3;
                Adapt.trigger('audio:playAudio', this.audioFile, this.model.get('_id'), this.model.get('_audio')._channel);
            }
            ///// End of Audio /////
        },

        // This function will be responsible to perform Single flip on flipcard where only one card can flip and stay in the flipped state.
        performSingleFlip: function($selectedElement) {
            var flipcardContainer = $selectedElement.closest('.flipcard-audio-widget');
            if (!Modernizr.csstransforms3d) {
                var frontflipcard = $selectedElement.find('.flipcard-audio-item-front');
                var backflipcard = $selectedElement.find('.flipcard-audio-item-back');
                var flipTime = this.model.get('_flipTime') || 'fast';

                if (backflipcard.is(':visible')) {
                    backflipcard.fadeOut(flipTime, function() {
                        frontflipcard.fadeIn(flipTime);
                    });
                } else {
                    var visibleflipcardBack = flipcardContainer.find('.flipcard-audio-item-back:visible');
                    if (visibleflipcardBack.length > 0) {
                        visibleflipcardBack.fadeOut(flipTime, function() {
                            flipcardContainer.find('.flipcard-audio-item-front:hidden').fadeIn(flipTime);
                        });
                    }
                    frontflipcard.fadeOut(flipTime, function() {
                        backflipcard.fadeIn(flipTime);
                    });
                }
            } else {
                if ($selectedElement.hasClass('flipcard-audio-flip')) {
                    $selectedElement.removeClass('flipcard-audio-flip');
                } else {
                    flipcardContainer.find('.flipcard-audio-item').removeClass('flipcard-audio-flip');
                    $selectedElement.addClass('flipcard-audio-flip');

                    ///// Audio /////
                    var index = this.$('.flipcard-audio-item').index($selectedElement);
                    var item = this.model.get('_items')[index];
                    if (this.model.get('_audio')) {
                        if (Adapt.audio.audioClip[this.model.get('_audio')._channel].canPlayType('audio/ogg')) this.audioFile = item._audio.ogg;
                        if (Adapt.audio.audioClip[this.model.get('_audio')._channel].canPlayType('audio/mpeg')) this.audioFile = item._audio.mp3;
                        Adapt.trigger('audio:playAudio', this.audioFile, this.model.get('_id'), this.model.get('_audio')._channel);
                    }
                    ///// End of Audio /////
                }
            }

            var flipcardElementIndex = this.$('.flipcard-audio-item').index($selectedElement);
            this.setVisited(flipcardElementIndex);
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
            if (!this.model.get('_isComplete')) {
                if (this.getVisitedItems().length === this.model.get('_items').length) {
                    this.setCompletionStatus();
                }
            }
        }
    });

    Adapt.register('flipcard-audio', FlipcardAudio);

    return FlipcardAudio;

});
