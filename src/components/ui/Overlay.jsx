import React, { useState } from 'react';

// ─────────────────────────────────────────────────────────────
// Shared stagger-fade wrapper
// ─────────────────────────────────────────────────────────────
function Fade({ show, delay = 0, children, style = {} }) {
  return (
    <div style={{
      opacity: show ? 1 : 0,
      transform: show ? 'translateY(0px) scale(1)' : 'translateY(12px) scale(0.96)',
      transition: `opacity 0.9s ease ${delay}s, transform 0.95s cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}s`,
      pointerEvents: show ? 'all' : 'none',
      ...style,
    }}>
      {children}
    </div>
  );
}

const Label = ({ children }) => (
  <p style={{
    fontFamily: 'var(--font-body)',
    fontSize: '8px',
    letterSpacing: '0.4em',
    color: 'rgba(255,255,255,0.22)',
    marginBottom: '16px',
    textTransform: 'uppercase',
  }}>
    {children}
  </p>
);

// ══════════════════════════════════════════════════════════════
// LANDING  —  CENTERED, cinematic, cat as full backdrop
// ══════════════════════════════════════════════════════════════
function LandingOverlay({ show }) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>

      {/* Micro WOW flash backdrop */}
      <div style={{
        position: 'absolute', inset: 0,
        background: '#020202',
        pointerEvents: 'none',
        opacity: 0,
        zIndex: -1,
        animation: show ? 'noviq-micro-flash 1.4s ease-out 0.4s forwards' : 'none',
      }} />

      {/* ── Bottom-center hero block: anchored below the 3D cat ─── */}
      <div style={{
        position: 'absolute',
        bottom: 58, left: 0, right: 0, // moved down slightly to separate more from cat
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        {/* Eyebrow with bilateral rules for symmetry */}
        <Fade show={show} delay={0.1}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.22)' }} />
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 8.5, letterSpacing: '0.46em',
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
            }}>Noviq Labs</span>
            <div style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.22)' }} />
          </div>
        </Fade>

        {/* Hero headline — centered, pure premium typography */}
        <h1 style={{
          fontFamily: 'var(--font-hero)',
          fontSize: 'clamp(36px, 5.5vw, 68px)',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase', // Syncopate looks sick in purely ALL CAPS
          color: '#ffffff',
          margin: 0,
          display: 'flex',
          gap: '0.36em',
          justifyContent: 'center',
          textShadow: '0 0 20px rgba(255,255,255,0.08), 3px 5px 12px rgba(0,0,0,0.8), -2px -2px 0px rgba(0,0,0,0.8)',
          WebkitTextStroke: '1.2px rgba(255,255,255,0.25)',
        }}>
          {["Building", "What's", "Next."].map((word, i) => (
            <Fade key={i} show={show} delay={0.45 + (i * 0.18)} style={{ display: 'inline-block' }}>
              {word}
            </Fade>
          ))}
        </h1>

        {/* Tagline */}
        <Fade show={show} delay={1.05}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 9.5, fontWeight: 300,
            letterSpacing: '0.3em',
            color: 'rgba(255,255,255,0.15)',
            margin: '18px 0 0',
            textAlign: 'center',
            textTransform: 'uppercase',
          }}>Smart.&nbsp;&nbsp;Scalable.&nbsp;&nbsp;Practical.</p>
        </Fade>
      </div>

      {/* Scroll indicator — bottom right */}
      <Fade show={show} delay={1.2}>
        <div style={{
          position: 'absolute', bottom: 48, right: 52,
          display: 'flex', alignItems: 'center', gap: 9,
        }}>
          <div style={{ width: 1, height: 22, background: 'linear-gradient(to bottom, rgba(255,255,255,0.28), transparent)' }} />
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: 7.5, letterSpacing: '0.4em',
            color: 'rgba(255,255,255,0.2)',
            textTransform: 'uppercase',
          }}>Scroll</span>
        </div>
      </Fade>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ABOUT  —  right glass panel
