// DOM elementlarini olish
const questionsList = document.getElementById('questionsList');
const searchInput = document.getElementById('searchInput');
const categoryBtns = document.querySelectorAll('.category-btn');

// Savollar massivi
let questions = [];

// Savollarni questions/ papkasidan o'qish
async function loadQuestions() {
    try {
        // questions/ papkasidagi barcha JSON fayllarni o'qish
        const response = await fetch('questions/questions.json');
        const data = await response.json();
        questions = Array.isArray(data) ? data : [data];
        
        // Savollarni ko'rsatish
        loadAndFilterQuestions();
    } catch (error) {
        console.error('Savollarni yuklashda xatolik:', error);
        questionsList.innerHTML = `
            <div class="text-center text-gray-400 py-8">
                <i class="fas fa-exclamation-circle mb-4 text-4xl"></i>
                <p>Savollarni yuklashda xatolik yuz berdi</p>
                <p class="text-sm mt-2">questions/questions.json faylini tekshiring</p>
            </div>
        `;
    }
}

// Kod sintaksis highlighter
function highlightCode(text) {
    return text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
        return `<pre class="bg-gray-900 p-4 rounded-lg overflow-x-auto"><code class="text-gray-300">${code}</code></pre>`;
    });
}

// Qo'shimcha resurslarni ko'rsatish
function displayResources(resources) {
    if (!resources || resources.length === 0) return '';
    
    return `
        <div class="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h4 class="text-sm font-semibold text-gray-400 mb-2">Qo'shimcha ma'lumotlar:</h4>
            <ul class="space-y-2">
                ${resources.map(resource => `
                    <li>
                        <a href="${resource.url}" 
                           target="_blank" 
                           class="text-blue-400 hover:text-blue-300 transition-colors flex items-center">
                            <i class="fas fa-external-link-alt mr-2 text-xs"></i>
                            ${resource.title}
                        </a>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
}

// Savollarni ko'rsatish
function displayQuestions(filteredQuestions) {
    questionsList.innerHTML = '';
    
    if (filteredQuestions.length === 0) {
        questionsList.innerHTML = `
            <div class="text-center text-gray-400 py-8">
                <i class="fas fa-search mb-4 text-4xl"></i>
                <p>Savollar topilmadi</p>
            </div>
        `;
        return;
    }
    
    // Savollarni ID bo'yicha tartiblash (yangi savollar yuqorida)
    filteredQuestions.sort((a, b) => b.id - a.id);
    
    filteredQuestions.forEach(q => {
        const card = document.createElement('div');
        card.className = 'question-card';
        card.innerHTML = `
            <div class="flex justify-between items-start">
                <h3 class="text-lg font-semibold mb-2 text-gray-100">${q.question}</h3>
                <span class="px-3 py-1 bg-blue-500 bg-opacity-20 text-blue-400 rounded-full text-sm">
                    ${q.category}
                </span>
            </div>
            <div class="answer">
                ${highlightCode(q.answer)}
                ${displayResources(q.resources)}
            </div>
            <button class="show-answer mt-4">
                <i class="fas fa-code mr-2"></i>Javobni ko'rsatish
            </button>
        `;
        
        const showAnswerBtn = card.querySelector('.show-answer');
        const answer = card.querySelector('.answer');
        
        showAnswerBtn.addEventListener('click', () => {
            answer.classList.toggle('show');
            showAnswerBtn.innerHTML = answer.classList.contains('show') ? 
                '<i class="fas fa-eye-slash mr-2"></i>Javobni yashirish' : 
                '<i class="fas fa-code mr-2"></i>Javobni ko\'rsatish';
        });
        
        questionsList.appendChild(card);
    });
}

// Kategoriya bo'yicha filtrlash
categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const category = btn.dataset.category;
        loadAndFilterQuestions(category);
    });
});

// Qidiruv
let searchTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const searchTerm = e.target.value.toLowerCase();
        loadAndFilterQuestions('all', searchTerm);
    }, 300);
});

// Savollarni yuklash va filtrlash
function loadAndFilterQuestions(category = 'all', searchTerm = '') {
    let filtered = questions;
    
    // Kategoriya bo'yicha filtrlash
    if (category !== 'all') {
        filtered = filtered.filter(q => q.category === category);
    }
    
    // Qidiruv bo'yicha filtrlash
    if (searchTerm) {
        filtered = filtered.filter(q => 
            q.question.toLowerCase().includes(searchTerm) || 
            q.answer.toLowerCase().includes(searchTerm)
        );
    }
    
    displayQuestions(filtered);
}

// Sahifa yuklanganda savollarni o'qish
loadQuestions();
