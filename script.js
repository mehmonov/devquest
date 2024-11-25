// DOM elementlarini olish
const questionsList = document.getElementById('questionsList');
const searchInput = document.getElementById('searchInput');
const categoryBtns = document.querySelectorAll('.category-btn');
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = '.json';
fileInput.multiple = true;
fileInput.style.display = 'none';
document.body.appendChild(fileInput);

// JSON faylni yuklash tugmasi
const uploadBtn = document.createElement('button');
uploadBtn.className = 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center';
uploadBtn.innerHTML = '<i class="fas fa-upload mr-2"></i>Savollar faylini yuklash';
document.querySelector('.controls').appendChild(uploadBtn);

// Savollar massivi
let questions = [];

// JSON faylni yuklash
uploadBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
        questions = [];
        
        try {
            for (const file of files) {
                const text = await file.text();
                const question = JSON.parse(text);
                questions.push(question);
            }
            
            loadAndFilterQuestions();
            
            // Xabar ko'rsatish
            const notification = document.createElement('div');
            notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg';
            notification.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-check-circle mr-2"></i>
                    ${files.length} ta savol muvaffaqiyatli yuklandi!
                </div>
            `;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        } catch (error) {
            console.error('JSON faylni o\'qishda xatolik:', error);
            alert('Noto\'g\'ri format! JSON fayl yuklang.');
        }
    }
});

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

// Boshlang'ich holatda savollarni yuklash
loadAndFilterQuestions();
