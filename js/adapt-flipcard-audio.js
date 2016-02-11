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

            if (this.model.get('_reducedText') && this.model.get('_reducedText')._isEnabled && Adapt.config.get('_reducedText')._isEnabled) {
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
            var imageHeight = this.$('.flipcard-audio-item-frontImage').eq(0).height();
            if (imageHeight) {
                this.$('.flipcard-audio-item').height(imageHeight);
            }
            
            this.checkInRow();
        },
        
        checkInRow: function($selectedElement) {
            if(Adapt.device.screenSize === "large") {
                var inRow = this.model.get("_inRow");
                var itemInRow = (100 / inRow) - 2;
                
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

            var $frontflipcard = $selectedElement.find('.flipcard-audio-item-front');
            var $flipcardTitle = $selectedElement.find('.flipcard-audio-item-back-title');
            var $flipcardBody = $selectedElement.find('.flipcard-audio-item-back-body');

            if ($selectedElement.hasClass('flipcard-audio-flip')) {
                var item = this.model.get('_items')[flipcardElementIndex];
                ///// Audio /////
                if (this.model.has('_audio') && this.model.get('_audio')._isEnabled && Adapt.audio.audioClip[this.model.get('_audio')._channel].status==1) {
                    Adapt.trigger('audio:playAudio', item._audio.src, this.model.get('_id'), this.model.get('_audio')._channel);
                }
                ///// End of Audio /////
                $flipcardTitle.a11y_text();
                $flipcardBody.a11y_text();
                $flipcardTitle.a11y_focus();
            } else {
                $frontflipcard.a11y_focus();
                $flipcardTitle.a11y_on(false);
                $flipcardBody.a11y_on(false);
            }
            $selectedElement.addClass("visited");
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

                    var $itemFront = $selectedElement.find('.flipcard-audio-item-front');
                    var $itemTitle = $selectedElement.find('.flipcard-audio-item-back-title');
                    var $itemBody = $selectedElement.find('.flipcard-audio-item-back-body');

                    $itemFront.a11y_focus();
                    $itemTitle.a11y_on(false);
                    $itemBody.a11y_on(false);
                }
            } else {
                if ($selectedElement.hasClass('flipcard-audio-flip')) {
                    $selectedElement.removeClass('flipcard-audio-flip');

                    var $itemFront = $selectedElement.find('.flipcard-audio-item-front');
                    var $itemTitle = $selectedElement.find('.flipcard-audio-item-back-title');
                    var $itemBody = $selectedElement.find('.flipcard-audio-item-back-body');

                    $itemFront.a11y_focus();
                    $itemTitle.a11y_on(false);
                    $itemBody.a11y_on(false);

                } else {
                    flipcardContainer.find('.flipcard-audio-item').removeClass('flipcard-audio-flip');
                    $selectedElement.addClass('flipcard-audio-flip');

                    var $itemFront = $selectedElement.find('.flipcard-audio-item-front');
                    var $itemTitle = $selectedElement.find('.flipcard-audio-item-back-title');
                    var $itemBody = $selectedElement.find('.flipcard-audio-item-back-body');

                    $itemTitle.a11y_text();
                    $itemBody.a11y_text();
                    $itemTitle.a11y_focus();

                    ///// Audio /////
                    var index = this.$('.flipcard-audio-item').index($selectedElement);
                    var item = this.model.get('_items')[index];
                    if (this.model.has('_audio') && this.model.get('_audio')._isEnabled && Adapt.audio.audioClip[this.model.get('_audio')._channel].status==1) {
                        Adapt.trigger('audio:playAudio', item._audio.src, this.model.get('_id'), this.model.get('_audio')._channel);
                    }
                    ///// End of Audio /////
                }
                $selectedElement.addClass("visited");
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
        },

        // Reduced text
        replaceText: function(value) {
            // If enabled
            if (this.model.get('_reducedText') && this.model.get('_reducedText')._isEnabled && Adapt.config.get('_reducedText')._isEnabled) {
                // Change component title and body
                if(value == 0) {
                    this.$('.component-title-inner').html(this.model.get('displayTitle')).a11y_text();
                    this.$('.component-body-inner').html(this.model.get('body')).a11y_text();
                } else {
                    this.$('.component-title-inner').html(this.model.get('displayTitleReduced')).a11y_text();
                    this.$('.component-body-inner').html(this.model.get('bodyReduced')).a11y_text();
                }
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
