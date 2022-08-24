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
  const itemAriaLevel = _.isNumber(_ariaLevel) ? _ariaLevel + 1 : _ariaLevel;
  return (
    <div className="component__inner flipcard-audio__inner">

      <templates.header {...props} />

      <div className="component__widget flipcard-audio__widget">

        <div role="list" className="flipcard-audio__items">

        {props._items.map(({ frontImage, backTitle, backBody, _index, _isVisited, _isActive }, index) =>

          <button
            className={classes([
              'flipcard-audio-item',
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

            <span className="flipcard-audio-item__face flipcard-audio-item__front">
              <templates.image {...frontImage}
                classNamePrefixes={['flipcard-audio-item__frontImage']}
              />
            </span>

            <span className="flipcard-audio-item__face flipcard-audio-item__back" aria-hidden="true">

              {backTitle &&
              <span className="flipcard-audio-item__back-title" dangerouslySetInnerHTML={{ __html: compile(backTitle) }}>
              </span>
              }

              {backBody &&
              <span className="flipcard-audio-item__back-body" dangerouslySetInnerHTML={{ __html: compile(backBody) }}>
              </span>
              }

            </span>

          </button>

        )}

      </div>

      </div>

    </div>
  );
}