// ══════════════════════════════════════════════════════════════
function AboutOverlay({ show }) {
  return (
    <div style={{
      position: 'absolute',
      top: '50%', right: 52,
      transform: 'translateY(-50%)',
      width: 300,
      pointerEvents: 'none',
    }}>
      <Fade show={show}>
        <div style={{
          borderRadius: 9,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(5,5,7,0.82)',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
        }}>
          {/* Accent bar */}
          <div style={{
            height: 2,
            background: 'linear-gradient(to right, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 60%, transparent 100%)',
          }} />

          <div style={{ padding: '28px 28px 28px' }}>
            <Label>00 // About</Label>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 18, fontWeight: 700,
              letterSpacing: '0.07em',
              color: '#fff', marginBottom: 14,
            }}>NOVIQ LABS</h2>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 11.5, lineHeight: 1.95,
              color: 'rgba(255,255,255,0.45)',
              fontWeight: 300, marginBottom: 24,
            }}>
              A newly launched engineering studio building custom software,
              ERP systems, SaaS platforms, and IoT solutions.
              We partner with startups and businesses to ship real products fast.
            </p>
            <div style={{
              display: 'flex', gap: 0,
              paddingTop: 18,
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }}>
              {[['2026', 'Founded'], ['12+', 'Builds'], ['5', 'Core Team']].map(([val, lbl], i) => (
                <div key={lbl} style={{
                  flex: 1,
                  paddingLeft: i > 0 ? 16 : 0,
                  borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#fff' }}>{val}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 7.5, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.22)', marginTop: 4, textTransform: 'uppercase' }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Fade>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════
// SERVICES  —  Solar system layout
// ══════════════════════════════════════════════════════════════
const SYSTEM_NODES = [
  { n: '01', title: 'Custom\nSoftware', sub: 'From idea to product', r: 140, period: 22, startDeg: 0 },
  { n: '02', title: 'ERP\nSolutions', sub: 'Enterprise systems', r: 178, period: 31, startDeg: 72 },
  { n: '03', title: 'SaaS\nProducts', sub: 'Subscription cloud apps', r: 248, period: 40, startDeg: 148 },
  { n: '04', title: 'IoT &\nAutomation', sub: 'Connected devices & edge', r: 199, period: 27, startDeg: 224 },
  { n: '05', title: 'Hardware\nPrototype', sub: 'Embedded & PCB builds', r: 225, period: 36, startDeg: 308 },
];
// Unique radii for orbit rings (deduplicated + sorted)
const ORBIT_RINGS = [...new Set(SYSTEM_NODES.map(n => n.r))].sort((a, b) => a - b);

function OrbitNode({ node, show, isActive, isDimmed, onHoverStart, onHoverEnd }) {
  const delay = -((node.startDeg / 360) * node.period);
  const sz = isActive ? 108 : isDimmed ? 52 : 66;

  return (
    // Orbit arm — rotates around system center
    <div style={{
      position: 'absolute', top: 0, left: 0,
      width: 0, height: 0,
      animation: `noviq-orbit ${node.period}s linear infinite`,
      animationDelay: `${delay}s`,
      // PAUSE when this node is focused — freezes position perfectly
      animationPlayState: isActive ? 'paused' : 'running',
    }}>
      {/* Connection line — drawn INSIDE the paused orbit arm so it always
          extends from center (0,0) to node position (+r on x-axis).
          Only visible when active; since arm is paused it points at node. */}
      {isActive && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0,
          width: node.r,
          height: 1,
          background: 'linear-gradient(to right, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.12) 65%, transparent 100%)',
          pointerEvents: 'none',
          transformOrigin: 'left center',
        }} />
      )}

      {/* Counter-rotate wrapper — undoes the arm rotation so node stays upright */}
      <div style={{
        position: 'absolute',
        top: 0, left: node.r,
        animation: `noviq-counter ${node.period}s linear infinite`,
        animationDelay: `${delay}s`,
        animationPlayState: isActive ? 'paused' : 'running',
        pointerEvents: 'none',
      }}>
        {/* Node visual */}
        <div
          onMouseEnter={onHoverStart}
          onMouseLeave={onHoverEnd}
          style={{
            position: 'absolute',
            width: sz, height: sz,
            top: 0, left: 0,
            marginTop: -sz / 2, marginLeft: -sz / 2,
            borderRadius: '50%',
            border: `1px solid rgba(255,255,255,${isActive ? 0.3 : isDimmed ? 0.05 : 0.12})`,
            background: isActive
              ? 'rgba(4,4,7,0.98)'
              : isDimmed ? 'rgba(4,4,6,0.55)' : 'rgba(4,4,6,0.94)',
            backdropFilter: `blur(${isActive ? 22 : 16}px)`,
            WebkitBackdropFilter: `blur(${isActive ? 22 : 16}px)`,
            boxShadow: isActive
              ? '0 0 28px rgba(255,255,255,0.06), 0 0 0 1px rgba(255,255,255,0.05)'
              : 'none',
            opacity: isDimmed ? 0.3 : 1,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', padding: '0 9px',
            transition: 'all 0.42s cubic-bezier(0.25,0.46,0.45,0.94)',
            cursor: 'default',
            pointerEvents: show ? 'all' : 'none',
          }}
        >
          {/* Node index */}
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: isActive ? 8 : 6.5, letterSpacing: '0.28em',
            color: `rgba(255,255,255,${isActive ? 0.4 : 0.22})`,
            display: 'block', marginBottom: 4,
            transition: 'color 0.3s ease',
          }}>{node.n}</span>

          {/* Node title */}
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: isActive ? 10.5 : isDimmed ? 6 : 8,
            fontWeight: 700, letterSpacing: '0.04em',
            color: `rgba(255,255,255,${isActive ? 0.97 : isDimmed ? 0.38 : 0.82})`,
            lineHeight: 1.25, whiteSpace: 'pre-line',
            transition: 'font-size 0.35s ease, color 0.35s ease',
          }}>{node.title}</span>

          {/* Sub description — only shown when focused */}
          <div style={{
            maxHeight: isActive ? '30px' : '0px',
            overflow: 'hidden',
            opacity: isActive ? 1 : 0,
            transition: 'max-height 0.38s ease, opacity 0.3s ease 0.1s',
            marginTop: isActive ? 6 : 0,
          }}>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 7, letterSpacing: '0.08em',
              color: 'rgba(255,255,255,0.42)',
            }}>{node.sub}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ServicesOverlay({ show }) {
  const [activeNode, setActiveNode] = useState(null);
  // Delayed core reveal — wait exclusively for 3D circle pixels to finish settling
  const [showCore, setShowCore] = useState(false);
  React.useEffect(() => {
    if (show) {
      const t = setTimeout(() => setShowCore(true), 2400);
      return () => clearTimeout(t);
    } else {
      setShowCore(false);
    }
  }, [show]);

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>

      {/* Section label — top-left */}
      <div style={{
        position: 'absolute', top: 52, left: 52,
        opacity: show ? 1 : 0,
        transition: 'opacity 0.6s ease',
      }}>
        <Label>02 // Services</Label>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 12, fontWeight: 700,
          letterSpacing: '0.14em',
          color: 'rgba(255,255,255,0.35)', margin: 0,
        }}>CAPABILITIES</h2>
      </div>

      {/* Background dim — deepens when a node is focused (dims 3D canvas behind) */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `rgba(0,0,0,${show && activeNode ? 0.22 : 0})`,
        transition: 'background 0.48s ease',
        pointerEvents: 'none',
      }} />

      {/* System interface — centered exactly */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        width: 0, height: 0,
        opacity: show ? 1 : 0,
        transition: 'opacity 0.9s ease 0.2s',
      }}>
        {/* Orbit rings — slightly dimmed so cat is visually dominant */}
        {SYSTEM_NODES.map((node) => (
          <div key={node.n} style={{
            position: 'absolute',
            width: node.r * 2, height: node.r * 2,
            top: -node.r, left: -node.r,
            borderRadius: '50%',
            border: activeNode === node.n
              ? '1px solid rgba(255,255,255,0.18)'
              : '1px solid rgba(255,255,255,0.055)',
            boxShadow: activeNode === node.n
              ? '0 0 12px rgba(255,255,255,0.04)'
              : 'none',
            transition: 'border-color 0.42s ease, box-shadow 0.42s ease',
            pointerEvents: 'none',
          }} />
        ))}

        {/* System core — DOMINANT cat SVG, emerges after orbit rings stabilize */}
        <div style={{
          position: 'absolute',
          width: 160, height: 160,
          top: -80, left: -80,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <img
            src="/assets/svgviewer-output.svg"
            alt="Noviq Labs"
            style={{
              width: 140, height: 140,
              objectFit: 'contain',
              filter: 'brightness(0) invert(1)',
              opacity: showCore ? 1 : 0,
              transform: showCore ? 'scale(1)' : 'scale(0.85)',
              transition: 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
          />
        </div>

        {/* Service nodes — orbit the core */}
        {SYSTEM_NODES.map((node) => (
          <OrbitNode
            key={node.n}
            node={node}
            show={show}
            isActive={activeNode === node.n}
            isDimmed={activeNode !== null && activeNode !== node.n}
            onHoverStart={() => setActiveNode(node.n)}
            onHoverEnd={() => setActiveNode(null)}
          />
        ))}

        {/* CTA — anchored below system center, appears after cat reveal */}
        <div style={{
          position: 'absolute',
          top: 258, left: '50%',
          transform: 'translateX(-50%)',
          opacity: show && showCore ? 1 : 0,
          transition: 'opacity 0.9s ease 0.4s',
          pointerEvents: show && showCore ? 'all' : 'none',
          whiteSpace: 'nowrap',
        }}>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('noviq-goto', { detail: 4 }))}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateX(-50%) scale(1.06)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
              e.currentTarget.style.boxShadow = '0 0 22px rgba(255,255,255,0.09)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.95)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateX(-50%) scale(1)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
            }}
            style={{
              position: 'relative',
              left: '-50%',
              padding: '9px 26px',
              background: 'rgba(4,4,6,0.88)',
              border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: 30,
              color: 'rgba(255,255,255,0.55)',
              fontFamily: 'var(--font-display)',
              fontSize: 8.5, letterSpacing: '0.26em',
              fontWeight: 700, textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.32s ease',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >Start a Project →</button>
        </div>
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════
// TEAM  —  real B&W photo cards, premium founder layout
// ══════════════════════════════════════════════════════════════
const MEMBERS = [
  { name: 'Thomas Joseph', shortName: 'Thomas', title: 'Co-Founder & CCO', role: 'CCO', desc: 'Client relations & strategy', img: 'thomas.jpg' },
  { name: 'Aeljin Mathews', shortName: 'Aeljin', title: 'Co-Founder & COO', role: 'COO', desc: 'Operations & product direction', img: 'aeljin.jpg' },
  { name: 'Harikrishnan J', shortName: 'Hari', title: 'Founder & CEO', role: 'CEO', desc: 'Visionary & engineering lead', img: 'hari.jpg' },
  { name: 'Febin Jince', shortName: 'Febin', title: 'Co-Founder & CFO', role: 'CFO', desc: 'Finance & business development', img: 'febin.jpg' },
  { name: 'Joe Jose', shortName: 'Joe', title: 'CTO', role: 'CTO', desc: 'Hardware & embedded systems', img: 'joe.jpg' },
];

function TeamCard({ member, idx, show }) {
  const [hovered, setHovered] = useState(false);
  const floatDelay = idx * 0.65;

  return (
    /* No Fade wrapper — avoid CSS transform containing-block bug.
       Opacity + float are managed directly. */
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flexShrink: 0,
        width: 148,
        opacity: show ? 1 : 0,
        transform: hovered
          ? 'scale(1.045) translateY(-5px)'
          : `translateY(0px)`,
        transition: `opacity 0.65s ease ${0.1 + idx * 0.1}s, transform 0.42s cubic-bezier(0.25,0.46,0.45,0.94)`,
        animation: show ? `team-float ${4.0 + idx * 0.4}s ease-in-out ${floatDelay}s infinite` : 'none',
        cursor: 'default',
      }}
    >
      {/* Photo card */}
      <div style={{
        width: 148, height: 185,
        borderRadius: 10,
        overflow: 'hidden',
        border: `1px solid rgba(255,255,255,${hovered ? 0.16 : 0.06})`,
        position: 'relative',
        background: '#090909',
        boxShadow: hovered
          ? '0 24px 60px rgba(0,0,0,0.9), 0 0 28px rgba(255,255,255,0.04)'
          : '0 6px 24px rgba(0,0,0,0.6)',
        transition: 'border-color 0.38s ease, box-shadow 0.38s ease',
      }}>
        {/* B&W photo */}
        <img
          src={`/assets/team/${member.img}?v=3`}
          alt={member.name}
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition: member.shortName === 'Hari' ? 'center 35%' : 'top center',
            filter: hovered
              ? 'grayscale(100%) contrast(1.15) brightness(0.85)'
              : 'grayscale(100%) contrast(1.20) brightness(0.95)',
            transform: hovered ? 'scale(1.07)' : 'scale(1)',
            transition: 'transform 0.48s cubic-bezier(0.25,0.46,0.45,0.94), filter 0.4s ease',
            display: 'block',
          }}
        />

        {/* Bottom gradient for name legibility */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 80,
          background: 'linear-gradient(to top, rgba(4,4,5,0.96) 0%, rgba(4,4,5,0.5) 55%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        {/* Hover overlay: dims + shows role */}
        <div style={{
          position: 'absolute', inset: 0,
          background: hovered ? 'rgba(0,0,0,0.42)' : 'rgba(0,0,0,0)',
          transition: 'background 0.38s ease',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column',
          pointerEvents: 'none',
        }}>
          <div style={{
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translateY(0)' : 'translateY(6px)',
            transition: 'opacity 0.32s ease 0.06s, transform 0.32s ease 0.06s',
            textAlign: 'center', padding: '0 10px',
          }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 18, fontWeight: 900,
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.85)',
              marginBottom: 5,
            }}>{member.role}</div>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: 8, letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.42)',
            }}>{member.desc}</div>
          </div>
        </div>

        {/* Top accent line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background: `linear-gradient(to right, transparent, rgba(255,255,255,${hovered ? 0.22 : 0.07}), transparent)`,
          transition: 'background 0.38s ease',
        }} />
      </div>

      {/* Name + title below card — High visibility strokes and shadows */}
      <div style={{ marginTop: 11, textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 9.5, fontWeight: 700,
          letterSpacing: '0.06em',
          color: `rgba(255,255,255,${hovered ? 0.98 : 0.85})`, // Brighter white
          transition: 'color 0.35s ease',
          WebkitTextStroke: '0.5px rgba(0,0,0,0.8)', // Distinct black border
          textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.8)', // Deep shadow to separate from any particles
        }}>{member.shortName}</div>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: 7.5, letterSpacing: '0.15em',
          color: 'rgba(255,255,255,0.4)',
          marginTop: 3,
          textTransform: 'uppercase',
          WebkitTextStroke: '0.3px rgba(0,0,0,0.8)',
          textShadow: '0 1px 4px rgba(0,0,0,0.9)',
        }}>{member.title}</div>
      </div>
    </div>
  );
}

