// @vitest-environment happy-dom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { Tabs } from './common/Tabs.tsx';
import { Checkbox } from './common/Checkbox.tsx';
import App from '../App.tsx';

afterEach(cleanup);

describe('Tabs', () => {
  function Harness() {
    const [active, setActive] = useState<'a' | 'b' | 'c'>('a');
    return (
      <Tabs
        label="Test"
        active={active}
        onChange={setActive}
        tabs={[
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
          { id: 'c', label: 'C' },
        ]}
      >
        <p>panel {active}</p>
      </Tabs>
    );
  }

  it('exposes ARIA roles and supports arrow-key navigation', () => {
    render(<Harness />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]!.getAttribute('aria-selected')).toBe('true');
    expect(tabs[1]!.getAttribute('tabindex')).toBe('-1');
    fireEvent.keyDown(tabs[0]!, { key: 'ArrowRight' });
    expect(screen.getByRole('tabpanel').textContent).toBe('panel b');
    fireEvent.keyDown(screen.getAllByRole('tab')[1]!, { key: 'End' });
    expect(screen.getByRole('tabpanel').textContent).toBe('panel c');
    fireEvent.keyDown(screen.getAllByRole('tab')[2]!, { key: 'ArrowRight' });
    expect(screen.getByRole('tabpanel').textContent).toBe('panel a');
  });
});

describe('Checkbox', () => {
  it('is a real, labelled checkbox with a description', () => {
    const onChange = vi.fn();
    render(<Checkbox checked={false} onChange={onChange} label="Books" sublabel="All files" />);
    const box = screen.getByRole('checkbox', { name: 'Books' });
    fireEvent.click(box);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(box.getAttribute('aria-describedby')).toBeTruthy();
  });
});

describe('App navigation', () => {
  it('switches language and page without reloading', () => {
    window.history.replaceState(null, '', '/');
    render(<App path="/" />);
    fireEvent.click(screen.getByRole('link', { name: 'Leggi questa pagina in italiano' }));
    expect(window.location.pathname).toBe('/it');
    expect(document.documentElement.lang).toBe('it');
    expect(document.title).toContain('KoBup');

    fireEvent.click(screen.getAllByRole('link', { name: 'Ripristino' })[0]!);
    expect(window.location.pathname).toBe('/it/ripristino');
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Ripristina un backup');
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://www.kobup.org/it/ripristino',
    );
    expect(document.querySelectorAll('link[rel="alternate"][hreflang]').length).toBe(3);
  });
});
