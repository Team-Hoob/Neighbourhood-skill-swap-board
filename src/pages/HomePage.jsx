import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

/* ── Tiny hook: fires once when element enters viewport ── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ── Mock recent skills for the floating cards ── */
const PREVIEW_SKILLS = [
  { id:1, type:'offer', name:'Ananya S.', neighbourhood:'Bandra', desc:'Python & data science tutoring', category:'Tech', emoji:'💻' },
  { id:2, type:'need',  name:'Rohan M.', neighbourhood:'Powai', desc:'Someone to fix my leaky tap', category:'Home', emoji:'🔧' },
  { id:3, type:'offer', name:'Priya K.', neighbourhood:'Juhu',  desc:'Classical guitar lessons', category:'Music', emoji:'🎸' },
  { id:4, type:'need',  name:'Dev P.',   neighbourhood:'Andheri', desc:'Help designing my resume', category:'Creative', emoji:'🎨' },
  { id:5, type:'offer', name:'Meera T.', neighbourhood:'Dadar', desc:'Tamil & Hindi language exchange', category:'Language', emoji:'🗣️' },
  { id:6, type:'need',  name:'Arjun R.', neighbourhood:'Worli', desc:'Yoga or meditation classes', category:'Health', emoji:'🧘' },
];

const STEPS = [
  {
    number: '01',
    title: 'Post what you offer',
    desc: 'Share a skill you have — coding, cooking, music, repairs, languages. Anything counts.',
    icon: '📌',
  },
  {
    number: '02',
    title: 'Post what you need',
    desc: 'Tell us what you\'re looking for. Our AI reads plain English, no categories needed.',
    icon: '🔍',
  },
  {
    number: '03',
    title: 'AI finds your match',
    desc: 'Our NLP engine finds neighbours where you can help each other — even with different words.',
    icon: '⚡',
  },
  {
    number: '04',
    title: 'Exchange & grow',
    desc: 'Connect, meet up, swap skills. No money changes hands — just community goodwill.',
    icon: '🤝',
  },
];

const STATS = [
  { value: '2,400+', label: 'Skills posted' },
  { value: '840+',   label: 'Matches made' },
  { value: '30+',    label: 'Neighbourhoods' },
  { value: '98%',    label: 'Match satisfaction' },
];

