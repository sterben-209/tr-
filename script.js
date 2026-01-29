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


function showcalculating() {
    const ResultScreen = document.getElementById('result-screen');
    ResultScreen.classList.remove('hidden');
    // alert(scores[0]);
    // alert(scores[1]);
    // alert(scores[2]);

    const highestScoreName = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    const result = RESULT.find(item => item.name == highestScoreName);
    const img = document.getElementById('img1');
    img.src = result.img; 
    const name = document.getElementById('tea-name');
    name.innerText = result.name;
    const advice1 = document.getElementById('advice1');
    advice1.innerText = result.advice1;
    const advice2 = document.getElementById('advice2');
    advice2.innerText = result.advice2;
    ResultScreen.classList.remove('hidden');
    
}


RESULT=[
    {
        name : "REST",
        advice1 :"Sau một ngày dài gánh vác những lo toan, đôi khi điều duy nhất chúng ta cần không phải là một giấc ngủ ép buộc, mà là một cái ôm an yên cho tâm hồn. Hãy để vị ngọt thanh của táo đỏ xoa dịu đi những mệt mỏi đang đè nặng, và để lạc tiên nhẹ nhàng làm lắng xuống những cảm xúc xao động trong lòng. Đây không phải là sự phụ thuộc, mà là cách bạn chọn để yêu thương chính mình. Một chút hương trà thoảng nhẹ sẽ đưa bạn vào giấc ngủ tự nhiên nhất, nơi tâm trí được thả lỏng hoàn toàn, không còn những nặng nề hay âu lo, chỉ còn lại sự thư thái và bình yên tuyệt đối",
        advice2 : "Có những lúc tâm trí chúng ta giống như một mặt hồ bị xáo động, cần lắm một khoảng lặng để mọi thứ trở nên trong trẻo trở lại. Sự kết hợp giữa lá sen và các thảo mộc tự nhiên chính là món quà để giúp bạn tìm lại nhịp điệu bình lặng vốn có. Không cần phải cố gắng gượng ép, hãy cứ để cơ thể được thả lỏng theo sắc trà vàng nhạt thuần khiết. Từng ngụm trà ấm sẽ giúp giảm bớt căng thẳng thần kinh, đưa bạn đến một giấc ngủ sâu và trọn vẹn. Khi thức dậy vào sáng mai, bạn sẽ cảm nhận được một sự khởi đầu mới đầy tỉnh táo, bởi trái tim bạn đã được chăm sóc và 'sạc' đầy năng lượng sau một đêm nghỉ ngơi đúng nghĩa.",
        price : "100000 Vnd",
        img : "./img/result-rest.jpg"
    },
    {
        name : "FREE",
        advice1 :"Sau một ngày dài gánh vác những lo toan, đôi khi điều duy nhất chúng ta cần không phải là một giấc ngủ ép buộc, mà là một cái ôm an yên cho tâm hồn. Hãy để vị ngọt thanh của táo đỏ xoa dịu đi những mệt mỏi đang đè nặng, và để lạc tiên nhẹ nhàng làm lắng xuống những cảm xúc xao động trong lòng. Đây không phải là sự phụ thuộc, mà là cách bạn chọn để yêu thương chính mình. Một chút hương trà thoảng nhẹ sẽ đưa bạn vào giấc ngủ tự nhiên nhất, nơi tâm trí được thả lỏng hoàn toàn, không còn những nặng nề hay âu lo, chỉ còn lại sự thư thái và bình yên tuyệt đối",
        advice2 : "Có những lúc tâm trí chúng ta giống như một mặt hồ bị xáo động, cần lắm một khoảng lặng để mọi thứ trở nên trong trẻo trở lại. Sự kết hợp giữa lá sen và các thảo mộc tự nhiên chính là món quà để giúp bạn tìm lại nhịp điệu bình lặng vốn có. Không cần phải cố gắng gượng ép, hãy cứ để cơ thể được thả lỏng theo sắc trà vàng nhạt thuần khiết. Từng ngụm trà ấm sẽ giúp giảm bớt căng thẳng thần kinh, đưa bạn đến một giấc ngủ sâu và trọn vẹn. Khi thức dậy vào sáng mai, bạn sẽ cảm nhận được một sự khởi đầu mới đầy tỉnh táo, bởi trái tim bạn đã được chăm sóc và 'sạc' đầy năng lượng sau một đêm nghỉ ngơi đúng nghĩa.",
        price : "100000 Vnd",
        img : "./img/result-free.png"      
    },
        {
        name : "FRESH",
        advice1 :"Sau một ngày dài gánh vác những lo toan, đôi khi điều duy nhất chúng ta cần không phải là một giấc ngủ ép buộc, mà là một cái ôm an yên cho tâm hồn. Hãy để vị ngọt thanh của táo đỏ xoa dịu đi những mệt mỏi đang đè nặng, và để lạc tiên nhẹ nhàng làm lắng xuống những cảm xúc xao động trong lòng. Đây không phải là sự phụ thuộc, mà là cách bạn chọn để yêu thương chính mình. Một chút hương trà thoảng nhẹ sẽ đưa bạn vào giấc ngủ tự nhiên nhất, nơi tâm trí được thả lỏng hoàn toàn, không còn những nặng nề hay âu lo, chỉ còn lại sự thư thái và bình yên tuyệt đối",
        advice2 : "Có những lúc tâm trí chúng ta giống như một mặt hồ bị xáo động, cần lắm một khoảng lặng để mọi thứ trở nên trong trẻo trở lại. Sự kết hợp giữa lá sen và các thảo mộc tự nhiên chính là món quà để giúp bạn tìm lại nhịp điệu bình lặng vốn có. Không cần phải cố gắng gượng ép, hãy cứ để cơ thể được thả lỏng theo sắc trà vàng nhạt thuần khiết. Từng ngụm trà ấm sẽ giúp giảm bớt căng thẳng thần kinh, đưa bạn đến một giấc ngủ sâu và trọn vẹn. Khi thức dậy vào sáng mai, bạn sẽ cảm nhận được một sự khởi đầu mới đầy tỉnh táo, bởi trái tim bạn đã được chăm sóc và 'sạc' đầy năng lượng sau một đêm nghỉ ngơi đúng nghĩa.",
        price : "100000 Vnd",
        img : "./img/result-fresh.jpg"      
    }
];

function retry() {
  const retry = document.getElementById('retry-btn');
  const result = document.getElementById('result-screen');
  const healing = document.getElementById('healing');
  retry.addEventListener('click',() => {
    result.classList.add('hidden');
    healing.classList.remove('hidden');
    scores = {REST:0, FREE:0, FRESH:0};
    currentQuestionIndex = 0;
    const progress = document.getElementById('sub-bar');
    progress.style.width = '25%';
  });

};

retry();

/* --- Hamburger Menu Logic (Corrected) --- */
document.addEventListener('DOMContentLoaded', () => {
    const hamburgerIcon = document.getElementById('hamburger-icon');
    const closeIcon = document.getElementById('close-icon');
    const mobileNavContainer = document.getElementById('mobile-nav-container');
    
    // Correctly select the links inside the new container
    const navLinks = mobileNavContainer.querySelectorAll('.mobile-nav-links a');

    hamburgerIcon.addEventListener('click', () => {
        mobileNavContainer.classList.add('active');
    });

    closeIcon.addEventListener('click', () => {
        mobileNavContainer.classList.remove('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileNavContainer.classList.remove('active');
        });
    });
});
