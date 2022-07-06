import Adapt from 'core/js/adapt';
import FlipcardModel from './flipcardModel';
import FlipcardView from './flipcardView';

export default Adapt.register('flipcard-audio', {
  model: FlipcardModel,
  view: FlipcardView
});
