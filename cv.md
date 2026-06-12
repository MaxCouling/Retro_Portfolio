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
    .cv-skills-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 0 1.5rem;
    }
    .print-only { display: none; }
</style>

<div class="cv-header">
    <h1>Max Couling</h1>
    <p>
        Cybersecurity Consultant delivering risk assessments, governance frameworks and security
        architecture recommendations for a global FMCG co-operative (NZD $20B+ revenue, 10,000+
        employees). Bridges hands-on technical work — SAST/SCA/DAST triage, DNS and domain analysis,
        vulnerability validation — with enterprise GRC: audit readiness, exception lifecycle
        management, vendor evaluation. A primary author and point of escalation for high-stakes risk
        assessments, now moving toward security architecture with a focus on AppSec, Zero Trust and
        GRC automation.
    </p>
    <p>
        <strong>Contact:</strong>
        <span id="email-lock" class="no-print">
            <button onclick="this.parentElement.innerHTML='max' + '@' + 'maxcouling.com'">[Click to Reveal Email]</button>
        </span>
        <span class="print-only">max@maxcouling.com &middot; maxcouling.com</span>
        &nbsp;|&nbsp;
        <a href="https://github.com/MaxCouling">GitHub</a> &middot;
        <a href="https://linkedin.com/in/maxcouling">LinkedIn</a>
    </p>
    <p class="no-print">
        <button onclick="window.print()">[Print / Save as PDF]</button>
        <span style="color:var(--text-secondary); font-size:0.9rem">&nbsp;Last updated: June 2026</span>
    </p>
</div>

<div class="cv-section">
    <h2>WORK EXPERIENCE</h2>

    <div class="job">
        <p class="job-title">Ernst & Young (EY) | Cybersecurity Consultant — Client Secondment, Cyber Risk & Compliance</p>
        <p class="job-meta">Mar 2025 - Present</p>
        <ul>
            <li><strong>Client commendation:</strong> Perfect 10/10 client satisfaction score (ASQ) from Fonterra, alongside a Partner-level commendation for contribution, professionalism and responsiveness.</li>
            <li><strong>Risk assessment authoring:</strong> Authored formal cybersecurity assessments reviewed by the Head of GRC and approved by the CISO — covering SAP vulnerability management, EOL/IAM servers, guest identity lifecycles, F5 BIG-IP patching, domain/DNS security, and LIMS laboratory environments.</li>
            <li><strong>Identity governance:</strong> Led a Microsoft Entra ID guest-account risk assessment; identified a critical control gap across ~57,000 guest accounts and designed RBAC-aligned lifecycle remediation with a pathway to ongoing access reviews.</li>
            <li><strong>Exception governance overhaul:</strong> Identified 9 key deficiencies across process, tooling, ownership and architecture; authored new Exception Guidance with time-bound limits and mandatory escalation to formal risk acceptance when no remediation path exists.</li>
            <li><strong>Firewall policy &amp; exposure reduction:</strong> Managed and triaged ~30 firewall policy exemptions per month across QA/DEV/PROD; independently extracted and analysed the full historical dataset after the incoming CISO flagged volume as systemic, supporting a complete policy rewrite to reduce cross-domain exposure.</li>
            <li><strong>AppSec operating model:</strong> Coordinated assessments triaging 50–1,000+ SAST/DAST/SCA findings per engagement; authored a Key Decision Document presented to the CISO recommending a phased shift from a hand-off-heavy managed service (2–5 week turnaround) to centralised scan execution, and led a multi-vendor AppSec evaluation.</li>
            <li><strong>GRC automation:</strong> Designed and spearheaded a Microsoft Copilot Studio agent that validation-checks exception submissions against governance criteria (time-bound duration, named controls, mitigation availability) before human review.</li>
            <li><strong>Audits &amp; frameworks:</strong> Drove a zero-finding SWIFT CSP audit across 25 mandatory controls (verified through Dec 2026); processed 10+ concurrent NIST 800-53 risk assessments across IT, OT and third-party environments; delivered an RBNZ Cyber Resilience baseline engagement (NIST CSF 2.0) for an insurance client, with a gap assessment, remediation roadmap and C-suite workshops that secured increased security investment.</li>
        </ul>
    </div>

    <div class="job">
        <p class="job-title">Ernst & Young (EY) | Intern Cybersecurity Consultant</p>
        <p class="job-meta">Nov 2023 - Feb 2024</p>
        <ul>
            <li>Covered the Technical Business Analyst role for an enterprise SailPoint IdentityNow rollout.</li>
            <li>Executed UAT, validated least-privilege access controls, and coordinated deployment tracking across 22,000+ identities.</li>
        </ul>
    </div>

    <div class="job">
        <p class="job-title">Exzel IT Consulting | Part-Time IT Specialist</p>
        <p class="job-meta">Sep 2022 - Jun 2023</p>
        <ul>
            <li>On-site and remote support for small businesses and education centres: network troubleshooting, hardware repair, system configuration, secure data destruction.</li>
        </ul>
    </div>
