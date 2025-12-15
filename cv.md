---
layout: default
title: CV
permalink: /cv.html
---

<style>
    /* CV specific styles to look like a terminal document */
    .cv-header {
        border-bottom: 2px dashed var(--text-primary);
        margin-bottom: 20px;
        padding-bottom: 10px;
    }
    .cv-section h2 {
        background-color: var(--text-primary);
        color: var(--bg-color);
        display: inline-block;
        padding: 2px 8px;
        margin-top: 20px;
    }
    .job-title {
        font-weight: bold;
        color: var(--text-secondary);
    }
    .job-meta {
        font-style: italic;
        margin-bottom: 5px;
    }
</style>

<div class="cv-header">
    <h1>Max Couling</h1>
    <p>
        Cybersecurity professional with hands-on experience in financial services security, risk assessment, and regulatory compliance. Proven track record supporting RBNZ requirements and SWIFT audits.
    </p>
    <p>
        <strong>Contact:</strong>
        <span id="email-lock">
            <button onclick="this.parentElement.innerHTML='max' + '@' + 'maxcouling.com'">[Click to Reveal Email]</button>
        </span>
    </p>
</div>

<div class="cv-section">
    <h2>WORK EXPERIENCE</h2>

    <div class="job">
        <p class="job-title">Ernst & Young (EY) | Cybersecurity Consultant - Client Secondment - Risk & Compliance Specialist</p>
        <p class="job-meta">Aug 2025 - Present</p>
        <ul>
            <li>Achieved zero-finding SWIFT CSP audit certification by coordinating evidence collection across 25 mandatory controls, strengthening organisation's payment security posture and compliance.</li>
            <li>Conducting 10+ risk assessments across IT, OT, and third-party environments, managing security exemption process for 10+ requests while balancing business requirements against NIST 800-53 controls.</li>
            <li>Performing weekly application security assessments for onboarding, analysing applications with 50-1000+ vulnerabilities (SQL injection, XSS, open-source risks); reduced false positives through code-level verification, including identifying a false positive where the tool flagged Playwright test scripts rather than prod code.</li>
            <li>Working directly with Head of GRC and CISO to support enterprise-wide security initiatives and governance program.</li>
        </ul>
    </div>

    <div class="job">
        <p class="job-title">Graduate Cybersecurity Consultant</p>
        <p class="job-meta">Mar 2025 - Aug 2025</p>
        <ul>
            <li>Supported financial services clients including life insurance companies and banking institutions with cybersecurity maturity improvements and regulatory compliance.</li>
            <li>Helped insurance client achieve RBNZ Cyber Resilience baseline requirements, focusing on Govern and Identify domains of NIST CSF 2.0 Cybersecurity Framework.</li>
            <li>Designed and facilitated C-Suite workshops that secured executive buy-in for expanded cybersecurity initiatives and increased security investment.</li>
        </ul>
    </div>

    <div class="job">
        <p class="job-title">Intern Cybersecurity Consultant</p>
        <p class="job-meta">Nov 2023 - Feb 2024</p>
        <ul>
            <li>Covered Technical Business Analyst role for SailPoint IdentityNow implementation, facilitating UAT's, validating access review functionality, and coordinating with stakeholders to ensure successful deployment across 22,000+ users.</li>
            <li>Validated IAM implementation against security requirements and stakeholder needs, ensuring access controls aligned with principle of least privilege across the organisation.</li>
        </ul>
    </div>

    <div class="job">
        <p class="job-title">Exzel IT Consulting | Part-Time IT Specialist</p>
        <p class="job-meta">Sep 2022 - Jun 2023</p>
        <ul>
            <li>Provided on-site and remote technical support including network troubleshooting, hardware repairs, system configuration and secure data destruction for small businesses and education centres.</li>
        </ul>
    </div>
</div>

<div class="cv-section">
    <h2>EDUCATION</h2>
    <p><strong>University of Auckland</strong> | Bachelor of Science, Majoring in Computer Science and IT Management</p>
    <p class="job-meta">Completed: Nov 2024 | GPA 6.83</p>
    <ul>
        <li>Top Achiever Scholarship ($20,000)</li>
        <li>Awarded highest grade in INFOMGMT 399 (top of class)</li>
        <li>Class Rep</li>
    </ul>
</div>

<div class="cv-section">
    <h2>PROJECTS</h2>
    
    <p><strong>SurveyHustle | Website | GitHub</strong></p>
    <p>Full-stack Flask & PostgreSQL platform enabling ethical, privacy-focused data sharing through anonymised surveys, integrating Differential Privacy and deployed on my Raspberry Pi with Cloudflare Tunnels/protection.</p>

    <p><strong>Home Security Lab</strong></p>
    <p>Self-configured network environment including Ubiquiti EdgeRouter with custom firewall rules, Docker containers (Vaultwarden, ‘SurveyHustle’, PiHole), and Cloudflare tunnel implementation for secure remote access.</p>
</div>

<div class="cv-section">
    <h2>CERTIFICATIONS, SKILLS & INTERESTS</h2>
    <ul>
        <li><strong>Certifications:</strong> Microsoft Certified, AZ-900 & AI-900, EY Solution Architecture and Cyber Bronze badges</li>
        <li><strong>In-Progress Certifications:</strong> CompTIA Security+ certification (self-study), AZ-500, OWASP API Security Top 10</li>
        <li><strong>Technologies:</strong> Python (Flask), Azure, Git/Github, Excel, SQL (PostgreSQL), Docker, Linux, ServiceNow (GRC)</li>
        <li><strong>Skills:</strong> Project Planning & Delivery, Stakeholder Management, Information Security, Workshop Facilitation</li>
        <li><strong>Interests:</strong> Space, Video Games, Board Games, Building PCs & tinkering with hardware, My German Shepherd ‘Jet’</li>
    </ul>
</div>
