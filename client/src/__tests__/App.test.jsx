import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App.jsx';

describe('App smoke', () => {
  it('renders without crashing', () => {
    // provide a simple localStorage mock for jsdom environment
    globalThis.localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    };
    // mock fetch to avoid network requests in smoke test
    globalThis.fetch = async () => ({ ok: true, json: async () => [] });
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });
});
