// Easing functions - chọn loại animation khác nhau
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutQuad(t) {
    return 1 - (1 - t) * (1 - t);
}

window.addEventListener('scroll', function() {
    const logo2 = document.querySelector('.sub2-logo');
    let scrollPosition = window.scrollY;
    let windowHeight = window.innerHeight;
    
    // Tính progress từ 0 đến 1
    let progress = Math.min(scrollPosition / windowHeight, 1);
    
    // Áp dụng easing function mượt nhất (easeInOutCubic)
    let easedProgress = easeInOutCubic(progress);
    
    // Opacity mờ dần từ 1 về 0 với transition mượt
    logo2.style.opacity = 1 - easedProgress;
    logo2.style.transition = 'opacity 0.1s ease-out';
    
    const navbar = document.querySelector('.nav');
    navbar.style.opacity = easedProgress;
    navbar.style.transition = 'opacity 0.1s ease-out';
});



// Khởi tạo trạng thái tương tự như INITIAL_STATE trong App.tsx
let scores = {
  REST: 0,
  FREE: 0,
  FRESH: 0
};

const start = document.querySelector('.start-choice');
const healing = document.getElementById('healing');
const quizscreen = document.getElementById('quiz-screen');

start.addEventListener('click',function(event){
    event.preventDefault();
    healing.classList.add('hidden');
    renderquestion();

});


