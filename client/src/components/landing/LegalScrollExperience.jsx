import { useRef } from "react";
import {
    motion,
    useScroll,
    useSpring,
    useTransform,
} from "motion/react";

import "./LegalScrollExperience.css";

export default function LegalScrollExperience() {
    const sectionRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end end"],
    });

    /*
     * Smooth scroll progress.
     * The animation follows the user's real page scroll.
     */
    const progress = useSpring(scrollYProgress, {
        stiffness: 65,
        damping: 24,
        mass: 0.3,
    });

    /*
     * =========================================
     * CAMERA
     * =========================================
     */

    const cameraScale = useTransform(
        progress,
        [0, 0.18, 0.38, 0.55, 0.75, 1],
        [1, 1.02, 1.08, 1.18, 1.28, 1.38]
    );

    const cameraY = useTransform(
        progress,
        [0, 0.25, 0.48, 0.65, 0.82, 1],
        [0, 0, -8, -18, -28, -38]
    );

    const cameraX = useTransform(
        progress,
        [0, 0.35, 0.55, 0.75, 1],
        [0, 0, -2, 2, 0]
    );

    /*
     * =========================================
     * INTRO
     * =========================================
     */

    const introOpacity = useTransform(
        progress,
        [0, 0.08, 0.18, 0.25],
        [1, 1, 0.45, 0]
    );

    const introY = useTransform(
        progress,
        [0, 0.25],
        [0, -100]
    );

    /*
     * =========================================
     * COURTHOUSE
     * =========================================
     */

    const courthouseOpacity = useTransform(
        progress,
        [0, 0.06, 0.30, 0.48, 0.62],
        [0.5, 1, 1, 1, 0]
    );

    const courthouseScale = useTransform(
        progress,
        [0, 0.25, 0.42, 0.60],
        [1, 1.03, 1.12, 1.3]
    );

    const courthouseY = useTransform(
        progress,
        [0, 0.35, 0.6],
        [0, 0, -80]
    );

    /*
     * =========================================
     * DOORS
     * =========================================
     */

    const doorProgress = useTransform(
        progress,
        [0.28, 0.38, 0.50, 0.58],
        [0, 0, 1, 1]
    );

    const leftDoorX = useTransform(
        doorProgress,
        [0, 1],
        [0, -135]
    );

    const rightDoorX = useTransform(
        doorProgress,
        [0, 1],
        [0, 135]
    );

    const doorScale = useTransform(
        progress,
        [0.28, 0.50, 0.62],
        [1, 1.12, 1.45]
    );

    const doorLightOpacity = useTransform(
        progress,
        [0.28, 0.40, 0.50, 0.62],
        [0, 0.15, 1, 0.35]
    );

    /*
     * =========================================
     * CAMERA ENTERING COURTROOM
     * =========================================
     */

    const courtroomOpacity = useTransform(
        progress,
        [0.46, 0.54, 0.60, 0.88],
        [0, 1, 1, 1]
    );

    const courtroomScale = useTransform(
        progress,
        [0.45, 0.58, 0.82, 1],
        [0.75, 1, 1.04, 1.08]
    );

    const courtroomY = useTransform(
        progress,
        [0.45, 0.62, 0.85, 1],
        [100, 0, -10, -20]
    );

    /*
     * =========================================
     * JUDGE
     * =========================================
     */

    const judgeOpacity = useTransform(
        progress,
        [0.52, 0.60, 0.75],
        [0, 1, 1]
    );

    const judgeY = useTransform(
        progress,
        [0.52, 0.62],
        [60, 0]
    );

    /*
     * =========================================
     * LAWYERS / BENCHES
     * =========================================
     */

    const lawyersOpacity = useTransform(
        progress,
        [0.56, 0.65, 0.78],
        [0, 1, 1]
    );

    const lawyersY = useTransform(
        progress,
        [0.56, 0.68],
        [80, 0]
    );

    /*
     * =========================================
     * VICTIM / COURTROOM PEOPLE
     * =========================================
     */

    const peopleOpacity = useTransform(
        progress,
        [0.62, 0.72, 0.84],
        [0, 1, 1]
    );

    const peopleX = useTransform(
        progress,
        [0.62, 0.72],
        [-80, 0]
    );

    /*
     * =========================================
     * CASE DOCUMENT
     * =========================================
     */

    const documentOpacity = useTransform(
        progress,
        [0.70, 0.76, 0.91, 0.97],
        [0, 1, 1, 0]
    );

    const documentScale = useTransform(
        progress,
        [0.70, 0.80, 0.92],
        [0.5, 1, 1.18]
    );

    const documentY = useTransform(
        progress,
        [0.70, 0.80, 0.94],
        [160, 0, -40]
    );

    const documentRotate = useTransform(
        progress,
        [0.70, 0.82, 0.94],
        [-5, 0, 2]
    );

    /*
     * =========================================
     * DOCUMENT PAGES
     * =========================================
     */

    const pageOneY = useTransform(
        progress,
        [0.80, 0.92],
        [0, -80]
    );

    const pageTwoY = useTransform(
        progress,
        [0.82, 0.94],
        [0, -120]
    );

    /*
     * =========================================
     * CASE TIMELINE
     * =========================================
     */

    const timelineOpacity = useTransform(
        progress,
        [0.84, 0.91, 0.98],
        [0, 1, 0]
    );

    const timelineY = useTransform(
        progress,
        [0.84, 0.93],
        [100, 0]
    );

    const timelineLineScale = useTransform(
        progress,
        [0.86, 0.97],
        [0, 1]
    );

    /*
     * =========================================
     * FINAL EXIT
     *
     * Animation fades away so the real
     * landing page underneath becomes visible.
     * =========================================
     */

    const finalFade = useTransform(
        progress,
        [0.96, 1],
        [1, 0]
    );

    /*
     * =========================================
     * PARTICLES
     * =========================================
     */

    const particles = Array.from({
        length: 55,
    });

    return (
        <section
            ref={sectionRef}
            className="legal-scroll-experience"
        >
            <div className="legal-scroll-sticky">

                {/* =====================================
                    BACKGROUND
                   ===================================== */}

                <div className="legal-background" />

                <motion.div
                    className="legal-camera"
                    style={{
                        scale: cameraScale,
                        y: cameraY,
                        x: cameraX,
                    }}
                >

                    {/* =================================
                        GOLDEN ATMOSPHERE
                       ================================= */}

                    <motion.div
                        className="legal-glow"
                        style={{
                            opacity: useTransform(
                                progress,
                                [0, 0.35, 0.55, 0.8, 1],
                                [0.15, 0.35, 0.9, 0.7, 0.15]
                            ),
                        }}
                    />

                    {/* Light rays */}

                    <div className="light-rays">
                        <span />
                        <span />
                        <span />
                    </div>

                    {/* Floating particles */}

                    <motion.div
                        className="legal-particles"
                        style={{
                            opacity: useTransform(
                                progress,
                                [0, 0.25, 0.65, 1],
                                [0.2, 0.55, 0.9, 0.2]
                            ),
                        }}
                    >
                        {particles.map((_, index) => (
                            <span
                                key={index}
                                className="legal-particle"
                                style={{
                                    left: `${(index * 37) % 100}%`,
                                    top: `${(index * 61) % 100}%`,
                                    animationDelay: `${(index % 10) * 0.35}s`,
                                    animationDuration: `${5 + (index % 6)}s`,
                                }}
                            />
                        ))}
                    </motion.div>

                    {/* =================================
                        COURTHOUSE FRONT
                       ================================= */}

                    <motion.div
                        className="courthouse-scene"
                        style={{
                            opacity: courthouseOpacity,
                            scale: courthouseScale,
                            y: courthouseY,
                        }}
                    >
                        <div className="courthouse-sky" />

                        <div className="courthouse">

                            {/* Roof */}

                            <div className="courthouse-roof" />

                            {/* Main building */}

                            <div className="courthouse-top">

                                <div className="courthouse-symbol">
                                    ⚖
                                </div>

                                <div className="courthouse-name">
                                    LAW
                                </div>

                                <div className="courthouse-subtitle">
                                    COURT OF JUSTICE
                                </div>

                            </div>

                            {/* Columns */}

                            <div className="courthouse-columns">

                                {Array.from({
                                    length: 7,
                                }).map((_, index) => (
                                    <div
                                        className="column"
                                        key={index}
                                    />
                                ))}

                            </div>

                            {/* Entrance */}

                            <div className="courthouse-entrance">

                                <div className="entrance-frame" />

                                <motion.div
                                    className="courthouse-door door-left"
                                    style={{
                                        x: leftDoorX,
                                    }}
                                >
                                    <div className="door-handle" />
                                </motion.div>

                                <motion.div
                                    className="courthouse-door door-right"
                                    style={{
                                        x: rightDoorX,
                                    }}
                                >
                                    <div className="door-handle" />
                                </motion.div>

                                <motion.div
                                    className="door-light"
                                    style={{
                                        opacity:
                                            doorLightOpacity,
                                    }}
                                />

                            </div>

                            {/* Steps */}

                            <div className="courthouse-steps">
                                <span />
                                <span />
                                <span />
                                <span />
                            </div>

                        </div>
                    </motion.div>

                    {/* =================================
                        INTRO TEXT
                       ================================= */}

                    <motion.div
                        className="legal-intro"
                        style={{
                            opacity: introOpacity,
                            y: introY,
                        }}
                    >
                        <div className="legal-eyebrow">
                            LAW SYSTEM
                        </div>

                        <h1>
                            Justice.
                            <span>Simplified.</span>
                        </h1>

                        <p>
                            Every legal journey begins
                            with a single step.
                        </p>

                        <div className="scroll-indicator">
                            <span />
                            Scroll to enter
                        </div>
                    </motion.div>

                    {/* =================================
                        COURTROOM INTERIOR
                       ================================= */}

                    <motion.div
                        className="courtroom-scene"
                        style={{
                            opacity:
                                courtroomOpacity,
                            scale:
                                courtroomScale,
                            y:
                                courtroomY,
                        }}
                    >

                        {/* Back wall */}

                        <div className="courtroom-wall">

                            <div className="court-emblem">
                                ⚖
                            </div>

                            <div className="court-title">
                                COURT OF JUSTICE
                            </div>

                        </div>

                        {/* Judge platform */}

                        <div className="judge-platform" />

                        {/* Judge chair */}

                        <motion.div
                            className="judge-area"
                            style={{
                                opacity:
                                    judgeOpacity,
                                y: judgeY,
                            }}
                        >

                            <div className="judge-chair">

                                <div className="chair-crown">
                                    ⚖
                                </div>

                                <div className="judge-person">
                                    <div className="judge-head" />
                                    <div className="judge-body" />
                                    <div className="judge-robe" />
                                </div>

                            </div>

                            <div className="judge-name">
                                HONOURABLE JUDGE
                            </div>

                        </motion.div>

                        {/* =================================
                            LAWYERS ON BENCHES
                           ================================= */}

                        <motion.div
                            className="lawyer-benches"
                            style={{
                                opacity:
                                    lawyersOpacity,
                                y:
                                    lawyersY,
                            }}
                        >

                            {/* Left lawyer bench */}

                            <div className="court-bench bench-left">

                                <div className="bench-seat" />

                                <div className="lawyer lawyer-one">
                                    <div className="person-head" />
                                    <div className="person-body" />
                                    <div className="lawyer-coat" />
                                </div>

                                <div className="lawyer lawyer-two">
                                    <div className="person-head" />
                                    <div className="person-body" />
                                    <div className="lawyer-coat" />
                                </div>

                                <div className="bench-front" />

                            </div>

                            {/* Right lawyer bench */}

                            <div className="court-bench bench-right">

                                <div className="bench-seat" />

                                <div className="lawyer lawyer-three">
                                    <div className="person-head" />
                                    <div className="person-body" />
                                    <div className="lawyer-coat" />
                                </div>

                                <div className="lawyer lawyer-four">
                                    <div className="person-head" />
                                    <div className="person-body" />
                                    <div className="lawyer-coat" />
                                </div>

                                <div className="bench-front" />

                            </div>

                        </motion.div>

                        {/* =================================
                            VICTIM / CLIENT AREA
                           ================================= */}

                        <motion.div
                            className="court-people"
                            style={{
                                opacity:
                                    peopleOpacity,
                                x:
                                    peopleX,
                            }}
                        >

                            <div className="victim-area">

                                <div className="victim-chair" />

                                <div className="victim-person">

                                    <div className="victim-head" />

                                    <div className="victim-body" />

                                    <div className="victim-clothes" />

                                </div>

                                <div className="victim-label">
                                    CLIENT / VICTIM
                                </div>

                            </div>

                            {/* Witness / people */}

                            <div className="court-audience">

                                <div className="audience-person">
                                    <span />
                                </div>

                                <div className="audience-person">
                                    <span />
                                </div>

                                <div className="audience-person">
                                    <span />
                                </div>

                            </div>

                        </motion.div>

                        {/* =================================
                            COURTROOM DESK
                           ================================= */}

                        <div className="court-clerk-desk">

                            <div className="clerk-document">
                                CASE DOCUMENT
                            </div>

                            <div className="clerk-lamp" />

                            <div className="clerk-desk-top" />

                        </div>

                        {/* Courtroom floor */}

                        <div className="courtroom-floor" />

                    </motion.div>

                    {/* =================================
                        CASE DOCUMENT
                       ================================= */}

                    <motion.div
                        className="case-document-scene"
                        style={{
                            opacity:
                                documentOpacity,
                            scale:
                                documentScale,
                            y:
                                documentY,
                            rotate:
                                documentRotate,
                        }}
                    >

                        <div className="document-glow" />

                        <motion.div
                            className="document-page document-page-back"
                            style={{
                                y: pageTwoY,
                            }}
                        />

                        <motion.div
                            className="document-page document-page-middle"
                            style={{
                                y: pageOneY,
                            }}
                        />

                        <div className="case-document">

                            <div className="document-top-line">
                                <span>
                                    LAW SYSTEM
                                </span>

                                <strong>
                                    COURT RECORD
                                </strong>
                            </div>

                            <div className="document-seal">
                                ⚖
                            </div>

                            <h2>
                                CASE FILE
                            </h2>

                            <div className="case-number">
                                CASE #2026-001
                            </div>

                            <div className="document-information">

                                <div>
                                    <span>
                                        CLIENT
                                    </span>

                                    <strong>
                                        Confidential Client
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        COUNSEL
                                    </span>

                                    <strong>
                                        Assigned Lawyer
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        MATTER
                                    </span>

                                    <strong>
                                        Legal Proceeding
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        STATUS
                                    </span>

                                    <strong className="status-active">
                                        ACTIVE
                                    </strong>
                                </div>

                            </div>

                            <div className="document-lines">

                                <span />
                                <span />
                                <span />
                                <span />
                                <span />

                            </div>

                            <div className="document-footer">

                                <span>
                                    OFFICIAL COURT RECORD
                                </span>

                                <div className="signature-line">
                                    SIGNATURE
                                </div>

                            </div>

                        </div>

                    </motion.div>

                    {/* =================================
                        CASE TIMELINE
                       ================================= */}

                    <motion.div
                        className="case-timeline-scene"
                        style={{
                            opacity:
                                timelineOpacity,
                            y:
                                timelineY,
                        }}
                    >

                        <div className="timeline-heading">

                            <span>
                                CASE PROGRESS
                            </span>

                            <h2>
                                Every step
                                <br />
                                matters.
                            </h2>

                        </div>

                        <div className="case-timeline">

                            <div className="timeline-line">

                                <motion.div
                                    className="timeline-line-progress"
                                    style={{
                                        scaleY:
                                            timelineLineScale,
                                    }}
                                />

                            </div>

                            <TimelineItem
                                number="01"
                                title="Case Filed"
                                description="Legal matter officially begins."
                            />

                            <TimelineItem
                                number="02"
                                title="Lawyer Assigned"
                                description="Legal counsel takes responsibility."
                            />

                            <TimelineItem
                                number="03"
                                title="Documents Submitted"
                                description="Case documents are organized."
                            />

                            <TimelineItem
                                number="04"
                                title="Court Hearing"
                                description="The case moves before the court."
                            />

                            <TimelineItem
                                number="05"
                                title="Resolution"
                                description="The legal journey reaches its next stage."
                            />

                        </div>

                    </motion.div>

                </motion.div>

                {/* =====================================
                    FINAL CINEMATIC FADE
                   ===================================== */}

                <motion.div
                    className="final-animation-fade"
                    style={{
                        opacity: finalFade,
                    }}
                />

                {/* Bottom scroll progress */}

                <div className="legal-progress">

                    <motion.span
                        style={{
                            scaleX: progress,
                        }}
                    />

                </div>

            </div>
        </section>
    );
}


/*
 * =========================================
 * TIMELINE ITEM
 * =========================================
 */

function TimelineItem({
    number,
    title,
    description,
}) {
    return (
        <div className="timeline-item">

            <div className="timeline-dot">
                {number}
            </div>

            <div className="timeline-content">

                <span>
                    {number}
                </span>

                <strong>
                    {title}
                </strong>

                <p>
                    {description}
                </p>

            </div>

        </div>
    );
}