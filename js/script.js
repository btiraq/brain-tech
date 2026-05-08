// ========== CURSOR ==========
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx=0, my=0, rx=0, ry=0;
if (cursor && ring) {
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; cursor.style.left = mx+'px'; cursor.style.top = my+'px'; });
    (function animRing() { rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12; ring.style.left = rx+'px'; ring.style.top = ry+'px'; requestAnimationFrame(animRing); })();
    document.querySelectorAll('a,button,.service-card,.project-card,.why-item,.test-card').forEach(el => {
        el.addEventListener('mouseenter', () => { cursor.style.width='20px'; cursor.style.height='20px'; ring.style.width='60px'; ring.style.height='60px'; ring.style.opacity='0.8'; });
        el.addEventListener('mouseleave', () => { cursor.style.width='12px'; cursor.style.height='12px'; ring.style.width='40px'; ring.style.height='40px'; ring.style.opacity='0.5'; });
    });
}

// ========== LOADER + 3D SPINNING BRAIN ==========
(function initLoader() {
    const c = document.getElementById('loader-canvas');
    if (!c) return;
    c.width = 200; c.height = 200;
    const renderer = new THREE.WebGLRenderer({ canvas: c, alpha: true, antialias: true });
    renderer.setSize(200, 200);
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    cam.position.z = 3;
    const geo = new THREE.IcosahedronGeometry(1, 1);
    const mat = new THREE.MeshStandardMaterial({ color: 0x00C2D1, wireframe: true, emissive: 0x003344 });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const pl = new THREE.PointLight(0x00C2D1, 2, 10);
    pl.position.set(2,2,2);
    scene.add(pl);
    let t = 0;
    function animLoader() { t+=0.02; mesh.rotation.x=t*0.7; mesh.rotation.y=t; renderer.render(scene, cam); requestAnimationFrame(animLoader); }
    animLoader();
})();

// ========== HERO THREE.JS (Neural Network) ==========
(function initHero() {
    const c = document.getElementById('hero-canvas');
    if (!c) return;
    const renderer = new THREE.WebGLRenderer({ canvas: c, alpha: true, antialias: true });
    const W = () => c.parentElement.offsetWidth;
    const H = () => c.parentElement.offsetHeight;
    renderer.setSize(W(), H());
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(60, W()/H(), 0.1, 1000);
    cam.position.z = 30;

    const nodes = [], nodeGeo = new THREE.SphereGeometry(0.18, 8, 8);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0x00C2D1 });
    for(let i=0;i<80;i++){
        const m = new THREE.Mesh(nodeGeo, nodeMat.clone());
        m.position.set((Math.random()-0.5)*60,(Math.random()-0.5)*40,(Math.random()-0.5)*20);
        m.userData = { vx:(Math.random()-0.5)*0.03, vy:(Math.random()-0.5)*0.03, vz:(Math.random()-0.5)*0.015 };
        scene.add(m); nodes.push(m);
    }

    const lineMat = new THREE.LineBasicMaterial({ color: 0x00C2D1, transparent: true, opacity: 0.12 });
    const lineGeo = new THREE.BufferGeometry();
    const linePositions = new Float32Array(nodes.length * nodes.length * 6);
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lineObj = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lineObj);

    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(2000*3);
    for(let i=0;i<2000*3;i++) starPos[i]=(Math.random()-0.5)*300;
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos,3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x445566, size: 0.3 })));

    let mouseX=0, mouseY=0;
    document.addEventListener('mousemove', e => { mouseX=(e.clientX/window.innerWidth-0.5)*2; mouseY=-(e.clientY/window.innerHeight-0.5)*2; });

    function animHero() {
        requestAnimationFrame(animHero);
        nodes.forEach(n => {
            n.position.x += n.userData.vx; n.position.y += n.userData.vy; n.position.z += n.userData.vz;
            if(Math.abs(n.position.x)>30){n.userData.vx*=-1;}
            if(Math.abs(n.position.y)>20){n.userData.vy*=-1;}
            if(Math.abs(n.position.z)>10){n.userData.vz*=-1;}
        });
        let idx=0; const posArr = lineGeo.attributes.position.array;
        for(let i=0;i<nodes.length;i++) for(let j=i+1;j<nodes.length;j++){
            const d = nodes[i].position.distanceTo(nodes[j].position);
            if(d<12){
                posArr[idx++]=nodes[i].position.x; posArr[idx++]=nodes[i].position.y; posArr[idx++]=nodes[i].position.z;
                posArr[idx++]=nodes[j].position.x; posArr[idx++]=nodes[j].position.y; posArr[idx++]=nodes[j].position.z;
            }
        }
        for(;idx<posArr.length;idx++) posArr[idx]=0;
        lineGeo.attributes.position.needsUpdate = true;
        cam.position.x += (mouseX*3 - cam.position.x) * 0.03;
        cam.position.y += (mouseY*2 - cam.position.y) * 0.03;
        cam.lookAt(scene.position);
        renderer.render(scene, cam);
    }
    animHero();
    window.addEventListener('resize', () => { renderer.setSize(W(),H()); cam.aspect=W()/H(); cam.updateProjectionMatrix(); });
})();