</div>

<div class="cv-section">
    <h2>CORE COMPETENCIES</h2>
    <div class="cv-skills-grid">
        {% for group in site.data.skills %}
        <div>
            <p><strong>{{ group.category }}</strong></p>
            <ul>
                {% for item in group.items %}
                <li>{{ item }}</li>
                {% endfor %}
            </ul>
        </div>
        {% endfor %}
    </div>
</div>

<div class="cv-section">
    <h2>PROJECTS</h2>

    <p><strong>Home Security Lab</strong> | <a href="{{ '/hardware/security-lab/' | relative_url }}">Build log</a></p>
    <ul>
        <li>Proxmox hypervisor (KVM/LXC) on a Dell OptiPlex 7070 hosting services in isolated Linux containers.</li>
        <li>Raspberry Pi running a Tailscale subnet router and Pi-hole for network-level DNS filtering.</li>
        <li>Cloudflare Zero Trust tunnels expose public services on a custom domain with no inbound firewall ports — mirroring enterprise patterns.</li>
    </ul>

    <p><strong>MisManageMyHealth</strong> — OWASP API Security Demo | <a href="https://github.com/MaxCouling/MisManageMyHealth">GitHub</a></p>
    <ul>
        <li>Forked and reskinned OWASP Juice Shop into a mock healthcare portal demonstrating Broken Object Level Authorization attack chains (OWASP API1:2023).</li>
        <li>Built live attack proofs-of-concept in Burp Suite; delivered as a hands-on security awareness session to the EY New Zealand team.</li>
    </ul>

    <p><strong>Pete's Rescue Mission</strong> — Pixel-art platformer, 100% procedural | <a href="{{ '/arcade.html' | relative_url }}">Play it here</a></p>
    <ul>
        <li>Complete browser platformer in vanilla JavaScript: every sprite, song and sound effect generated by code — zero asset files, zero dependencies.</li>
    </ul>

    <p><strong>SurveyHustle</strong> — Privacy-focused survey platform | <a href="{{ '/software/survey-hustle/' | relative_url }}">Details</a></p>
    <ul>
        <li>Full-stack Flask &amp; PostgreSQL platform with Differential Privacy, self-hosted on a Raspberry Pi behind Cloudflare Tunnels.</li>
    </ul>
</div>

<div class="cv-section">
    <h2>EDUCATION &amp; CERTIFICATIONS</h2>
    <p><strong>University of Auckland</strong> | BSc, Computer Science &amp; IT Management</p>
    <p class="job-meta">Graduated Nov 2024 | GPA 6.83</p>
    <ul>
        <li>Top Achiever Scholarship ($20,000)</li>
        <li>Highest grade in INFOMGMT 399 (top of cohort); Class Representative</li>
    </ul>
    <ul>
        <li><strong>Certifications:</strong> Microsoft Azure Fundamentals (AZ-900) &middot; Azure AI Fundamentals (AI-900) &middot; EY Bronze — Cyber &amp; Solution Architecture</li>
        <li><strong>In progress:</strong> Microsoft Azure Security Engineer Associate (AZ-500)</li>
    </ul>
</div>
