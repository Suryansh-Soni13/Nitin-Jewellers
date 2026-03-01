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

    /* --- LIVE MARKET RATES API (GLOBAL SPOT JSON) --- */
    let lastGold = null;
    let lastSilver = null;

    function fetchLiveRates() {
        const goldVals = document.querySelectorAll('.live-gold-val');
        const silverVals = document.querySelectorAll('.live-silver-val');
        const goldTrends = document.querySelectorAll('.gold-trend');
        const silverTrends = document.querySelectorAll('.silver-trend');

        if (!goldVals.length) return;

        // Using a highly accurate, free, open-source global forex API that provides live XAU (Gold) and XAG (Silver) to INR rates.
        // It's CORS-friendly and updates daily/live.
        fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/inr.json')
            .then(res => {
                if (res.ok) return res.json();
                throw new Error('API failure.');
            })
            .then(data => {
                // The API gives us exactly how much 1 INR is worth in Gold/Silver Ounces.
                // To get INR per 1 Troy Ounce: 1 / currency_rate
                const inrPerOunceGold = 1 / data.inr.xau;
                const inrPerOunceSilver = 1 / data.inr.xag;

                // 1 Troy Ounce = 31.1034768 grams. 
                const inrPerGram24K = inrPerOunceGold / 31.1034768;

                // Convert 24K pure gold price to 22K jewellery price (22/24)
                const inrPerGram22K = inrPerGram24K * (22 / 24);
                const inrPerGramSilver = inrPerOunceSilver / 31.1034768;

                // Adding ~10% premium for Indian Market (Customs Duty + GST standard markup usually applied to retail).
                const marketPremium = 1.10;

                let currentGold = Math.floor(inrPerGram22K * marketPremium);
                let currentSilver = Math.floor(inrPerGramSilver * marketPremium);

                // Initialize tracking variables for the first load
                if (lastGold === null) lastGold = currentGold;
                if (lastSilver === null) lastSilver = currentSilver;

                // Determine change direction since the last fetch
                const goldChange = currentGold - lastGold;
                const silverChange = currentSilver - lastSilver;

                // Update DOM values
                goldVals.forEach(val => val.innerText = '₹' + currentGold.toLocaleString('en-IN'));
                silverVals.forEach(val => val.innerText = '₹' + currentSilver.toLocaleString('en-IN'));

                // Update visual trend arrows
                const updateTrend = (trendElements, change) => {
                    trendElements.forEach(trend => {
                        trend.className = trend.classList.contains('gold-trend') ? 'trend gold-trend' : 'trend silver-trend';
                        if (change > 0) {
                            trend.classList.add('up'); trend.innerHTML = '&#9650;';
                        } else if (change < 0) {
                            trend.classList.add('down'); trend.innerHTML = '&#9660;';
                        } else {
                            trend.innerHTML = '&#9644;'; // No change or flat
                        }
                    });
                };

                updateTrend(goldTrends, goldChange);
                updateTrend(silverTrends, silverChange);

                // Save for next interval comparison
                lastGold = currentGold;
                lastSilver = currentSilver;
            })
            .catch(error => console.error('Error fetching live bullion rates:', error));
    }

    fetchLiveRates();
    setInterval(fetchLiveRates, 60000); // Check for updates every 1 minute
    /* --- AI CHATBOT LOGIC --- */
    const chatbotToggler = document.querySelector(".chatbot-toggler");
    const closeBtn = document.querySelector(".close-btn");
    const chatbox = document.querySelector(".chatbox");
    const chatInput = document.querySelector(".chat-input textarea");
    const sendChatBtn = document.querySelector("#send-btn");
    const quickOptions = document.querySelectorAll(".chatbot-quick-options button");

    if (chatbotToggler && closeBtn && chatbox) {
        chatbotToggler.addEventListener("click", () => {
            document.body.classList.toggle("show-chatbot");
            lucide.createIcons(); // ensure icons map ok
        });
        closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));

        const createChatLi = (message, className) => {
            const chatLi = document.createElement("li");
            chatLi.classList.add("chat", className);
            let chatContent = className === "outgoing" ? `<p></p>` : `<i data-lucide="bot" style="min-width: 32px; min-height: 32px; color: #d4af37; background: #111; padding: 5px; border-radius: 50%; border: 1px solid #d4af37; margin-right: 10px; align-self: flex-end;"></i><p></p>`;
            chatLi.innerHTML = chatContent;
            chatLi.querySelector("p").innerText = message;
            return chatLi;
        };

        const getChatbotResponse = (userMessage) => {
            userMessage = userMessage.toLowerCase();
            let response = "I'm sorry, I couldn't quite understand that. Would you like to know about our Live Gold Rates, our Heritage & Owners, or how to contact our Customer Care?";

            // Intent Matching
            if (userMessage.includes("rate") || userMessage.includes("price") || userMessage.includes("live") || userMessage.includes("gold") || userMessage.includes("silver")) {
                const liveGold = document.querySelector('.live-gold-val')?.innerText || "₹15,000";
                const liveSilver = document.querySelector('.live-silver-val')?.innerText || "₹300";
                response = `Our current live estimated Retail Market Price is ${liveGold}/gm for 22K Gold and ${liveSilver}/gm for Silver. This updates automatically every 60 seconds driven by global forex markets. Can I help you with anything else?`;
            } else if (userMessage.includes("owner") || userMessage.includes("founder") || userMessage.includes("nitin") || userMessage.includes("suryansh") || userMessage.includes("who")) {
                response = "Nitin Jewellers was founded by master manufacturer Nitin Soni in 2011. Recently, his son Suryansh N Soni joined the family business to spearhead our digital presence and global wholesale reach. We hand-craft directly from our Karelibaug workshop.";
            } else if (userMessage.includes("collection") || userMessage.includes("jewellery") || userMessage.includes("jewelry") || userMessage.includes("rings") || userMessage.includes("bridal") || userMessage.includes("design")) {
                response = "We specialize in heavy Bridal Sets, Antique Temple Jewellery, Italian Chains, and exclusive 999 Silver Coins. All of our pieces are 100% BIS Hallmarked. You can find our full lookbook on our 'Collection' page!";
            } else if (userMessage.includes("complain") || userMessage.includes("care") || userMessage.includes("service") || userMessage.includes("contact") || userMessage.includes("phone")) {
                response = "We take customer service very seriously at Nitin Jewellers. You can immediately reach our Karelibaug branch customer care at +91 96014 51370 or email us directly at nitinjewellers.shop@gmail.com. We are here to help!";
            } else if (userMessage.includes("hi") || userMessage.includes("hello") || userMessage.includes("hey")) {
                response = "Hello! Welcome to Nitin Jewellers. I am your digital assistant. Are you looking for our live bullion rates, product catalogue, or workshop details?";
            } else if (userMessage.includes("thanks") || userMessage.includes("thank")) {
                response = "You are very welcome! Don't hesitate to ask if you need anything else.";
            }

            return response;
        };

        const handleChat = (messageText) => {
            const userMessage = messageText || chatInput.value.trim();
            if (!userMessage) return;

            // Clear input
            chatInput.value = "";
            chatInput.style.height = "48px";

            // Hide quick options once they chat
            const opts = document.querySelector('.chatbot-quick-options');
            if (opts) opts.style.display = 'none';

            chatbox.appendChild(createChatLi(userMessage, "outgoing"));
            chatbox.scrollTo(0, chatbox.scrollHeight);

            setTimeout(() => {
                // Thinking...
                const incomingChatLi = createChatLi("Thinking...", "incoming");
                chatbox.appendChild(incomingChatLi);
                lucide.createIcons();
                chatbox.scrollTo(0, chatbox.scrollHeight);

                setTimeout(() => {
                    const response = getChatbotResponse(userMessage);
                    incomingChatLi.querySelector("p").innerHTML = response;
                    chatbox.scrollTo(0, chatbox.scrollHeight);
                }, 600);
            }, 500);
        };

        sendChatBtn.addEventListener("click", () => handleChat());

        chatInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
                e.preventDefault();
                handleChat();
            }
        });

        quickOptions.forEach(btn => {
            btn.addEventListener('click', () => {
                handleChat(btn.innerText);
            });
        });
    }

});