// ========== WHY-US 3D PCB Spin ==========
(function initWhyCanvas() {
    const c = document.getElementById('why-canvas');
    const wrap = document.getElementById('why-canvas-wrap');
    if (!c || !wrap) return;
    c.width = wrap.offsetWidth || 500;
    c.height = 380;
    const renderer = new THREE.WebGLRenderer({ canvas: c, alpha: true, antialias: true });
    renderer.setSize(c.width, c.height);
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(40, c.width/c.height, 0.1, 100);
    cam.position.set(0, 0, 6);
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const pl = new THREE.PointLight(0x00C2D1, 3, 20); pl.position.set(3,3,4); scene.add(pl);
    const pl2 = new THREE.PointLight(0x0044ff, 1.5, 15); pl2.position.set(-3,-2,3); scene.add(pl2);
    const group = new THREE.Group(); scene.add(group);
    const board = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 0.1), new THREE.MeshStandardMaterial({ color: 0x0a3020, roughness: 0.5, metalness: 0.1 }));
    group.add(board);
    for(let i=0;i<12;i++){
        const t = new THREE.Mesh(new THREE.BoxGeometry(0.05, Math.random()*1.5+0.3, 0.15), new THREE.MeshStandardMaterial({ color: 0xCCB000, emissive: 0x443300, roughness: 0.3, metalness: 0.9 }));
        t.position.set((Math.random()-0.5)*3.5,(Math.random()-0.5)*2.5,0.06); group.add(t);
    }
    for(let i=0;i<10;i++){
        const t = new THREE.Mesh(new THREE.BoxGeometry(Math.random()*1.5+0.3, 0.05, 0.15), new THREE.MeshStandardMaterial({ color: 0xCCB000, roughness: 0.3, metalness: 0.9 }));
        t.position.set((Math.random()-0.5)*3.5,(Math.random()-0.5)*2.5,0.06); group.add(t);
    }
    const colors = [0x00C2D1, 0xff4455, 0x44ddaa, 0xffaa00];
    for(let i=0;i<15;i++){
        const comp = new THREE.Mesh(new THREE.BoxGeometry(0.15+Math.random()*0.25,0.15+Math.random()*0.25,0.2), new THREE.MeshStandardMaterial({ color: colors[i%4], roughness:0.4, metalness:0.6, emissive: colors[i%4], emissiveIntensity:0.2 }));
        comp.position.set((Math.random()-0.5)*3.2,(Math.random()-0.5)*2.2,0.18); group.add(comp);
    }
    const ic = new THREE.Mesh(new THREE.BoxGeometry(0.8,0.8,0.2), new THREE.MeshStandardMaterial({color:0x111122,roughness:0.6}));
    ic.position.set(0,0,0.16); group.add(ic);
    const icLabel = new THREE.Mesh(new THREE.PlaneGeometry(0.6,0.3), new THREE.MeshBasicMaterial({color:0x00C2D1,transparent:true,opacity:0.5}));
    icLabel.position.set(0,0,0.27); group.add(icLabel);
    group.rotation.x = -0.3;
    function anim() { requestAnimationFrame(anim); group.rotation.y += 0.008; group.rotation.x = -0.3 + Math.sin(Date.now()*0.001)*0.15; renderer.render(scene, cam); }
    anim();
})();

