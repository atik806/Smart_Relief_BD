import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

test('renders navigation shell', async () => {
  render(<App />);
  await waitFor(() => {
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
