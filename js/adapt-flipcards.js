/*
 * adapt-flipcards
 * License - https://github.com/deltanet/adapt-flipCards/blob/master/LICENSE
 */
define([
    'coreViews/componentView',
    'coreJS/adapt'
], function(ComponentView, Adapt) {

    var Flipcards = ComponentView.extend({

        events: {
            'click .flipcards-item': 'onClickFlipItem'
        },

        preRender: function() {
            this.listenTo(Adapt, 'device:resize', this.reRender, this);
            this.checkIfResetOnRevisit();
        },

        // this is use to set ready status for current component on postRender.
        postRender: function() {
            if (!Modernizr.csstransforms3d) {
                this.$('.flipcards-item-back').hide();
            }

            this.$('.flipcards-widget').imageready(_.bind(function() {
                this.setReadyStatus();
                this.reRender();
            }, this));
			
			this.checkInRow();
        },

        // Used to check if the flipcards should reset on revisit
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

        // This function called on triggering of device resize and device change event of Adapt.
        reRender: function() {
            var imageHeight = this.$('.flipcards-item-frontImage').eq(0).height();
            if (imageHeight) {
                this.$('.flipcards-item').height(imageHeight);
            }
			
			this.checkInRow();
        },
		
		checkInRow: function($selectedElement) {
			if(Adapt.device.screenSize === "large") {
				var inRow = this.model.get("_inRow");
				var itemInRow = (100 / inRow) - 1.5;
				
				$(".flipcards-item").css({
					width: itemInRow + "%"
				});
			} else {
				$(".flipcards-item").css({ "width" : "100%" });
			}
		},
		
        // Click or Touch event handler for flip card.
        onClickFlipItem: function(event) {
            if (event && event.preventDefault) event.preventDefault();

            var $selectedElement = $(event.currentTarget);
            var flipType = this.model.get('_flipType');
            if (flipType === 'allFlip') {
                this.performAllFlip($selectedElement);
            } else if (flipType === 'singleFlip') {
                this.performSingleFlip($selectedElement);
            }
        },

        // This function will be responsible to perform All flip on flipcards
        // where all cards can flip and stay in the flipped state.
        performAllFlip: function($selectedElement) {
            if (!Modernizr.csstransforms3d) {
                var $frontflipcards = $selectedElement.find('.flipcards-item-front');
                var $backflipcards = $selectedElement.find('.flipcards-item-back');
                var flipTime = this.model.get('_flipTime') || 'fast';
                if ($frontflipcards.is(':visible')) {
                    $frontflipcards.fadeOut(flipTime, function() {
                        $backflipcards.fadeIn(flipTime);
                    });
                } else if ($backflipcards.is(':visible')) {
                    $backflipcards.fadeOut(flipTime, function() {
                        $frontflipcards.fadeIn(flipTime);
                    });
                }
            } else {
                $selectedElement.toggleClass('flipcards-flip');
            }

            var flipcardsElementIndex = this.$('.flipcards-item').index($selectedElement);
            this.setVisited(flipcardsElementIndex);
        },

        // This function will be responsible to perform Single flip on flipcard where
        // only one card can flip and stay in the flipped state.
        performSingleFlip: function($selectedElement) {
            var flipcardsContainer = $selectedElement.closest('.flipcards-widget');
            if (!Modernizr.csstransforms3d) {
                var frontflipcards = $selectedElement.find('.flipcards-item-front');
                var backflipcards = $selectedElement.find('.flipcards-item-back');
                var flipTime = this.model.get('_flipTime') || 'fast';

                if (backflipcards.is(':visible')) {
                    backflipcards.fadeOut(flipTime, function() {
                        frontflipcards.fadeIn(flipTime);
                    });
                } else {
                    var visibleflipcardsBack = flipcardsContainer.find('.flipcards-item-back:visible');
                    if (visibleflipcardsBack.length > 0) {
                        visibleflipcardsBack.fadeOut(flipTime, function() {
                            flipcardsContainer.find('.flipcards-item-front:hidden').fadeIn(flipTime);
                        });
                    }
                    frontflipcards.fadeOut(flipTime, function() {
                        backflipcards.fadeIn(flipTime);
                    });
                }
            } else {
                if ($selectedElement.hasClass('flipcards-flip')) {
                    $selectedElement.removeClass('flipcards-flip');
                } else {
                    flipcardsContainer.find('.flipcards-item').removeClass('flipcards-flip');
                    $selectedElement.addClass('flipcards-flip');
                }
            }

            var flipcardsElementIndex = this.$('.flipcards-item').index($selectedElement);
            this.setVisited(flipcardsElementIndex);
        },

        // This function will set the visited status for particular flipcard item.
        setVisited: function(index) {
            var item = this.model.get('_items')[index];
            item._isVisited = true;
            this.checkCompletionStatus();
        },

        // This function will be used to get visited states of all flipcard items.
        getVisitedItems: function() {
            return _.filter(this.model.get('_items'), function(item) {
                return item._isVisited;
            });
        },

        // This function will check or set the completion status of current component.
        checkCompletionStatus: function() {
            if (!this.model.get('_isComplete')) {
                if (this.getVisitedItems().length === this.model.get('_items').length) {
                    this.setCompletionStatus();
                }
            }
        }
    });

    Adapt.register('flipcards', Flipcards);

    return Flipcards;

});
