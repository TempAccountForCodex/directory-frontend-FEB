/**
 * BlockRenderer CSS Styles
 *
 * Matches backend previewService._getGlobalStyles() and _getBlockStyles() exactly.
 * These styles are embedded in PreviewRenderer for iframe rendering.
 */

export function getGlobalStyles(viewportWidth: string): string {
  return `/* Global Reset & Base */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { font-size: 16px; -webkit-text-size-adjust: 100%; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 1rem;
      line-height: 1.6;
      color: #1a1a1a;
      background: #ffffff;
    }
    img, video { max-width: 100%; height: auto; display: block; }
    a { color: inherit; text-decoration: none; }
    ul, ol { list-style: none; }
    .preview-wrapper { width: 100%; max-width: ${viewportWidth}; overflow-x: hidden; }
    .block { width: 100%; }`;
}

export function getBlockStyles(): string {
  return `/* Hero Block */
    .block--hero { padding: 80px 24px; text-align: center; background: #f8f9fa; }
    .hero__inner { max-width: 800px; margin: 0 auto; }
    .hero__heading { font-size: 2.5rem; font-weight: 700; line-height: 1.2; margin-bottom: 16px; }
    .hero__subheading { font-size: 1.25rem; color: #555; margin-bottom: 32px; }
    .hero__cta { display: inline-block; padding: 14px 32px; background: #4f46e5; color: #fff; border-radius: 8px; font-weight: 600; font-size: 1rem; }

    /* Text Block */
    .block--text { padding: 60px 24px; }
    .text__inner { max-width: 800px; margin: 0 auto; }
    .text__title { font-size: 2rem; font-weight: 700; margin-bottom: 16px; }
    .text__body { font-size: 1rem; line-height: 1.8; color: #444; }

    /* Image Block */
    .block--image { padding: 40px 24px; }
    .image__figure { margin: 0 auto; }
    .image__figure--full { width: 100%; }
    .image__figure--large { max-width: 900px; }
    .image__figure--medium { max-width: 600px; }
    .image__figure--small { max-width: 300px; }
    .image__img { width: 100%; border-radius: 4px; }
    .image__caption { margin-top: 8px; font-size: 0.875rem; color: #777; text-align: center; }

    /* Form / Contact Block */
    .block--form { padding: 60px 24px; background: #f8f9fa; }
    .form__inner { max-width: 600px; margin: 0 auto; }
    .form__title { font-size: 2rem; font-weight: 700; margin-bottom: 16px; }
    .form__description { color: #555; margin-bottom: 24px; }
    .form__contact-info { margin-bottom: 24px; font-size: 0.9rem; color: #666; }
    .form__field { margin-bottom: 16px; }
    .form__label { display: block; font-weight: 600; margin-bottom: 4px; font-size: 0.875rem; }
    .form__input, .form__textarea { width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 1rem; background: #fff; color: #333; }
    .form__textarea { resize: vertical; }
    .form__submit { display: inline-block; padding: 12px 28px; background: #4f46e5; color: #fff; border: none; border-radius: 6px; font-size: 1rem; font-weight: 600; cursor: default; }

    /* Gallery Block */
    .block--gallery { padding: 60px 24px; }
    .gallery__inner { max-width: 1200px; margin: 0 auto; }
    .gallery__title { font-size: 2rem; font-weight: 700; margin-bottom: 32px; text-align: center; }
    .gallery__grid { display: grid; gap: 16px; }
    .gallery__grid--cols-2 { grid-template-columns: repeat(2, 1fr); }
    .gallery__grid--cols-3 { grid-template-columns: repeat(3, 1fr); }
    .gallery__grid--cols-4 { grid-template-columns: repeat(4, 1fr); }
    .gallery__item { margin: 0; }
    .gallery__img { width: 100%; aspect-ratio: 4/3; object-fit: cover; border-radius: 4px; }
    .gallery__caption { font-size: 0.8rem; color: #777; text-align: center; margin-top: 6px; }

    /* CTA Block */
    .block--cta { padding: 80px 24px; background: #4f46e5; color: #fff; text-align: center; }
    .cta__inner { max-width: 700px; margin: 0 auto; }
    .cta__heading { font-size: 2.25rem; font-weight: 700; margin-bottom: 16px; }
    .cta__subheading { font-size: 1.125rem; margin-bottom: 32px; opacity: 0.9; }
    .cta__buttons { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
    .cta__btn { display: inline-block; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 1rem; }
    .cta__btn--primary { background: #fff; color: #4f46e5; }
    .cta__btn--secondary { background: transparent; color: #fff; border: 2px solid rgba(255,255,255,0.6); }

    /* Testimonials Block */
    .block--testimonials { padding: 60px 24px; }
    .testimonials__inner { max-width: 1100px; margin: 0 auto; }
    .testimonials__title { font-size: 2rem; font-weight: 700; margin-bottom: 40px; text-align: center; }
    .testimonials__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
    .testimonial__card { background: #f8f9fa; border-radius: 12px; padding: 28px; display: flex; flex-direction: column; gap: 16px; }
    .testimonial__avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; }
    .testimonial__avatar--placeholder { display: flex; align-items: center; justify-content: center; background: #4f46e5; color: #fff; font-weight: 700; font-size: 1.125rem; }
    .testimonial__quote { font-size: 0.95rem; color: #444; line-height: 1.7; flex: 1; }
    .testimonial__author { font-weight: 700; font-style: normal; display: block; }
    .testimonial__role { font-size: 0.8rem; color: #777; }

    /* Features Block */
    .block--features { padding: 60px 24px; }
    .features__inner { max-width: 1100px; margin: 0 auto; }
    .features__title { font-size: 2rem; font-weight: 700; margin-bottom: 12px; text-align: center; }
    .features__subtitle { color: #555; text-align: center; margin-bottom: 40px; }
    .features__grid { display: grid; gap: 24px; }
    .features__grid--cols-2 { grid-template-columns: repeat(2, 1fr); }
    .features__grid--cols-3 { grid-template-columns: repeat(3, 1fr); }
    .features__grid--cols-4 { grid-template-columns: repeat(4, 1fr); }
    .feature__card { padding: 28px; background: #f8f9fa; border-radius: 12px; }
    .feature__icon { font-size: 2rem; margin-bottom: 12px; }
    .feature__title { font-size: 1.125rem; font-weight: 700; margin-bottom: 8px; }
    .feature__desc { font-size: 0.9rem; color: #666; line-height: 1.6; }

    /* Default / Unknown Block */
    .block--default { padding: 16px 24px; }`;
}
