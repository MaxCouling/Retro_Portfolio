// Site-wide retro behaviour: boot intro, Konami code, visit counter.
(function () {
    'use strict';

    var reducedMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---------------------------------------------------------------
    // BOOT SEQUENCE — plays once per browser session, any key skips it
    // ---------------------------------------------------------------
    (function boot() {
        var KEY = 'crt-booted';
        try {
            if (sessionStorage.getItem(KEY)) return;
            sessionStorage.setItem(KEY, '1');
        } catch (e) { return; }
        if (reducedMotion) return;

        var lines = [
            'MAXCOULING.COM BIOS v2.6 — COOL ZONE EDITION',
            'CPU: PLUSH-POWERED @ 60Hz ............ OK',
            'MEMORY CHECK: 640K ............. (ENOUGH)',
            'MOUNTING /PROJECTS ................... OK',
            'MOUNTING /ARCADE ..................... OK',
            'CALIBRATING CRT FLICKER .............. OK',
            'BOOT COMPLETE. WELCOME, VISITOR.'
        ];

        var overlay = document.createElement('div');
        overlay.className = 'boot-overlay';
        overlay.innerHTML = '<pre class="boot-lines"></pre><p class="boot-skip">PRESS ANY KEY TO SKIP</p>';
        document.body.appendChild(overlay);
        var pre = overlay.querySelector('.boot-lines');

        var i = 0, done = false;
        function finish() {
            if (done) return;
            done = true;
            overlay.classList.add('boot-fade');
            setTimeout(function () { overlay.remove(); }, 400);
            removeEventListener('keydown', finish);
            overlay.removeEventListener('click', finish);
        }
        addEventListener('keydown', finish);
        overlay.addEventListener('click', finish);

        (function next() {
            if (done) return;
            if (i >= lines.length) { setTimeout(finish, 350); return; }
            pre.textContent += lines[i++] + '\n';
            setTimeout(next, 140);
        })();
    })();

    // ---------------------------------------------------------------
    // KONAMI CODE — ↑↑↓↓←→←→BA warps you to the Arcade
    // ---------------------------------------------------------------
    (function konami() {
        var CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
            'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        var pos = 0;
        addEventListener('keydown', function (e) {
            var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
            pos = (k === CODE[pos]) ? pos + 1 : (k === CODE[0] ? 1 : 0);
            if (pos < CODE.length) return;
            pos = 0;
            var here = location.pathname.indexOf('arcade') !== -1;
            var flash = document.createElement('div');
            flash.className = 'cheat-flash';
            flash.textContent = here
                ? '< CHEAT CODE ACCEPTED — YOU ARE ALREADY IN THE ARCADE. NICE TRY >'
                : '< CHEAT CODE ACCEPTED — WARPING TO ARCADE >';
            document.body.appendChild(flash);
            setTimeout(function () {
                if (here) { flash.remove(); } else { location.href = '/arcade.html'; }
            }, 1200);
        });
    })();

    // ---------------------------------------------------------------
    // VISIT COUNTER — counts *your* visits, like an honest odometer
    // ---------------------------------------------------------------
    (function counter() {
        var el = document.getElementById('visit-counter');
        if (!el) return;
        var n = 1;
        try {
            n = parseInt(localStorage.getItem('crt-visits') || '0', 10);
            if (!sessionStorage.getItem('crt-counted')) {
                n += 1;
                localStorage.setItem('crt-visits', String(n));
                sessionStorage.setItem('crt-counted', '1');
            }
            if (n < 1) n = 1;
        } catch (e) { /* private browsing — stay at 1 */ }
        el.textContent = ('00000' + n).slice(-6);
    })();
})();
