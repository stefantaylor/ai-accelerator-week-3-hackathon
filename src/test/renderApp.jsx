import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import App from '../App';
import { load, save } from '../state/answersStore';
import { emptyAnswers } from '../state/answers';

export const owner = {
  ...emptyAnswers,
  priorGrants: ['none'],
  propertyType: 'detached',
  ownership: 'ownOutright',
  incomeBand: '12571to50270',
  uninsulatedParts: ['loft', 'walls'],
  heating: 'gasBoiler',
};

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname + location.search}</div>;
}

// Renders the whole app at `path`. If `answers` is given, they are saved
// first (as if the user had just pressed Continue), then loaded as on startup.
export function renderApp(path = '/', { answers, savedAt = Date.now() } = {}) {
  if (answers) save(answers, savedAt);
  const user = userEvent.setup();
  const utils = render(
    <MemoryRouter initialEntries={[path]}>
      <App initial={load(Date.now())} />
      <LocationDisplay />
    </MemoryRouter>,
  );
  const location = () => utils.getByTestId('location').textContent;
  return { user, location, ...utils };
}
