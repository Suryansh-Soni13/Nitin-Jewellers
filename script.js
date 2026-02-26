document.addEventListener('DOMContentLoaded', () => {

    /* --- ICONS INITIALIZATION --- */
    lucide.createIcons();

    /* --- DYNAMIC TICKER HEIGHT FOR NAVBAR --- */
    const ticker = document.querySelector('.gold-ticker');
    const navbar = document.getElementById('navbar');

    function setNavbarTop() {
        if (ticker && navbar) {
            const tickerH = ticker.offsetHeight;
            navbar.style.top = tickerH + 'px';
        }
    }
    setNavbarTop();
    window.addEventListener('resize', setNavbarTop);

    /* --- SCROLL PROGRESS & NAVBAR --- */
    const progressBar = document.getElementById('progress-bar');

    window.addEventListener('scroll', () => {
        // Scroll Progress
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercentage = (scrollTop / scrollHeight) * 100;
        if (progressBar) {
            progressBar.style.width = scrollPercentage + '%';
        }

        // Sticky Navbar — slides up to top when user scrolls
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
            navbar.style.top = '0';
        } else {
            navbar.classList.remove('scrolled');
            setNavbarTop();
        }
    });

    /* --- MOBILE MENU TOGGLE --- */
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (mobileMenuBtn && mobileMenuClose && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.add('active');
            mobileMenu.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        });

        mobileMenuClose.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            mobileMenu.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        });

        // Close menu when a link is clicked
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                mobileMenu.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            });
        });

        // Close on backdrop click (outside menu content)
        mobileMenu.addEventListener('click', (e) => {
            if (e.target === mobileMenu) {
                mobileMenu.classList.remove('active');
                mobileMenu.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            }
        });
    }

    /* --- SCROLL REVEAL ANIMATION --- */
    const revealElements = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 80;

        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                element.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Trigger on load

});
