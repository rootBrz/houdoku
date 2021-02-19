import { Series } from '../../models/types';

export const SET_SEARCH_EXTENSION = 'SET_SEARCH_EXTENSION';
export const SET_SEARCH_RESULTS = 'SET_SEARCH_RESULTS';
export const TOGGLE_SHOWING_ADD_MODAL = 'TOGGLE_SHOWING_ADD_MODAL';
export const SET_ADD_MODAL_SERIES = 'SET_ADD_MODAL_SERIES';

export interface SearchState {
  searchExtension: number;
  searchResults: Series[];
  addModalSeries: Series | undefined;
  showingAddModal: boolean;
}

interface SetSearchExtensionAction {
  type: typeof SET_SEARCH_EXTENSION;
  payload: {
    searchExtension: number;
  };
}

interface SetSearchResultsAction {
  type: typeof SET_SEARCH_RESULTS;
  payload: {
    searchResults: Series[];
  };
}

interface ToggleShowingAddModalAction {
  type: typeof TOGGLE_SHOWING_ADD_MODAL;
}

interface SetAddModalSeriesAction {
  type: typeof SET_ADD_MODAL_SERIES;
  payload: {
    addModalSeries: Series;
  };
}

export type SearchAction =
  | SetSearchExtensionAction
  | SetSearchResultsAction
  | ToggleShowingAddModalAction
  | SetAddModalSeriesAction;