/* ════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════ */
export default function HomePage() {
  const [heroRef, heroVisible]   = useInView(0.1);
  const [stepsRef, stepsVisible] = useInView(0.1);
  const [cardsRef, cardsVisible] = useInView(0.1);
  const [statsRef, statsVisible] = useInView(0.2);
  const [ctaRef,   ctaVisible]   = useInView(0.2);

  return (
    <div className="home">

      {/* ══════════ HERO ══════════ */}
      <section className="hero" ref={heroRef}>
        {/* Background texture blobs */}
        <div className="hero__blob hero__blob--1" aria-hidden="true" />
        <div className="hero__blob hero__blob--2" aria-hidden="true" />
        <div className="hero__blob hero__blob--3" aria-hidden="true" />

        <div className="container hero__inner">
          {/* Left: copy */}
          <div className={`hero__copy ${heroVisible ? 'hero__copy--visible' : ''}`}>
            <div className="hero__eyebrow">
              <span className="hero__eyebrow-dot" />
              AI-powered skill exchange
            </div>

            <h1 className="hero__headline">
              Your neighbours have<br />
              skills you <em>need.</em>
              <br />
              <span className="hero__headline-accent">You have skills they need.</span>
            </h1>

            <p className="hero__sub">
              SkillSwap connects people in your neighbourhood through mutual skill exchange —
              no money, no apps, just community. Our AI finds perfect matches even when
              you describe things differently.
            </p>

            <div className="hero__actions">
              <Link to="/register" className="btn btn--primary btn--lg">
                Get started free
                <span className="btn__arrow">→</span>
              </Link>
              <Link to="/board" className="btn btn--ghost btn--lg">
                Browse skills
              </Link>
            </div>

            <div className="hero__trust">
              <div className="hero__avatars">
                {['A','R','P','D','M'].map((l,i) => (
                  <div key={i} className="hero__avatar" style={{ '--i': i }}>{l}</div>
                ))}
              </div>
              <p className="hero__trust-text">
                <strong>840+ matches</strong> made in Mumbai alone
              </p>
            </div>
          </div>

          {/* Right: floating skill cards */}
          <div className={`hero__cards ${heroVisible ? 'hero__cards--visible' : ''}`} aria-hidden="true">
            <div className="hero__card hero__card--1">
              <span className="hero__card-emoji">💻</span>
              <div>
                <p className="hero__card-label offer">Offering</p>
                <p className="hero__card-text">Python tutoring</p>
                <p className="hero__card-meta">Ananya · Bandra</p>
              </div>
            </div>
            <div className="hero__card hero__card--2">
              <span className="hero__card-emoji">🎸</span>
              <div>
                <p className="hero__card-label offer">Offering</p>
                <p className="hero__card-text">Guitar lessons</p>
                <p className="hero__card-meta">Priya · Juhu</p>
              </div>
            </div>
            <div className="hero__card hero__card--3">
              <span className="hero__card-emoji">🔧</span>
              <div>
                <p className="hero__card-label need">Needs</p>
                <p className="hero__card-text">Home repairs</p>
                <p className="hero__card-meta">Rohan · Powai</p>
              </div>
            </div>
            {/* Match badge */}
            <div className="hero__match-badge">
              <span>⚡</span>
              <div>
                <p className="hero__match-title">Match found!</p>
                <p className="hero__match-sub">92% compatibility</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="hero__scroll" aria-hidden="true">
          <div className="hero__scroll-line" />
          <span>scroll</span>
        </div>
      </section>

      {/* ══════════ STATS STRIP ══════════ */}
      <section className="stats" ref={statsRef}>
        <div className="container stats__inner">
          {STATS.map(({ value, label }, i) => (
            <div
              key={label}
              className={`stats__item ${statsVisible ? 'stats__item--visible' : ''}`}
              style={{ '--delay': `${i * 80}ms` }}
            >
              <span className="stats__value">{value}</span>
              <span className="stats__label">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section className="steps" ref={stepsRef}>
        <div className="container">
          <div className={`section-header ${stepsVisible ? 'section-header--visible' : ''}`}>
            <p className="section-eyebrow">Simple as 1-2-3-4</p>
            <h2 className="section-title">How SkillSwap works</h2>
            <p className="section-sub">
              Post your skills, let our AI do the matching, then connect with neighbours.
            </p>
          </div>

          <div className={`steps__grid ${stepsVisible ? 'steps__grid--visible' : ''}`}>
            {STEPS.map(({ number, title, desc, icon }, i) => (
              <div
                key={number}
                className="step-card"
                style={{ '--delay': `${i * 100}ms` }}
              >
                <div className="step-card__number">{number}</div>
                <div className="step-card__icon">{icon}</div>
                <h3 className="step-card__title">{title}</h3>
                <p className="step-card__desc">{desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="step-card__connector" aria-hidden="true">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ SKILL PREVIEW ══════════ */}
      <section className="preview" ref={cardsRef}>
        <div className="container">
          <div className={`section-header ${cardsVisible ? 'section-header--visible' : ''}`}>
            <p className="section-eyebrow">Live on the board</p>
            <h2 className="section-title">Skills in your neighbourhood</h2>
            <p className="section-sub">
              A live glimpse at what people are offering and looking for right now.
            </p>
          </div>

          <div className={`preview__grid ${cardsVisible ? 'preview__grid--visible' : ''}`}>
            {PREVIEW_SKILLS.map((skill, i) => (
              <div
                key={skill.id}
                className={`preview-card preview-card--${skill.type}`}
                style={{ '--delay': `${i * 80}ms` }}
              >
                <div className="preview-card__top">
                  <span className={`preview-card__badge preview-card__badge--${skill.type}`}>
                    {skill.type === 'offer' ? '● Offering' : '○ Needs'}
                  </span>
                  <span className="preview-card__emoji">{skill.emoji}</span>
                </div>
                <p className="preview-card__desc">{skill.desc}</p>
                <div className="preview-card__footer">
                  <span className="preview-card__name">{skill.name}</span>
                  <span className="preview-card__neighbourhood">📍 {skill.neighbourhood}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="preview__cta">
            <Link to="/board" className="btn btn--outline btn--lg">
              View all skills on the board →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════ AI FEATURE CALLOUT ══════════ */}
      <section className="ai-section">
        <div className="container ai-section__inner">
          <div className="ai-section__visual" aria-hidden="true">
            <div className="ai-bubble ai-bubble--a">
              <span>🎯</span> "I teach maths"
            </div>
            <div className="ai-bubble ai-bubble--b">
              <span>🔗</span> 92% match
            </div>
            <div className="ai-bubble ai-bubble--c">
              <span>📚</span> "Need math tutoring"
            </div>
            <div className="ai-line" />
          </div>
          <div className="ai-section__copy">
            <p className="section-eyebrow">Powered by NLP</p>
            <h2 className="section-title">AI that understands <em>meaning,</em> not just keywords</h2>
            <p className="section-sub">
              "Maths teaching" and "math tutoring" — our engine knows they're the same thing.
              Using sentence embeddings, SkillSwap matches people even when they describe skills differently,
              in any language or dialect.
            </p>
            <ul className="ai-section__list">
              {[
                'Semantic matching — beyond exact keywords',
                'Mutual match scoring — both sides benefit',
                'Ranked by compatibility — best matches first',
              ].map(item => (
                <li key={item} className="ai-section__list-item">
                  <span className="ai-section__check">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ══════════ FINAL CTA ══════════ */}
      <section className="cta-section" ref={ctaRef}>
        <div className={`cta-section__inner ${ctaVisible ? 'cta-section__inner--visible' : ''}`}>
          <div className="cta-section__bg" aria-hidden="true" />
          <div className="container cta-section__content">
            <h2 className="cta-section__title">
              Ready to swap skills<br />with your neighbourhood?
            </h2>
            <p className="cta-section__sub">
              Join hundreds of people already exchanging skills across Mumbai.
              It's free, it's local, it's community.
            </p>
            <div className="cta-section__actions">
              <Link to="/register" className="btn btn--white btn--lg">
                Create your free account →
              </Link>
              <Link to="/board" className="btn btn--ghost-white btn--lg">
                Explore the board
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
