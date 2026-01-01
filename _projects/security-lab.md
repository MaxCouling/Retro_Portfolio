---
layout: project
title: "Home Security Lab"
description: "A self-configured network environment with security monitoring."
category: homelab
---

## Overview

A robust home lab setup focused on network security and privacy.

### Setup
*   **Router:** Ubiquiti EdgeRouter with custom firewall rules.
*   **Monitoring:** Integrated security cameras for physical monitoring.
*   **Services:**
    *   Docker containers running Vaultwarden, PiHole, and SurveyHustle.
    *   Cloudflare Tunnel for secure remote access without opening ports.

### Security
The network is segmented to isolate IoT devices (like the cameras) from valid internal traffic using VLAN's, ensuring that a compromise in one device doesn't lead to a full network breach.

I am thinking of upgrading when I move to a larger house, and I can get a better router. 