// ========== CTA 3D PARTICLES ==========
(function initCTA() {
    const c = document.getElementById('cta-canvas');
    if (!c) return;
    const sec = c.parentElement;
    c.width = sec.offsetWidth; c.height = sec.offsetHeight;
    c.style.position='absolute'; c.style.inset='0'; c.style.pointerEvents='none';
    const renderer = new THREE.WebGLRenderer({ canvas: c, alpha: true });
    renderer.setSize(c.width, c.height);
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(60, c.width/c.height, 0.1, 100);
    cam.position.z = 15;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(500*3);
    for(let i=0;i<500*3;i++) pos[i]=(Math.random()-0.5)*30;
    geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const pts3 = new THREE.Points(geo, new THREE.PointsMaterial({color:0x00C2D1,size:0.1,transparent:true,opacity:0.6}));
    scene.add(pts3);
    function anim(){ requestAnimationFrame(anim); pts3.rotation.y+=0.001; pts3.rotation.x+=0.0005; renderer.render(scene,cam); }
    anim();
})();

// ========== GLOBAL PARTICLES ==========
(function initParticles() {
    const c = document.getElementById('particles-canvas');
    if (!c) return;
    c.width = window.innerWidth; c.height = window.innerHeight;
    const ctx = c.getContext('2d');
    const particles = Array.from({length:60}, () => ({ x:Math.random()*c.width, y:Math.random()*c.height, r:Math.random()*1.5+0.5, vx:(Math.random()-0.5)*0.3, vy:(Math.random()-0.5)*0.3, a:Math.random() }));
    function draw(){
        ctx.clearRect(0,0,c.width,c.height);
        particles.forEach(p => {
            p.x+=p.vx; p.y+=p.vy;
            if(p.x<0)p.x=c.width; if(p.x>c.width)p.x=0;
            if(p.y<0)p.y=c.height; if(p.y>c.height)p.y=0;
            ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
            ctx.fillStyle=`rgba(0,194,209,${p.a*0.4})`; ctx.fill();
        });
        requestAnimationFrame(draw);
    }
    draw();
    window.addEventListener('resize',()=>{ c.width=window.innerWidth; c.height=window.innerHeight; });
})();

// ========== PROJECTS ==========
// FIX: use the same single API URL for both loading projects and contact form
// Two separate actions keep data completely isolated in different sheets
const PROJECTS_API_URL = "https://script.google.com/macros/s/AKfycbyeLrf6rZmcwpxYzdlBNvjZDRhguP0_Jrf89IwK7qnLC8rOUPZgDfb2QugW0UntmvN7/exec";
const CONTACT_API_URL  = "https://script.google.com/macros/s/AKfycbx2Xs5E6h7BCLPg5R6wTvNBIkDi8UjbOgilSzrDnxFc_-gvtLDU7q8Rg3ckNZ8U0d4oHQ/exec";

