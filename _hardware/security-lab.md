---
layout: project
title: "Home Security Lab"
description: "A self-configured network environment with security monitoring."
category: homelab
image: /assets/images/hardware/homelab.jpg
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
The network is segmented to isolate IoT devices (like the cameras) from valid internal traffic using VLANs, ensuring that a compromise in one device doesn't lead to a full network breach.

It does look a bit messy at the moment, but I am moving house soon and will get a new router.

### Gallery
![Console Image 1](/assets/images/hardware/homelab.jpg)