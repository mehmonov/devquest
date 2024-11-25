// DOM elementlarini olish
const form = document.getElementById('questionForm');
const addResourceBtn = document.getElementById('addResource');
const resourcesContainer = document.getElementById('resources');
const previewBtn = document.getElementById('previewBtn');
const previewModal = document.getElementById('previewModal');
const closePreviewBtn = document.getElementById('closePreview');
const previewContent = document.getElementById('previewContent');

// Yangi manba qo'shish
addResourceBtn.addEventListener('click', () => {
    const resourceItem = document.createElement('div');
    resourceItem.className = 'resource-item space-y-4 mt-4';
    resourceItem.innerHTML = `
        <div class="flex items-center space-x-2">
            <div class="flex-1">
                <input type="text" placeholder="Manba nomi" class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2">
                <input type="url" placeholder="Manba linki (URL)" class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <button type="button" class="delete-resource text-red-400 hover:text-red-300 transition-colors">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    // O'chirish tugmasini qo'shish
    const deleteBtn = resourceItem.querySelector('.delete-resource');
    deleteBtn.addEventListener('click', () => {
        resourceItem.remove();
    });

    resourcesContainer.appendChild(resourceItem);
});

// Kod sintaksis highlighter
function highlightCode(text) {
    return text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
        return `<pre class="bg-gray-900 p-4 rounded-lg overflow-x-auto"><code class="text-gray-300">${code}</code></pre>`;
    });
}

// Preview modalni ochish
previewBtn.addEventListener('click', () => {
    const formData = getFormData();
    
    previewContent.innerHTML = `
        <div class="question-card">
            <div class="flex justify-between items-start">
                <h3 class="text-lg font-semibold mb-2 text-gray-100">${formData.question}</h3>
                <span class="px-3 py-1 bg-blue-500 bg-opacity-20 text-blue-400 rounded-full text-sm">
                    ${formData.category}
                </span>
            </div>
            <div class="answer show">
                ${highlightCode(formData.answer)}
                ${formData.resources.length > 0 ? `
                    <div class="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                        <h4 class="text-sm font-semibold text-gray-400 mb-2">Qo'shimcha ma'lumotlar:</h4>
                        <ul class="space-y-2">
                            ${formData.resources.map(resource => `
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
                ` : ''}
            </div>
        </div>
    `;
    
    previewModal.style.display = 'flex';
});

// Preview modalni yopish
closePreviewBtn.addEventListener('click', () => {
    previewModal.style.display = 'none';
});

// Forma ma'lumotlarini olish
function getFormData() {
    const category = document.getElementById('category').value;
    const question = document.getElementById('question').value;
    const answer = document.getElementById('answer').value;
    
    const resources = [];
    const resourceItems = document.querySelectorAll('.resource-item');
    resourceItems.forEach(item => {
        const titleInput = item.querySelector('input[type="text"]');
        const urlInput = item.querySelector('input[type="url"]');
        
        if (titleInput.value && urlInput.value) {
            resources.push({
                title: titleInput.value,
                url: urlInput.value
            });
        }
    });
    
    return {
        category,
        question,
        answer,
        resources
    };
}

// Formani yuborish
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = getFormData();
    
    // Yangi savolni yaratish
    const questionData = {
        id: Date.now(),
        ...formData
    };
    
    // JSON faylni yaratish va yuklab olish
    const blob = new Blob([JSON.stringify(questionData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `question_${questionData.id}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    
    // Formani tozalash
    form.reset();
    while (resourcesContainer.children.length > 1) {
        resourcesContainer.removeChild(resourcesContainer.lastChild);
    }
    
    // Xabar ko'rsatish
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg';
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-check-circle mr-2"></i>
            Savol muvaffaqiyatli saqlandi! JSON fayl yuklab olindi.
            <br>
            Yuklab olingan faylni "questions" papkasiga joylashtiring.
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
});