const defaultProjects = [
    { title:"PID Ball Balance Robot", tags:["AI","Raspberry Pi","Control"], desc:"روبوت يوازن الكرة باستخدام حساسات PID control مع شرح شامل وكود source كامل.", color:0x0044ff, images:[] },
    { title:"Smart Home Hub", tags:["Arduino","IoT","PCB"], desc:"نظام منزل ذكي يعمل بالواي فاي وتحكم عبر تطبيق موبايل.", color:0x00aa44, images:[] },
    { title:"AI Face Recognition", tags:["AI Vision","OpenCV"], desc:"نظام تعرف على الوجوه باستخدام OpenCV وRaspberry Pi مع دقة 98%.", color:0xff6600, images:[] },
    { title:"Embedded ECG Monitor", tags:["STM32","Embedded"], desc:"جهاز لمراقبة نبضات القلب مع تحليل البيانات وإشارات تحذير.", color:0xff0044, images:[] },
    { title:"Autonomous Drone Control", tags:["FPGA","Control","AI"], desc:"نظام تحكم آلي للطائرات المسيّرة باستخدام FPGA وخوارزميات PID.", color:0xaa00ff, images:[] },
    { title:"Industrial Robot Arm", tags:["Servo","Arduino","6DOF"], desc:"ذراع روبوتية 6 محاور مع تحكم دقيق وإمكانية البرمجة الكاملة.", color:0x00C2D1, images:[] }
];

function normalizeArrayField(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : value.split(',').map(item => item.trim()).filter(Boolean);
        } catch {
            return value.split(',').map(item => item.trim()).filter(Boolean);
        }
    }
    return [];
}

function saveLocalProjects(projects) {
    try { localStorage.setItem('braintechLocalProjects', JSON.stringify(projects)); } catch(e) {}
}

function getLocalProjects() {
    try {
        const local = JSON.parse(localStorage.getItem('braintechLocalProjects') || '[]');
        return Array.isArray(local) ? local : [];
    } catch { return []; }
}

function formatProjectForDisplay(p) {
    return {
        title:  p.title || 'مشروع جديد',
        tags:   normalizeArrayField(p.tags),
        desc:   p.description || p.desc || '',
        color:  0x00C2D1,
        images: normalizeArrayField(p.images || p.image)
    };
}

// FIX: actually fetch from API, cache in localStorage as fallback
async function getDisplayProjects() {
    try {
        const res = await fetch(PROJECTS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'loadProjects' })
        });
        if (!res.ok) throw new Error('Network error');
        const data = await res.json();
        if (data.result === 'success' && Array.isArray(data.projects) && data.projects.length > 0) {
            saveLocalProjects(data.projects);
            return data.projects.map(formatProjectForDisplay);
        }
        throw new Error('No projects from API');
    } catch (err) {
        // Fallback 1: localStorage cache
        const cached = getLocalProjects();
        if (cached.length > 0) return cached.map(formatProjectForDisplay);
        // Fallback 2: built-in defaults
        return defaultProjects.map(formatProjectForDisplay);
    }
}