function TeamOverlay({ show }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      {/* Heading */}
      <div style={{
        textAlign: 'center', marginBottom: 30,
        opacity: show ? 1 : 0,
        transition: 'opacity 0.6s ease',
      }}>
        <Label>03 // Team</Label>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 13, fontWeight: 700,
          letterSpacing: '0.16em',
          color: 'rgba(255,255,255,0.32)', margin: 0,
        }}>THE FOUNDERS</h2>
      </div>

      {/* Card strip */}
      <div style={{
        display: 'flex', gap: 14,
        alignItems: 'flex-start',
        pointerEvents: show ? 'all' : 'none',
      }}>
        {MEMBERS.map((m, i) => (
          <TeamCard key={m.name} member={m} idx={i} show={show} />
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// CONTACT  —  centered, highly interactive, email input CTA
// ══════════════════════════════════════════════════════════════
function ContactOverlay({ show }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  };

  return (
    <div style={{
      position: 'absolute',
      top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 'min(380px, 88vw)',
      textAlign: 'center',
      pointerEvents: show ? 'all' : 'none',
      opacity: show ? 1 : 0,
      transition: 'opacity 0.7s ease',
    }}>
      {/* Section label */}
      <div style={{
        fontFamily: 'var(--font-body)',
        fontSize: 7.5, letterSpacing: '0.4em',
        color: 'rgba(255,255,255,0.2)',
        textTransform: 'uppercase',
        marginBottom: 14,
      }}>05 // Contact</div>

      {/* Hero headline */}
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(22px, 3.2vw, 38px)',
        fontWeight: 900,
        letterSpacing: '0.04em',
        color: '#fff',
        margin: '0 0 12px',
        lineHeight: 1.1,
      }}>Let's Build Something<br />That Works.</h1>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 11, fontWeight: 300,
        color: 'rgba(255,255,255,0.32)',
        marginBottom: 30, lineHeight: 1.75,
      }}>Tell us what you need. We'll turn it into<br />a real, scalable solution.</p>

      {/* Input form */}
      {!submitted ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: 28 }}>
          <div style={{ marginBottom: 10 }}>
            <input
              className="noviq-input"
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com or phone number"
            />
          </div>
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '13px',
              background: email.trim()
                ? 'rgba(255,255,255,0.09)'
                : 'rgba(255,255,255,0.03)',
              border: `1px solid rgba(255,255,255,${email.trim() ? 0.16 : 0.06})`,
              borderRadius: 8,
              color: email.trim()
                ? 'rgba(255,255,255,0.88)'
                : 'rgba(255,255,255,0.3)',
              fontFamily: 'var(--font-display)',
              fontSize: 9, letterSpacing: '0.28em',
              fontWeight: 700,
              cursor: email.trim() ? 'pointer' : 'default',
              textTransform: 'uppercase',
              transition: 'all 0.28s ease',
              boxSizing: 'border-box',
            }}
            onMouseEnter={e => {
              if (!email.trim()) return;
              e.currentTarget.style.background = 'rgba(255,255,255,0.14)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.24)';
              e.currentTarget.style.boxShadow = '0 0 24px rgba(255,255,255,0.07)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = email.trim() ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.03)';
              e.currentTarget.style.borderColor = email.trim() ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.06)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Request a Call
          </button>
          {/* Micro-reassurance text */}
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: 8, letterSpacing: '0.15em',
            color: 'rgba(255,255,255,0.16)',
            marginTop: 10,
          }}>We'll get back to you within 24 hours.</div>
        </form>
      ) : (
        <div style={{
          marginBottom: 28, padding: '18px 22px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.07)',
        }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 10, letterSpacing: '0.22em',
            color: 'rgba(255,255,255,0.58)',
          }}>Thank you — we'll be in touch.</div>
        </div>
      )}

      {/* Divider */}
      <div style={{
        height: 1,
        background: 'rgba(255,255,255,0.06)',
        marginBottom: 18,
      }} />

      {/* Contact info row */}
      <div style={{
        fontFamily: 'var(--font-body)',
        fontSize: 9.5, letterSpacing: '0.06em',
        color: 'rgba(255,255,255,0.26)',
      }}>
        contact@noviqlabs.com
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// Root Overlay
// ══════════════════════════════════════════════════════════════
export function Overlay({ section }) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
      <LandingOverlay show={section === 0} />
      <AboutOverlay show={section === 1} />
      <ServicesOverlay show={section === 2} />
      <TeamOverlay show={section === 3} />
      <ContactOverlay show={section === 4} />
    </div>
  );
}
