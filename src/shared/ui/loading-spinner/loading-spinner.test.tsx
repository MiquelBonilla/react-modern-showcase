import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from './loading-spinner';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

describe('LoadingSpinner', () => {
  it('renders with default message', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('posts.list.loading')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<LoadingSpinner message="Cargando datos..." />);
    expect(screen.getByText('Cargando datos...')).toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