// ========== SCROLL REVEAL ==========
// FIX: called AFTER projects are injected into DOM, not on a fixed timer
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ========== RENDER PROJECT CARDS ==========
async function initProjects() {
    const projectsData = await getDisplayProjects();
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;

    grid.innerHTML = '';

    if (!projectsData || projectsData.length === 0) {
        grid.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>لا توجد مشاريع حالياً</p></div>';
        // Still run reveal for the rest of the page
        initScrollReveal();
        return;
    }

    projectsData.forEach((p, idx) => {
        const card = document.createElement('div');
        card.className = 'project-card reveal' + (idx%3===1 ? ' reveal-delay-1' : idx%3===2 ? ' reveal-delay-2' : '');
        const canvasId = 'proj-canvas-' + idx;

        const images = normalizeArrayField(p.images || p.image);
        const hasImages = images.length > 0 && images[0];
        const imageHtml = hasImages
            ? `<img src="${images[0]}" alt="${p.title}" style="width:100%;height:100%;object-fit:cover;display:block;">`
            : `<canvas id="${canvasId}" class="project-canvas-3d"></canvas>`;

        card.innerHTML = `
            <div class="project-img">${imageHtml}<div class="project-overlay"></div></div>
            <div class="project-body">
                <div class="project-tags">${normalizeArrayField(p.tags).map(t=>`<span class="tag">${t}</span>`).join('')}</div>
                <div class="project-title">${p.title}</div>
                <div class="project-desc">${(p.desc||'').substring(0,70)}...</div>
                <div class="project-arrow">عرض التفاصيل <i class="fas fa-arrow-left"></i></div>
            </div>`;
        card.addEventListener('click', () => openModal(p));
        grid.appendChild(card);

        if (!hasImages) {
            setTimeout(() => {
                const c = document.getElementById(canvasId);
                if (!c) return;
                c.width = c.offsetWidth || 320; c.height = 200;
                const renderer = new THREE.WebGLRenderer({ canvas: c, alpha: true, antialias: true });
                renderer.setSize(c.width, 200); renderer.setClearColor(0x000000, 0);
                const scene = new THREE.Scene();
                const cam = new THREE.PerspectiveCamera(45, c.width/200, 0.1, 100);
                cam.position.z = 4;
                scene.add(new THREE.AmbientLight(0xffffff, 0.3));
                const pl = new THREE.PointLight(p.color||0x00C2D1, 3, 15); pl.position.set(2,2,3); scene.add(pl);
                const shapes = [
                    new THREE.IcosahedronGeometry(0.8,0), new THREE.OctahedronGeometry(0.8,0),
                    new THREE.TorusGeometry(0.6,0.25,8,12), new THREE.BoxGeometry(1.2,1.2,1.2),
                    new THREE.ConeGeometry(0.7,1.4,6), new THREE.CylinderGeometry(0.3,0.7,1.2,8)
                ];
                const mat = new THREE.MeshStandardMaterial({ color: p.color||0x00C2D1, wireframe:true, emissive: p.color||0x00C2D1, emissiveIntensity:0.3 });
                const mesh = new THREE.Mesh(shapes[idx%shapes.length], mat);
                scene.add(mesh);
                const orbitGeo = new THREE.BufferGeometry();
                const orbitPos = new Float32Array(50*3);
                for(let i=0;i<50;i++){ const a=Math.random()*Math.PI*2, r=1.5+Math.random(); orbitPos[i*3]=Math.cos(a)*r; orbitPos[i*3+1]=(Math.random()-0.5)*2; orbitPos[i*3+2]=Math.sin(a)*r; }
                orbitGeo.setAttribute('position',new THREE.BufferAttribute(orbitPos,3));
                scene.add(new THREE.Points(orbitGeo, new THREE.PointsMaterial({color:p.color||0x00C2D1,size:0.06,transparent:true,opacity:0.7})));
                let hovered=false;
                card.addEventListener('mouseenter',()=>hovered=true);
                card.addEventListener('mouseleave',()=>hovered=false);
                function anim(){ requestAnimationFrame(anim); mesh.rotation.y+=hovered?0.025:0.01; mesh.rotation.x+=hovered?0.015:0.005; renderer.render(scene,cam); }
                anim();
            }, 100);
        }
    });

    // FIX: initScrollReveal AFTER cards are in DOM
    // Small delay lets the browser paint the cards first
    setTimeout(initScrollReveal, 50);
}

// ========== LOAD ON WINDOW LOAD ==========
window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) { loader.style.opacity = '0'; loader.style.visibility = 'hidden'; }
        initProjects();
    }, 1800);
});

// ========== NAV SCROLL ==========
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// ========== COUNT UP ==========
const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if(!e.isIntersecting) return;
        const el = e.target;
        const target = +el.dataset.target;
        let current = 0;
        const step = target / 60;
        const timer = setInterval(() => {
            current = Math.min(current + step, target);
            el.textContent = Math.floor(current);
            if(current >= target) clearInterval(timer);
        }, 25);
        countObserver.unobserve(el);
    });
}, { threshold: 0.5 });
document.querySelectorAll('.count-up').forEach(el => countObserver.observe(el));

// ========== MODAL ==========
function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) modal.classList.remove('open');
}

function openModal(p) {
    document.getElementById('modalTitle').textContent = p.title;
    document.getElementById('modalDesc').textContent = p.desc;
    document.getElementById('modalTags').innerHTML = p.tags.map(t=>`<span class="tag">${t}</span>`).join('');

    const imagesContainer = document.getElementById('modalImages');
    const images = normalizeArrayField(p.images || p.image);
    if (images.length > 0) {
        imagesContainer.innerHTML = images.map(img => `<img src="${img}" alt="${p.title}" loading="lazy">`).join('');
    } else {
        imagesContainer.innerHTML = '<p style="color:var(--gray);">لا توجد صور لهذا المشروع</p>';
    }

    document.getElementById('modal').classList.add('open');
}

