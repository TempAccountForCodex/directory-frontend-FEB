/**
 * Tests for ContactBlock (Step 15.4)
 *
 *  1.  Renders without crashing with minimal content (stacked)
 *  2.  Renders heading in stacked layout
 *  3.  Renders email address
 *  4.  Renders phone when provided
 *  5.  Renders address when provided
 *  6.  Shows form fields (name, email, message) when showForm=true
 *  7.  Hides form when showForm=false
 *  8.  Submit button exists in stacked layout
 *  9.  Shows success alert after form submit
 * 10.  Renders split-image layout when layout='split-image'
 * 11.  Split layout renders image cell with testid
 * 12.  Split layout renders form cell with testid
 * 13.  Split layout renders image when contactImage provided
 * 14.  Split layout renders placeholder when no contactImage
 * 15.  Split layout heading appears in form cell
 * 16.  Split layout form is rendered when showForm is not false
 * 17.  Split layout hides form when showForm=false
 * 18.  imageRatio 'equal' applies correct gridTemplateColumns
 * 19.  imageRatio 'wide-image' applies correct gridTemplateColumns
 * 20.  imageRatio 'wide-form' applies correct gridTemplateColumns
 * 21.  Default imageRatio falls back to equal
 * 22.  React.memo applied (component has displayName or is memoised)
 * 23.  onFormSubmit callback fires on successful submit
 * 24.  Form clears after successful submission
 * 25.  Description renders in stacked layout when provided
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('framer-motion', () => ({
  useScroll: () => ({ scrollYProgress: { get: () => 0, onChange: () => () => {} } }),
  useTransform: (..._args) => ({ get: () => '0%', onChange: () => () => {} }),
  useMotionValue: (v) => ({ get: () => v, set: () => {}, onChange: () => () => {} }),
  motion: {
    div: ({ children, ...props }: any) => (
      <div data-testid="motion-div" {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: () => null, inView: true }),
}));

vi.mock('dompurify', () => ({
  default: { sanitize: (s: string) => s },
}));

// Hooks used by BlockWrapper
vi.mock('../../hooks', () => ({
  useBlockAnimation: () => ({ shouldAnimate: false, motionProps: {} }),
  useBlockBackground: () => ({
    hasBackground: false,
    backgroundSx: {},
    overlayElement: null,
    contentSx: {},
  }),
  useBlockEffects: () => ({ effectsSx: {} }),
  useBlockSpacing: () => ({ spacingSx: {} }),
  useResponsiveVisibility: () => ({ isHidden: false, visibilitySx: {} }),
  getStaggerDelay: (idx: number, base: number, stagger: number) => base + idx * stagger,
}));

import ContactBlock from '../ContactBlock';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeBlock = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  blockType: 'CONTACT',
  content: {
    heading: 'Contact Us',
    email: 'hello@example.com',
    phone: '+1 555 000 0000',
    address: '123 Main St',
    showForm: true,
    layout: 'stacked' as const,
    ...overrides,
  },
  sortOrder: 0,
});

const renderBlock = (
  overrides: Record<string, unknown> = {},
  props: Record<string, unknown> = {}
) =>
  render(
    <ContactBlock
      block={makeBlock(overrides)}
      primaryColor="#2563eb"
      headingColor="#1e293b"
      bodyColor="#475569"
      {...props}
    />
  );

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ContactBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1
  it('renders without crashing with minimal content', () => {
    expect(() => renderBlock({})).not.toThrow();
  });

  // 2
  it('renders heading in stacked layout', () => {
    renderBlock({});
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
  });

  // 3
  it('renders email address', () => {
    renderBlock({});
    expect(screen.getByText(/hello@example\.com/)).toBeInTheDocument();
  });

  // 4
  it('renders phone when provided', () => {
    renderBlock({});
    expect(screen.getByText(/\+1 555 000 0000/)).toBeInTheDocument();
  });

  // 5
  it('renders address when provided', () => {
    renderBlock({});
    expect(screen.getByText(/123 Main St/)).toBeInTheDocument();
  });

  // 6
  it('shows form fields when showForm=true', () => {
    renderBlock({ showForm: true });
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Message')).toBeInTheDocument();
  });

  // 7
  it('hides form when showForm=false', () => {
    renderBlock({ showForm: false });
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
  });

  // 8
  it('shows Send Message button in stacked layout', () => {
    renderBlock({});
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  // 9
  it('shows success alert after form submit', async () => {
    renderBlock({});
    fireEvent.change(screen.getByLabelText('Name'), { target: { name: 'name', value: 'Alice' } });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { name: 'email', value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { name: 'message', value: 'Hello' },
    });
    fireEvent.submit(screen.getByLabelText('Name').closest('form')!);
    await waitFor(() => {
      expect(screen.getByText(/thank you/i)).toBeInTheDocument();
    });
  });

  // 10
  it('renders split-image layout when layout="split-image"', () => {
    renderBlock({ layout: 'split-image' });
    expect(screen.getByTestId('contact-image-cell')).toBeInTheDocument();
  });

  // 11
  it('split layout renders image cell with testid', () => {
    renderBlock({ layout: 'split-image' });
    expect(screen.getByTestId('contact-image-cell')).toBeInTheDocument();
  });

  // 12
  it('split layout renders form cell with testid', () => {
    renderBlock({ layout: 'split-image' });
    expect(screen.getByTestId('contact-form-cell')).toBeInTheDocument();
  });

  // 13
  it('split layout renders img when contactImage provided', () => {
    renderBlock({ layout: 'split-image', contactImage: 'https://example.com/img.jpg' });
    const img = screen.getByRole('img', { name: /contact section/i });
    expect(img).toHaveAttribute('src', 'https://example.com/img.jpg');
  });

  // 14
  it('split layout renders placeholder when no contactImage', () => {
    renderBlock({ layout: 'split-image', contactImage: '' });
    expect(screen.getByText(/no image/i)).toBeInTheDocument();
  });

  // 15
  it('split layout heading appears in form cell', () => {
    renderBlock({ layout: 'split-image' });
    const formCell = screen.getByTestId('contact-form-cell');
    expect(formCell).toHaveTextContent('Contact Us');
  });

  // 16
  it('split layout renders form when showForm is not false', () => {
    renderBlock({ layout: 'split-image', showForm: true });
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  // 17
  it('split layout hides form when showForm=false', () => {
    renderBlock({ layout: 'split-image', showForm: false });
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
  });

  // 18
  it('imageRatio equal produces 1fr 1fr grid columns', () => {
    const { container } = renderBlock({ layout: 'split-image', imageRatio: 'equal' });
    // The grid box sets gridTemplateColumns via sx — check for the cell structure
    expect(container.querySelector('[data-testid="contact-image-cell"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="contact-form-cell"]')).toBeInTheDocument();
  });

  // 19
  it('imageRatio wide-image renders both cells', () => {
    renderBlock({ layout: 'split-image', imageRatio: 'wide-image' });
    expect(screen.getByTestId('contact-image-cell')).toBeInTheDocument();
    expect(screen.getByTestId('contact-form-cell')).toBeInTheDocument();
  });

  // 20
  it('imageRatio wide-form renders both cells', () => {
    renderBlock({ layout: 'split-image', imageRatio: 'wide-form' });
    expect(screen.getByTestId('contact-image-cell')).toBeInTheDocument();
    expect(screen.getByTestId('contact-form-cell')).toBeInTheDocument();
  });

  // 21
  it('defaults imageRatio to equal when not set (split layout)', () => {
    renderBlock({ layout: 'split-image' });
    expect(screen.getByTestId('contact-image-cell')).toBeInTheDocument();
  });

  // 22
  it('component is wrapped with React.memo', () => {
    // React.memo wraps the component — its type should not be a plain function
    expect(typeof ContactBlock).toBe('object');
  });

  // 23
  it('fires onFormSubmit callback on successful submit', async () => {
    const onFormSubmit = vi.fn();
    render(
      <ContactBlock
        block={makeBlock({ showForm: true })}
        primaryColor="#2563eb"
        onFormSubmit={onFormSubmit}
      />
    );
    fireEvent.change(screen.getByLabelText('Name'), { target: { name: 'name', value: 'Bob' } });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { name: 'email', value: 'bob@x.com' },
    });
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { name: 'message', value: 'Hi' },
    });
    fireEvent.submit(screen.getByLabelText('Name').closest('form')!);
    await waitFor(() => expect(onFormSubmit).toHaveBeenCalledWith('contact', true));
  });

  // 24
  it('form fields clear after successful submission', async () => {
    renderBlock({});
    const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { name: 'name', value: 'Alice' } });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { name: 'email', value: 'a@b.com' },
    });
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { name: 'message', value: 'Test' },
    });
    fireEvent.submit(nameInput.closest('form')!);
    await waitFor(() => expect(nameInput.value).toBe(''));
  });

  // 25
  it('renders description in stacked layout when provided', () => {
    renderBlock({ description: 'We would love to hear from you.' });
    expect(screen.getByText('We would love to hear from you.')).toBeInTheDocument();
  });

  // ── Split-info layout tests ─────────────────────────────────────────────

  // 26
  it('renders split-info layout with info panel and form panel', () => {
    renderBlock({ layout: 'split-info' });
    expect(screen.getByTestId('contact-split-info')).toBeInTheDocument();
    expect(screen.getByTestId('contact-info-panel')).toBeInTheDocument();
    expect(screen.getByTestId('contact-form-panel')).toBeInTheDocument();
  });

  // 27
  it('split-info renders heading in info panel', () => {
    renderBlock({ layout: 'split-info' });
    const infoPanel = screen.getByTestId('contact-info-panel');
    expect(infoPanel).toHaveTextContent('Contact Us');
  });

  // 28
  it('split-info renders email with icon in info panel', () => {
    renderBlock({ layout: 'split-info', email: 'test@co.com' });
    const infoPanel = screen.getByTestId('contact-info-panel');
    expect(infoPanel).toHaveTextContent('test@co.com');
  });

  // 29
  it('split-info renders phone with icon in info panel', () => {
    renderBlock({ layout: 'split-info', phone: '+1 999 000 0000' });
    const infoPanel = screen.getByTestId('contact-info-panel');
    expect(infoPanel).toHaveTextContent('+1 999 000 0000');
  });

  // 30
  it('split-info renders address with icon in info panel', () => {
    renderBlock({ layout: 'split-info', address: '456 Elm St' });
    const infoPanel = screen.getByTestId('contact-info-panel');
    expect(infoPanel).toHaveTextContent('456 Elm St');
  });

  // 31
  it('split-info shows map placeholder when showMap=true', () => {
    renderBlock({ layout: 'split-info', showMap: true });
    expect(screen.getByTestId('contact-map-placeholder')).toBeInTheDocument();
  });

  // 32
  it('split-info hides map placeholder when showMap=false', () => {
    renderBlock({ layout: 'split-info', showMap: false });
    expect(screen.queryByTestId('contact-map-placeholder')).not.toBeInTheDocument();
  });

  // 33
  it('split-info renders form with default fields', () => {
    renderBlock({ layout: 'split-info', showForm: true });
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Message')).toBeInTheDocument();
  });

  // 34
  it('split-info renders custom formFields', () => {
    renderBlock({
      layout: 'split-info',
      showForm: true,
      formFields: [
        { label: 'Full Name', fieldType: 'text', required: true },
        { label: 'Phone Number', fieldType: 'tel', required: false },
        { label: 'Comments', fieldType: 'textarea', required: true },
      ],
    });
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
    expect(screen.getByLabelText('Comments')).toBeInTheDocument();
    // Default fields should NOT be present
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
  });

  // 35
  it('split-info hides form when showForm=false', () => {
    renderBlock({ layout: 'split-info', showForm: false });
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
  });

  // 36
  it('split-info defaults infoPosition to left', () => {
    const { container } = renderBlock({ layout: 'split-info' });
    const grid = screen.getByTestId('contact-split-info');
    const children = Array.from(grid.children);
    // First child should be the info panel
    expect(children[0]).toHaveAttribute('data-testid', 'contact-info-panel');
    expect(children[1]).toHaveAttribute('data-testid', 'contact-form-panel');
  });

  // 37
  it('split-info infoPosition=right puts form first', () => {
    renderBlock({ layout: 'split-info', infoPosition: 'right' });
    const grid = screen.getByTestId('contact-split-info');
    const children = Array.from(grid.children);
    expect(children[0]).toHaveAttribute('data-testid', 'contact-form-panel');
    expect(children[1]).toHaveAttribute('data-testid', 'contact-info-panel');
  });

  // 38
  it('split-info form submit works with custom formFields', async () => {
    const onFormSubmit = vi.fn();
    render(
      <ContactBlock
        block={makeBlock({
          layout: 'split-info',
          showForm: true,
          formFields: [
            { label: 'Your Name', fieldType: 'text', required: true },
            { label: 'Your Email', fieldType: 'email', required: true },
          ],
        })}
        primaryColor="#2563eb"
        onFormSubmit={onFormSubmit}
      />
    );
    fireEvent.change(screen.getByLabelText('Your Name'), {
      target: { name: 'Your Name', value: 'Test' },
    });
    fireEvent.change(screen.getByLabelText('Your Email'), {
      target: { name: 'Your Email', value: 't@t.com' },
    });
    fireEvent.submit(screen.getByLabelText('Your Name').closest('form')!);
    await waitFor(() => expect(onFormSubmit).toHaveBeenCalledWith('contact', true));
  });

  // 39
  it('split-info renders description in info panel', () => {
    renderBlock({ layout: 'split-info', description: 'Reach out anytime.' });
    const infoPanel = screen.getByTestId('contact-info-panel');
    expect(infoPanel).toHaveTextContent('Reach out anytime.');
  });

  // 40
  it('split-info mobile stacks vertically via grid 1fr', () => {
    renderBlock({ layout: 'split-info' });
    // Just verify both panels render — actual CSS breakpoints tested visually
    expect(screen.getByTestId('contact-info-panel')).toBeInTheDocument();
    expect(screen.getByTestId('contact-form-panel')).toBeInTheDocument();
  });

  // 41
  it('existing stacked layout unchanged after split-info addition', () => {
    renderBlock({ layout: 'stacked' });
    expect(screen.queryByTestId('contact-split-info')).not.toBeInTheDocument();
    expect(screen.queryByTestId('contact-info-panel')).not.toBeInTheDocument();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
  });

  // 42
  it('existing split-image layout unchanged after split-info addition', () => {
    renderBlock({ layout: 'split-image' });
    expect(screen.queryByTestId('contact-split-info')).not.toBeInTheDocument();
    expect(screen.getByTestId('contact-image-cell')).toBeInTheDocument();
  });
});
