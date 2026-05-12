import { describe, expect, it } from 'vitest';
import { getSectionStyleSx } from '../sectionStyle';

describe('getSectionStyleSx', () => {
  it('returns an empty object when section style is missing', () => {
    expect(getSectionStyleSx({ heading: 'Hello' })).toEqual({});
  });

  it('maps background and spacing values into sx props', () => {
    expect(
      getSectionStyleSx({
        sectionStyle: {
          backgroundColor: '#f8fafc',
          backgroundImageUrl: 'https://example.com/hero.jpg',
          paddingTop: '24px',
          paddingBottom: '48px',
          marginTop: '16px',
          marginBottom: '32px',
        },
      })
    ).toEqual({
      backgroundColor: '#f8fafc',
      backgroundImage: 'url(https://example.com/hero.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      paddingTop: '24px',
      paddingBottom: '48px',
      marginTop: '16px',
      marginBottom: '32px',
    });
  });
});