// FIX: single clean close handler — no duplicate onclick in HTML needed
const closeModalBtn = document.getElementById('closeModal');
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        closeModal();
    });
}

const modalElement = document.getElementById('modal');
if (modalElement) {
    modalElement.addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
});

// ========== LANG TOGGLE ==========
let isAr = true;
const langBtn = document.getElementById('langBtn');
if (langBtn) {
    langBtn.addEventListener('click', () => {
        isAr = !isAr;
        document.documentElement.dir = isAr ? 'rtl' : 'ltr';
        langBtn.textContent = isAr ? 'EN' : 'AR';
        const line1 = document.querySelector('.hero-title .line1');
        const line2 = document.querySelector('.hero-title .line2');
        const heroSub = document.getElementById('hero-sub');
        const startBtn = document.getElementById('startBtn');
        if (line1) line1.textContent = isAr ? 'نهندس' : 'We Engineer';
        if (line2) line2.textContent = isAr ? 'مشروعك' : 'Your Project';
        if (heroSub) heroSub.textContent = isAr
            ? 'تصميم وتنفيذ المشاريع الهندسية الجامعية باحترافية عالمية'
            : 'Professional design & execution of engineering projects';
        if (startBtn) startBtn.innerHTML = isAr
            ? 'ابدأ مشروعك <i class="fas fa-arrow-left" style="margin-right:8px"></i>'
            : 'Start Your Project <i class="fas fa-arrow-right" style="margin-left:8px"></i>';
    });
}

// ========== SMOOTH SCROLL ==========
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const t = document.querySelector(a.getAttribute('href'));
        if(t){ e.preventDefault(); t.scrollIntoView({behavior:'smooth',block:'start'}); }
    });
});
const scrollToProjects = document.getElementById('scrollToProjects');
if (scrollToProjects) scrollToProjects.onclick = () => document.getElementById('projects').scrollIntoView({behavior:'smooth'});
const startBtn = document.getElementById('startBtn');
if (startBtn) startBtn.onclick = () => document.getElementById('contact').scrollIntoView({behavior:'smooth'});

// ========== CONTACT FORM ==========
// FIX: sends to CONTACT_API_URL with action:"contactForm" → goes to "ContactForms" sheet
// completely separate from admin login and projects data
function handleForm(e) {
    e.preventDefault();

    const btn     = document.getElementById('submitBtn');
    const btnText = document.getElementById('submitText');
    const status  = document.getElementById('formStatus');

    const name    = document.getElementById('f-name').value.trim();
    const phone   = document.getElementById('f-phone').value.trim();
    const email   = document.getElementById('f-email').value.trim();
    const project = document.getElementById('f-project').value;
    const message = document.getElementById('f-message').value.trim();

    btn.disabled = true;
    btn.style.opacity = '0.75';
    btnText.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
    status.style.display = 'none';

    fetch(CONTACT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'contactForm', name, phone, email, project, message })
    })
    .then(async response => {
        if (!response.ok) throw new Error('Network error');
        const data = await response.json().catch(() => null);
        if (data && data.result && data.result !== 'success') throw new Error(data.error || 'Failed');

        btnText.innerHTML = '<i class="fas fa-check"></i> تم الإرسال!';
        btn.style.opacity = '1';
        btn.style.background = 'linear-gradient(135deg,#00aa66,#007744)';
        status.style.display = 'block';
        status.style.background = 'rgba(0,170,102,0.12)';
        status.style.border = '1px solid rgba(0,170,102,0.4)';
        status.style.color = '#00dd88';
        status.innerHTML = '✅ تم استلام طلبك بنجاح! سنتواصل معك خلال 24 ساعة.';
        document.getElementById('contactForm').reset();
        setTimeout(() => {
            btn.disabled = false;
            btn.style.background = '';
            btnText.innerHTML = '<i class="fas fa-paper-plane"></i> إرسال الطلب';
        }, 4000);
    })
    .catch(() => {
        btn.disabled = false;
        btn.style.opacity = '1';
        btnText.innerHTML = '<i class="fas fa-paper-plane"></i> إرسال الطلب';
        status.style.display = 'block';
        status.style.background = 'rgba(255,50,50,0.1)';
        status.style.border = '1px solid rgba(255,80,80,0.3)';
        status.style.color = '#ff6666';
        status.innerHTML = '❌ حدث خطأ، يرجى المحاولة مجدداً أو التواصل عبر الواتساب.';
    });
}

