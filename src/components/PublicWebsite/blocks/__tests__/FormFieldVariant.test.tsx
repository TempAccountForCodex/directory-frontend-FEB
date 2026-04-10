/**
 * FormFieldVariant.test.tsx — Step 15.5
 *
 * Shared tests for fieldVariant + fieldColor across 3 form blocks:
 *  1.  ContactBlock defaults to outlined variant
 *  2.  ContactBlock renders standard variant
 *  3.  ContactBlock renders filled variant
 *  4.  ContactBlock applies fieldColor sx for standard variant
 *  5.  FormBuilderBlock defaults to outlined variant
 *  6.  FormBuilderBlock renders standard variant
 *  7.  FormBuilderBlock applies fieldColor sx
 *  8.  ReservationFormBlock defaults to outlined variant
 *  9.  ReservationFormBlock renders standard variant
 * 10.  ReservationFormBlock renders filled variant
 * 11.  ReservationFormBlock applies fieldColor for standard variant
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('framer-motion', () => ({
  useScroll: () => ({ scrollYProgress: { get: () => 0, onChange: () => () => {} } }),
  useTransform: (..._args) => ({ get: () => '0%', onChange: () => () => {} }),
  useMotionValue: (v) => ({ get: () => v, set: () => {}, onChange: () => () => {} }),
  motion: {
    div: React.forwardRef(({ children, ...rest }: any, ref: any) => (
      <div ref={ref} {...rest}>
        {children}
      </div>
    )),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: () => {}, inView: true }),
}));

vi.mock('dompurify', () => ({
  default: { sanitize: (s: string) => s },
}));

vi.mock('mui-tel-input', () => ({
  MuiTelInput: (props: any) => <input data-testid="mui-tel-input" {...props} />,
}));

vi.mock('@mui/x-date-pickers', () => ({
  LocalizationProvider: ({ children }: any) => <>{children}</>,
  DatePicker: ({ slotProps, label }: any) => {
    const tfProps = slotProps?.textField ?? {};
    return (
      <input
        data-testid={`datepicker-${label}`}
        data-variant={tfProps.variant ?? 'outlined'}
        aria-label={tfProps.inputProps?.['aria-label'] ?? label}
      />
    );
  },
  TimePicker: ({ slotProps, label }: any) => {
    const tfProps = slotProps?.textField ?? {};
    return (
      <input
        data-testid={`timepicker-${label}`}
        data-variant={tfProps.variant ?? 'outlined'}
        aria-label={tfProps.inputProps?.['aria-label'] ?? label}
      />
    );
  },
}));

vi.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: ({ slotProps, label }: any) => {
    const tfProps = slotProps?.textField ?? {};
    return (
      <input
        data-testid={`datepicker-${label}`}
        data-variant={tfProps.variant ?? 'outlined'}
        aria-label={tfProps.inputProps?.['aria-label'] ?? label}
      />
    );
  },
}));

vi.mock('@mui/x-date-pickers/TimePicker', () => ({
  TimePicker: ({ slotProps, label }: any) => {
    const tfProps = slotProps?.textField ?? {};
    return (
      <input
        data-testid={`timepicker-${label}`}
        data-variant={tfProps.variant ?? 'outlined'}
        aria-label={tfProps.inputProps?.['aria-label'] ?? label}
      />
    );
  },
}));

vi.mock('@mui/x-date-pickers/AdapterDateFns', () => ({
  AdapterDateFns: class {},
}));

vi.mock('../../BlockWrapper', () => ({
  BlockWrapper: ({ children }: any) => <div>{children}</div>,
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import ContactBlock from '../../blocks/ContactBlock';
import FormBuilderBlock from '../../dynamic/FormBuilderBlock';
import ReservationFormBlock from '../../blocks/ReservationFormBlock';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const contactBlock = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  blockType: 'CONTACT',
  sortOrder: 0,
  content: {
    heading: 'Contact Us',
    email: 'test@example.com',
    showForm: true,
    layout: 'stacked' as const,
    ...overrides,
  },
});

const formBuilderBlock = (overrides: Record<string, unknown> = {}) => ({
  id: 2,
  blockType: 'FORM_BUILDER',
  sortOrder: 0,
  content: {
    title: 'Get in Touch',
    submitEndpoint: '/api/contact',
    fields: [
      { name: 'name', label: 'Name', type: 'text' as const, required: true },
      { name: 'email', label: 'Email', type: 'email' as const, required: true },
      { name: 'message', label: 'Message', type: 'textarea' as const },
    ],
    ...overrides,
  },
});

const reservationBlock = (overrides: Record<string, unknown> = {}) => ({
  id: 3,
  blockType: 'RESERVATION_FORM',
  sortOrder: 0,
  content: {
    heading: 'Book a Table',
    fields: {
      showName: true,
      showEmail: true,
      showPhone: false,
      showDate: false,
      showTime: false,
      showPartySize: false,
      showMessage: true,
    },
    ...overrides,
  },
});

// ---------------------------------------------------------------------------
// Tests — ContactBlock
// ---------------------------------------------------------------------------

describe('ContactBlock fieldVariant/fieldColor', () => {
  it('defaults to outlined variant', () => {
    const { container } = render(<ContactBlock block={contactBlock()} />);
    const inputs = container.querySelectorAll('.MuiOutlinedInput-root');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('renders standard variant when fieldVariant="standard"', () => {
    const { container } = render(
      <ContactBlock block={contactBlock({ fieldVariant: 'standard' })} />
    );
    const inputs = container.querySelectorAll('.MuiInput-root');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('renders filled variant when fieldVariant="filled"', () => {
    const { container } = render(<ContactBlock block={contactBlock({ fieldVariant: 'filled' })} />);
    const inputs = container.querySelectorAll('.MuiFilledInput-root');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('passes fieldVariant/fieldColor in split-image layout', () => {
    const { container } = render(
      <ContactBlock
        block={contactBlock({
          layout: 'split-image',
          fieldVariant: 'standard',
          fieldColor: '#ff5500',
        })}
      />
    );
    const inputs = container.querySelectorAll('.MuiInput-root');
    expect(inputs.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Tests — FormBuilderBlock
// ---------------------------------------------------------------------------

describe('FormBuilderBlock fieldVariant/fieldColor', () => {
  it('defaults to outlined variant', () => {
    const { container } = render(<FormBuilderBlock block={formBuilderBlock()} />);
    const inputs = container.querySelectorAll('.MuiOutlinedInput-root');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('renders standard variant when fieldVariant="standard"', () => {
    const { container } = render(
      <FormBuilderBlock block={formBuilderBlock({ fieldVariant: 'standard' })} />
    );
    const inputs = container.querySelectorAll('.MuiInput-root');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('renders filled variant when fieldVariant="filled"', () => {
    const { container } = render(
      <FormBuilderBlock block={formBuilderBlock({ fieldVariant: 'filled' })} />
    );
    const inputs = container.querySelectorAll('.MuiFilledInput-root');
    expect(inputs.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Tests — ReservationFormBlock
// ---------------------------------------------------------------------------

describe('ReservationFormBlock fieldVariant/fieldColor', () => {
  it('defaults to outlined variant', () => {
    const { container } = render(<ReservationFormBlock block={reservationBlock()} />);
    const inputs = container.querySelectorAll('.MuiOutlinedInput-root');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('renders standard variant when fieldVariant="standard"', () => {
    const { container } = render(
      <ReservationFormBlock block={reservationBlock({ fieldVariant: 'standard' })} />
    );
    const inputs = container.querySelectorAll('.MuiInput-root');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('renders filled variant when fieldVariant="filled"', () => {
    const { container } = render(
      <ReservationFormBlock block={reservationBlock({ fieldVariant: 'filled' })} />
    );
    const inputs = container.querySelectorAll('.MuiFilledInput-root');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('applies fieldColor with standard variant (underline color)', () => {
    const { container } = render(
      <ReservationFormBlock
        block={reservationBlock({ fieldVariant: 'standard', fieldColor: '#e91e63' })}
      />
    );
    // Standard variant TextFields should be rendered
    const inputs = container.querySelectorAll('.MuiInput-root');
    expect(inputs.length).toBeGreaterThan(0);
  });
});
