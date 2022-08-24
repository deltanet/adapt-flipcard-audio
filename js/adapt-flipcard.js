import components from 'core/js/components';
import FlipcardModel from './flipcardModel';
import FlipcardView from './flipcardView';

export default components.register('flipcard-audio', {
  model: FlipcardModel,
  view: FlipcardView
});
