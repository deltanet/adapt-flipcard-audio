import Adapt from 'core/js/adapt';
import React from 'react';
import a11y from 'core/js/a11y';
import { classes, compile, templates } from 'core/js/reactHelpers';

export default function Flipcard (props) {
  const { complete, incomplete } = Adapt.course.get('_globals')?._accessibility?._ariaLabels;
  const {
    _ariaLevel,
    _animation,
    onClick
  } = props;
  const itemAriaLevel = _.isNumber(_ariaLevel) && _ariaLevel !== 0 : _ariaLevel;
  return (
    <div className="component__inner flipcard-audio__inner">

      <templates.header {...props} />

      <div className="component__widget flipcard-audio__widget">

        <div role="list" className="flipcard-audio__items">

        {props._items.map(({ frontImage, backTitle, backBody, _index, _isVisited, _isActive }, index) =>

          <button
            className={classes([
              'flipcard-audio__item',
              'js-flipcard-item',
              `is-${_animation}`,
              _isVisited && 'is-visited',
              _isActive && `animate-${_animation} is-selected`
            ])}
            role='listitem'
            key={_index}
            data-index={_index}
            onClick={onClick}
            aria-label={`${frontImage.alt ? frontImage.alt : backTitle ? backTitle : _index}`}
            aria-expanded={_isActive.toString()}
          >

            <div className="flipcard-audio__item-face flipcard-audio__item-front">
              <templates.image {...frontImage}
                classNamePrefixes={['flipcard-audio__item-frontImage']}
              />
            </div>

            <div className="flipcard-audio__item-face flipcard-audio__item-back" aria-hidden="true">

              {backTitle &&
              <div className="flipcard-audio__item-back-title" dangerouslySetInnerHTML={{ __html: compile(backTitle) }}>
              </div>
              }

              {backBody &&
              <div className="flipcard-audio__item-back-body" dangerouslySetInnerHTML={{ __html: compile(backBody) }}>
              </div>
              }

            </div>

          </button>

        )}

      </div>

      </div>

    </div>
  );
}