// 1. Khai báo mảng chứa danh sách câu hỏi
const QUESTIONS = [
  {
    id: 1,
    text: "Cảm xúc hiện tại của bạn là gì?",
    options: [
      { text: "Mệt mỏi, rã rời, muốn buông xuôi", points: { REST: 3, FREE: 1, FRESH: 0 } },
      { text: "Căng thẳng, lo âu, rối bời", points: { REST: 1, FREE: 3, FRESH: 0 } },
      { text: "Lờ đờ, thiếu sức sống, trống rỗng", points: { REST: 0, FREE: 1, FRESH: 3 } }
    ]
  },
  {
    id: 2,
    text: "Bạn khao khát điều gì lúc này?",
    options: [
      { text: "Một giấc ngủ sâu không mộng mị", points: { REST: 3, FREE: 0, FRESH: 0 } },
      { text: "Sự vỗ về, an ủi, bình yên", points: { REST: 1, FREE: 3, FRESH: 0 } },
      { text: "Cảm hứng mới,sự tỉnh táo", points: { REST: 0, FREE: 0, FRESH: 3 } }
    ]
  },
  // Tiếp tục mảng QUESTIONS...
  {
    id: 3,
    text: "Hương vị nào sẽ đánh thức bạn?",
    options: [
      { text: "Hương hoa nhẹ nhàng, thanh tao.", points: { REST: 3, FREE: 1, FRESH: 0 } },
      { text: "Vị ngọt ấm nồng, cay nhẹ.", points: { REST: 0, FREE: 3, FRESH: 0 } },
      { text: "Sự tươi mát, sảng khoái.", points: { REST: 0, FREE: 0, FRESH: 3 } }
    ]
  },
  {
    id: 4,
    text: "Không gian chữa lành của bạn?",
    options: [
      { text: "Phòng ngủ tối, nến thơm dịu.", points: { REST: 3, FREE: 1, FRESH: 0 } },
      { text: "Góc sofa, chăn ấm, nhạc lo-fi.", points: { REST: 1, FREE: 3, FRESH: 0 } },
      { text: "Ban công đầy nắng và gió.", points: { REST: 0, FREE: 0, FRESH: 3 } }
    ]
  }
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function handleOptionSelect(points) {
    for(let type in points){
        scores[type] += points[type];
    }
    if(currentQuestionIndex < QUESTIONS.length - 1) {
        currentQuestionIndex++;
        const progress = document.getElementById('sub-bar');
        progress.style.width = 25*(currentQuestionIndex+1) +"%";
        renderquestion();
    }else{
        const screen = document.getElementById('quiz-screen');
        screen.classList.add('hidden');
        const loading = document.getElementById('loading');
        loading.classList.remove('hidden');
        await sleep(1000);
        loading.classList.add('hidden');
        showcalculating(); 
    }
}

let currentQuestionIndex = 0;

function renderquestion(){
    const screen = document.getElementById('quiz-screen');
    screen.classList.remove('hidden');
    
    // Thêm class animation
    screen.classList.remove('question-fade');
    void screen.offsetWidth; // Trigger reflow
    screen.classList.add('question-fade');

    const CurrentQuestion = QUESTIONS[currentQuestionIndex];

    const questiontext = document.getElementById('question-text');
    questiontext.innerText = CurrentQuestion.text;

    const id = document.getElementById('id');
    id.innerText = '0'+ CurrentQuestion.id;

    const container = document.getElementById('options-container');
    container.innerHTML = '';


    CurrentQuestion.options.forEach((option) => {
        const btn = document.createElement('button');
        btn.innerText = option.text;
        btn.classList.add('option');
        btn.onclick = () => handleOptionSelect(option.points);
        container.appendChild(btn);
    });
}


function resetQuiz() {
    // 1. Reset điểm số
    scores = {
        REST: 0,
        FREE: 0,
        FRESH: 0
    };
    
    // 2. Reset chỉ số câu hỏi
    currentQuestionIndex = 0;
    
    // 3. Ẩn màn hình kết quả và hiện lại màn hình bắt đầu (healing)
    const ResultScreen = document.getElementById('result-screen');
    const healing = document.getElementById('healing');
    const progress = document.getElementById('sub-bar');
    
    ResultScreen.classList.add('hidden');
    healing.classList.remove('hidden');
    
    // 4. Reset thanh tiến trình
    if (progress) {
        progress.style.width = "0%";
    }

    // 5. Cuộn về phía quiz
    healing.scrollIntoView({ behavior: 'smooth' });
}

function showcalculating() {
    const ResultScreen = document.getElementById('result-screen');
    const highestScoreName = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    const data = RESULT.find(item => item.name == highestScoreName);
    
    let html = '';

    if (data.name === 'REST') {
        // LAYOUT 1: AN YÊN (MIDNIGHT LUXURY)
        html = `
            <div class="result-layout layout-an-yen">
                <section class="result-hero">
                    <div class="hero-bg" style="background-image: url('https://images.unsplash.com/photo-1596525381831-28509e5306ea?q=80&w=2000&auto=format&fit=crop')"></div>
                    <div class="hero-content">
                        <span class="label">Kết quả của bạn</span>
                        <h1>${data.name}</h1>
                        <p class="tagline">${data.tagline}</p>
                    </div>
                </section>
                <section class="result-story">
                    <i class="fas fa-moon"></i>
                    <h2>"Không phải là một giấc ngủ ép buộc, <br/> mà là một cái ôm an yên."</h2>
                    <p class="story-text">${data.advice1}</p>
                </section>
                <section class="result-features">
                    <div class="feature-grid">
                        <div class="feature-img">
                            <img src="${data.img}" alt="REST" onerror="this.src='https://images.unsplash.com/photo-1544785316-6e58aed68a50?auto=format&fit=crop&w=800&q=80'">
                        </div>
                        <div class="feature-list">
                            <span class="label">Tinh túy hội tụ</span>
                            <h3>${data.ingredients}</h3>
                            ${data.features.map((f, i) => `
                                <div class="feature-item">
                                    <span class="num">0${i+1}</span>
                                    <p>${f}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </section>
                <section class="result-ritual">
                    <span class="label">Nghi thức dành cho bạn</span>
                    <p class="ritual-text">"${data.ritual}"</p>
                    <div class="result-btns">
                        <button onclick="window.location.href='${data.url}'" class="btn-main">${data.cta}</button>
                        <button onclick="resetQuiz()" class="btn-ghost">TÌM VỊ TRÀ KHÁC</button>
                    </div>
                </section>
            </div>
        `;
    } else if (data.name === 'FREE') {
        // LAYOUT 2: TĨNH LẶNG (ZEN MINIMAL LUXURY)
        html = `
            <div class="result-layout layout-tinh-lang">
                <section class="result-hero">
                    <div class="hero-grid">
                        <div class="hero-text">
                            <span class="label">Sự lựa chọn của bạn</span>
                            <h1>${data.name}</h1>
                            <p class="tagline">${data.tagline}</p>
                        </div>
                        <div class="hero-img">
                            <img src="${data.img}" alt="FREE" onerror="this.src='https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=1000&q=80'">
                        </div>
                    </div>
                </section>
                <section class="result-story">
                    <div class="story-container">
                        <i class="fas fa-wind"></i>
                        <p class="story-quote">"${data.advice1}"</p>
                    </div>
                </section>
                <section class="result-features">
                    <div class="features-header">
                        <span class="label">Bản giao hưởng thảo mộc</span>
                        <h3>${data.ingredients}</h3>
                    </div>
                    <div class="zen-feature-grid">
                        ${data.features.map((f, i) => `
                            <div class="zen-feature-item">
                                <div class="num-circle">0${i+1}</div>
                                <p>${f}</p>
                            </div>
                        `).join('')}
                    </div>
                </section>
                <section class="result-ritual">
                    <div class="ritual-content">
                        <h3>Nghi thức thưởng trà</h3>
                        <p class="ritual-text">${data.ritual}</p>
                        <div class="result-btns">
                            <button onclick="window.location.href='${data.url}'" class="btn-zen">${data.cta} <i class="fas fa-arrow-right"></i></button>
                            <button onclick="resetQuiz()" class="btn-link">TÌM VỊ TRÀ KHÁC</button>
                        </div>
                    </div>
                </section>
            </div>
        `;
    } else {
        // LAYOUT 3: FRESH (RESORT MORNING LUXURY)
        html = `
            <div class="result-layout layout-fresh-new">
                <section class="result-hero">
                    <div class="resort-shape shape-1"></div>
                    <div class="resort-shape shape-2"></div>
                    <i class="fas fa-sun hero-icon"></i>
                    <span class="label">Năng lượng của bạn</span>
                    <h1 class="gradient-text">${data.name}</h1>
                    <p class="tagline">${data.tagline}</p>
                    <div class="hero-card">
                        <img src="https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?q=80&w=1200&auto=format&fit=crop" alt="FRESH">
                    </div>
                </section>
                <section class="result-story">
                    <div class="story-grid">
                        <div class="story-left">
                            <h2 style="font-family: 'Playfair Display', serif; font-size: 3.5vw; line-height: 1.2; margin-bottom: 4vh;">Khởi đầu mới<br/><span class="italic-text" style="font-style: italic; color: #65a30d;">đầy tươi trẻ.</span></h2>
                            <p style="font-size: 1.2vw; line-height: 1.8; color: #44403c;">${data.advice1}</p>
                        </div>
                        <div class="story-right">
                            <i class="fas fa-sparkles"></i>
                            <span class="label">Đặc quyền</span>
                            <ul style="list-style: none; margin-top: 3vh;">
                                ${data.features.map(f => `
                                    <li style="display: flex; align-items: center; gap: 1vw; font-size: 1.1vw; margin-bottom: 2vh; font-weight: 600; color: #374151;">
                                        <span class="dot" style="width: 0.6vw; height: 0.6vw; background: #84cc16; border-radius: 50%;"></span> 
                                        ${f}
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                </section>
                <section class="result-ritual">
                    <div class="ritual-card">
                        <h3 style="font-family: 'Playfair Display', serif; font-size: 2.5vw; margin-bottom: 3vh; font-weight: 800;">Cách tận hưởng</h3>
                        <p style="font-size: 1.2vw; line-height: 1.7; color: #4b5563; margin-bottom: 6vh;">${data.ritual}</p>
                        <div class="result-btns">
                            <button onclick="window.location.href='${data.url}'" class="btn-dark">${data.cta}</button>
                            <button onclick="resetQuiz()" class="btn-link" style="margin-top: 2vh;">TÌM VỊ TRÀ KHÁC</button>
                        </div>
                    </div>
                </section>
            </div>
        `;
    }

    ResultScreen.innerHTML = html;
    ResultScreen.classList.remove('hidden');
    ResultScreen.style.backgroundColor = 'transparent';
    
    // Cuộn lên đầu trang kết quả
    ResultScreen.scrollIntoView({ behavior: 'smooth' });
}


RESULT=[
    {
        name : "REST",
        tagline: "Một cái ôm an yên cho tâm hồn",
        ingredients: "Táo Đỏ & Lạc Tiên",
        url: "rest.html",
        advice1 :"Sau một ngày dài gánh vác những lo toan, đôi khi điều duy nhất chúng ta cần không phải là một giấc ngủ ép buộc, mà là một cái ôm an yên cho tâm hồn. Hãy để vị ngọt thanh của táo đỏ xoa dịu đi những mệt mỏi đang đè nặng, và để lạc tiên nhẹ nhàng làm lắng xuống những cảm xúc xao động trong lòng. Đây không phải là sự phụ thuộc, mà là cách bạn chọn để yêu thương chính mình.",
        advice2 : "",
        ritual: "Hãm 1 gói trà với 200ml nước ấm 80°C. Nhắm mắt lại, hít một hơi thật sâu hương thơm của táo đỏ và thảo mộc trước khi nhấp ngụm đầu tiên. Hãy để 15 phút thưởng trà là 15 phút bạn hoàn toàn thuộc về chính mình.",
        features: ['Lắng dịu tâm trí', 'Nuôi dưỡng giấc ngủ', 'Phục hồi năng lượng'],
        cta: 'Sở hữu sự bình yên',
        img : "./img/result-rest.jpg"
    },
    {
        name : "FREE",
        tagline: "Khoảng lặng trong trẻo của tâm trí",
        ingredients: "Lá Sen & Thảo Mộc",
        url: "free.html",
        advice1 :"Có những lúc tâm trí chúng ta giống như một mặt hồ bị xáo động, cần lắm một khoảng lặng để mọi thứ trở nên trong trẻo trở lại. Sự kết hợp giữa lá sen và các thảo mộc tự nhiên chính là món quà để giúp bạn tìm lại nhịp điệu bình lặng vốn có. Không cần phải cố gắng gượng ép, hãy cứ để cơ thể được thả lỏng theo sắc trà vàng nhạt thuần khiết.",
        advice2 : "",
        ritual: "Rót nước sôi vào tách sành, thả nhẹ lá trà và chờ đợi 3 phút để sắc vàng nhạt lan tỏa. Uống từng ngụm nhỏ, cảm nhận sự thanh mát của lá sen trôi tuột mọi muộn phiền.",
        features: ['Thanh lọc cơ thể', 'Cân bằng cảm xúc', 'Tái tạo năng lượng'],
        cta: 'Tìm lại sự tĩnh lặng',
        img : "./img/result-free.png"      
    },
    {
        name : "FRESH",
        tagline: "Khởi đầu mới đầy tươi trẻ",
        ingredients: "Đánh thức năng lượng",
        url: "fresh.html",
        advice1 :"FRESH mang đến một luồng gió mới cho ngày làm việc của bạn. Không chỉ là tỉnh táo, đó là sự tỉnh táo tự nhiên, nhẹ nhàng và tràn đầy hứng khởi. Từng nốt hương tinh dầu sả và vỏ quýt sẽ đánh thức mọi giác quan, giúp bạn sẵn sàng chinh phục những thử thách mới.",
        advice2 : "",
        ritual: "Thêm một chút đá viên nếu bạn muốn sự bùng nổ tức thì, hoặc uống ấm để từ từ cảm nhận sự tươi mới len lỏi vào từng tế bào. Một khởi đầu hoàn hảo cho ngày mới.",
        features: ['Bừng sáng tâm trí', 'Thanh mát vòm họng', 'Khởi nguồn cảm hứng'],
        cta: 'Đánh thức bản thân',
        img : "./img/result-fresh.jpg"      
    }
];

function retry() {
  const retryBtn = document.getElementById('retry-btn');
  const result = document.getElementById('result-screen');
  const healing = document.getElementById('healing');
  
  if (retryBtn) {
    retryBtn.addEventListener('click',() => {
      result.classList.add('hidden');
      healing.classList.remove('hidden');
      scores = {REST:0, FREE:0, FRESH:0};
      currentQuestionIndex = 0;
      const progress = document.getElementById('sub-bar');
      if (progress) progress.style.width = '25%';
    });
  }
};

retry();

/* --- Hamburger Menu Logic --- */
function initHamburger() {
    const hamburgerIcon = document.getElementById('hamburger-icon');
    const closeIcon = document.getElementById('close-icon');
    const mobileNavContainer = document.getElementById('mobile-nav-container');

    if (!hamburgerIcon || !mobileNavContainer) {
        console.error('Menu elements not found!');
        return;
    }

    hamburgerIcon.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        mobileNavContainer.classList.add('active');
        console.log('Menu opened');
    });

    if (closeIcon) {
        closeIcon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            mobileNavContainer.classList.remove('active');
            console.log('Menu closed');
        });
    }

    const navLinks = mobileNavContainer.querySelectorAll('.mobile-nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileNavContainer.classList.remove('active');
        });
    });
}

// Chạy ngay lập tức và cả khi DOMContentLoaded
initHamburger();
document.addEventListener('DOMContentLoaded', initHamburger);
