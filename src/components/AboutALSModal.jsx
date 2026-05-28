import React, { useEffect } from "react";
import { GraduationCap, Route } from "lucide-react";
import {
  ABOUT_ALS_BENEFICIARIES,
  ABOUT_ALS_DELIVERY_POINTS,
  ABOUT_ALS_PROGRAMS,
} from "../constants/aboutAls";
import "./AboutALSModal.css";

const ABOUT_ALS_SECTION_IMAGES = {
  programs: {
    src: "/images_aboutals/als-program-areas.webp",
    alt: "Illustration showing ALS program areas and flexible learning resources",
    width: 960,
    height: 720,
  },
  learners: {
    src: "/images_aboutals/who-als-serves.webp",
    alt: "Illustration showing learner access, modules, and ALS learning support",
    width: 960,
    height: 720,
  },
  delivery: {
    src: "/images_aboutals/regional-delivery-points.webp",
    alt: "Illustration showing regional delivery points and data coordination",
    width: 960,
    height: 690,
  },
};

const AboutALSModal = ({ isOpen, onClose, inlineMode = false }) => {
  useEffect(() => {
    if (!isOpen || inlineMode) {
      return undefined;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [inlineMode, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const imageCards = Array.from(document.querySelectorAll(".about-als-image-card"));

    imageCards.forEach((card) => card.classList.remove("is-visible"));

    if (!("IntersectionObserver" in window)) {
      imageCards.forEach((card) => card.classList.add("is-visible"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.24,
      }
    );

    imageCards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const content = (
    <div
      className={`about-als-modal ${inlineMode ? "about-als-modal-inline" : ""}`}
      onClick={(event) => event.stopPropagation()}
      id="about-als-top"
    >
      <section className="about-als-hero" id="about-als-overview">
        <span className="section-kicker">Alternative Learning System</span>
        <h2>About ALS NCR</h2>
        <p>Program areas, learner groups, and regional delivery points for ALS implementation in NCR.</p>
      </section>

      <div className="about-als-walkthrough">
        <section className="about-als-step" id="about-als-programs">
          <div className="about-als-visual about-als-program-visual">
            <div className="about-als-image-card">
              <img
                src={ABOUT_ALS_SECTION_IMAGES.programs.src}
                alt={ABOUT_ALS_SECTION_IMAGES.programs.alt}
                width={ABOUT_ALS_SECTION_IMAGES.programs.width}
                height={ABOUT_ALS_SECTION_IMAGES.programs.height}
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>

          <div className="about-als-step-copy">
            <span className="about-als-step-number">01</span>
            <h3>ALS Program Areas</h3>
            <div className="about-als-program-list">
              {ABOUT_ALS_PROGRAMS.map((program) => (
                <article key={program.title}>
                  <strong>{program.title}</strong>
                  <p>{program.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="about-als-step about-als-step-reverse" id="about-als-learners">
          <div className="about-als-step-copy">
            <span className="about-als-step-number">02</span>
            <h3>Who ALS Serves</h3>
            <div className="about-als-learner-list">
              {ABOUT_ALS_BENEFICIARIES.map((item) => (
                <div key={item}>
                  <GraduationCap aria-hidden="true" />
                  <span>{item.replace(/\.$/, "")}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="about-als-visual about-als-learner-visual">
            <div className="about-als-image-card">
              <img
                src={ABOUT_ALS_SECTION_IMAGES.learners.src}
                alt={ABOUT_ALS_SECTION_IMAGES.learners.alt}
                width={ABOUT_ALS_SECTION_IMAGES.learners.width}
                height={ABOUT_ALS_SECTION_IMAGES.learners.height}
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </section>

        <section className="about-als-step" id="about-als-delivery">
          <div className="about-als-visual about-als-delivery-visual">
            <div className="about-als-image-card">
              <img
                src={ABOUT_ALS_SECTION_IMAGES.delivery.src}
                alt={ABOUT_ALS_SECTION_IMAGES.delivery.alt}
                width={ABOUT_ALS_SECTION_IMAGES.delivery.width}
                height={ABOUT_ALS_SECTION_IMAGES.delivery.height}
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>

          <div className="about-als-step-copy">
            <span className="about-als-step-number">03</span>
            <h3>Regional Delivery Points</h3>
            <div className="about-als-delivery-list">
              {ABOUT_ALS_DELIVERY_POINTS.map((item) => (
                <div key={item}>
                  <Route aria-hidden="true" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );

  if (inlineMode) {
    return content;
  }

  return <div className="modal-overlay" onClick={onClose}>{content}</div>;
};

export default AboutALSModal;
