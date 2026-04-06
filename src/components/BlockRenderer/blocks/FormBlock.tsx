import React from "react";
import type { BlockRendererProps } from "../types";
import { escapeHtml, escapeAttr } from "../utils";

interface FormContent {
  title?: string;
  description?: string;
  email?: string;
  phone?: string;
  submitText?: string;
}

const FormBlock: React.FC<BlockRendererProps> = ({ block }) => {
  const c = (block.content || {}) as FormContent;
  const title = c.title || "Contact Us";
  const submitText = c.submitText || "Send Message";
  const hasContactInfo = c.email || c.phone;

  return (
    <section
      className="block block--form block--contact"
      data-block-type="FORM"
    >
      <div className="form__inner">
        <h2
          className="form__title"
          dangerouslySetInnerHTML={{ __html: escapeHtml(title) }}
        />
        {c.description && (
          <p
            className="form__description"
            dangerouslySetInnerHTML={{ __html: escapeHtml(c.description) }}
          />
        )}
        {hasContactInfo && (
          <div className="form__contact-info">
            {c.email && (
              <a
                className="form__contact-link"
                href={`mailto:${escapeAttr(c.email)}`}
              >
                {escapeHtml(c.email)}
              </a>
            )}
            {c.email && c.phone && (
              <span className="form__contact-sep"> &middot; </span>
            )}
            {c.phone && (
              <a
                className="form__contact-link"
                href={`tel:${escapeAttr(c.phone)}`}
              >
                {escapeHtml(c.phone)}
              </a>
            )}
          </div>
        )}
        <form className="form__fields" aria-label={title}>
          <div className="form__field">
            <label className="form__label">Name</label>
            <input
              className="form__input"
              type="text"
              placeholder="Your name"
              disabled
            />
          </div>
          <div className="form__field">
            <label className="form__label">Email</label>
            <input
              className="form__input"
              type="email"
              placeholder="your@email.com"
              disabled
            />
          </div>
          <div className="form__field">
            <label className="form__label">Message</label>
            <textarea
              className="form__textarea"
              rows={4}
              placeholder="Your message..."
              disabled
            />
          </div>
          <button className="form__submit" type="button" disabled>
            {escapeHtml(submitText)}
          </button>
        </form>
      </div>
    </section>
  );
};

export default React.memo(FormBlock);