// ========== LOGIN BUTTON ==========
const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
    loginBtn.onclick = () => { window.location.href = 'admin.html'; };
}

// ========== HAMBURGER MENU ==========
const hamburger = document.getElementById('hamburger');
if (hamburger) {
    hamburger.onclick = () => {
        const navLinks = document.querySelector('.nav-links');
        hamburger.classList.toggle('active');
        if (navLinks) navLinks.classList.toggle('active');
    };
}
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        const ham = document.getElementById('hamburger');
        const nav = document.querySelector('.nav-links');
        if (ham) ham.classList.remove('active');
        if (nav) nav.classList.remove('active');
    });
});

// ========== PWA SERVICE WORKER ==========
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            showUpdateNotification();
                        }
                    });
                });
            })
            .catch(() => {});
    });
}

function showUpdateNotification() {
    const updateDiv = document.createElement('div');
    updateDiv.id = 'pwa-update';
    updateDiv.innerHTML = `
        <div style="position:fixed;top:20px;left:50%;transform:translateX(-50%);background:rgba(0,194,209,0.9);color:#000;padding:15px 25px;border-radius:10px;box-shadow:0 4px 20px rgba(0,194,209,0.3);z-index:10000;font-family:'Cairo',sans-serif;text-align:center;backdrop-filter:blur(10px);">
            <p style="margin:0 0 10px 0;font-weight:600;">تحديث جديد متاح!</p>
            <button onclick="updatePWA()" style="background:#000;color:#00C2D1;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-weight:600;margin-right:10px;">تحديث الآن</button>
            <button onclick="dismissUpdate()" style="background:transparent;color:#000;border:1px solid #000;padding:8px 16px;border-radius:6px;cursor:pointer;">لاحقاً</button>
        </div>`;
    document.body.appendChild(updateDiv);
}

function updatePWA() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(reg => {
            if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        });
    }
    dismissUpdate();
}

function dismissUpdate() {
    const d = document.getElementById('pwa-update');
    if (d) d.remove();
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', event => {
        if (event.data && event.data.type === 'SKIP_WAITING') window.location.reload();
    });
}

// ========== PWA INSTALL PROMPT ==========
let deferredPrompt;
const installBtn = document.createElement('button');
installBtn.id = 'pwa-install-btn';
installBtn.innerHTML = '<i class="fas fa-download"></i> تثبيت التطبيق';
installBtn.style.cssText = 'position:fixed;bottom:20px;left:20px;background:linear-gradient(135deg,#00C2D1,#00a8b8);color:#000;border:none;padding:12px 20px;border-radius:50px;font-family:"Cairo",sans-serif;font-weight:600;cursor:pointer;box-shadow:0 4px 15px rgba(0,194,209,0.3);z-index:1000;display:none;transition:all 0.3s;';
installBtn.onmouseover = () => installBtn.style.transform = 'translateY(-2px)';
installBtn.onmouseout  = () => installBtn.style.transform = 'translateY(0)';
installBtn.onclick = async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
        installBtn.style.display = 'none';
    }
};
document.body.appendChild(installBtn);

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'block';
    setTimeout(() => { installBtn.style.display = 'none'; }, 30000);
});

window.addEventListener('appinstalled', () => { installBtn.style.display = 'none'; });
