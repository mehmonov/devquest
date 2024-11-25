<template>
  <div>
    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <!-- Search and Filter -->
      <div class="mb-8 space-y-4">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="category in categories"
            :key="category"
            @click="selectedCategory = category === selectedCategory ? null : category"
            :class="[
              'px-3 py-1 rounded-full text-sm font-medium transition-colors',
              selectedCategory === category
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            ]"
          >
            {{ category }}
          </button>
        </div>

        <div class="relative">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Savollarni qidirish..."
            class="w-full px-4 py-2 bg-gray-800 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- Questions List -->
      <div class="space-y-6">
        <div
          v-for="question in filteredQuestions"
          :key="question.id"
          class="bg-gray-800 rounded-lg p-6 shadow-lg w-full"
        >
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-medium text-gray-100 flex-grow mr-4">
              {{ question.question }}
            </h3>
            <span class="px-3 py-1 bg-blue-500 bg-opacity-20 text-blue-400 rounded-full text-sm">
              {{ question.category }}
            </span>
          </div>

          <div class="flex items-center space-x-4">
            <button
              @click="question.showAnswer = !question.showAnswer"
              class="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center"
            >
              <i :class="['fas', question.showAnswer ? 'fa-eye-slash' : 'fa-eye', 'mr-2']"></i>
              {{ question.showAnswer ? 'Javobni yashirish' : 'Javobni ko\'rish' }}
            </button>
          </div>

          <div v-show="question.showAnswer" class="mt-4 w-full">
            <div class="prose prose-invert max-w-none w-full" v-html="formatAnswer(question.answer)"></div>
            
            <div v-if="question.resources?.length" class="mt-4 p-4 bg-gray-700 rounded-lg w-full">
              <h4 class="text-sm font-semibold text-gray-300 mb-2">Qo'shimcha ma'lumotlar:</h4>
              <ul class="space-y-2">
                <li v-for="resource in question.resources" :key="resource.url">
                  <a 
                    :href="resource.url" 
                    target="_blank" 
                    class="text-blue-400 hover:text-blue-300 transition-colors flex items-center"
                  >
                    <i class="fas fa-external-link-alt mr-2 text-xs"></i>
                    {{ resource.title }}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
     <!-- Footer -->
    <footer class="container mx-auto px-4 py-4 text-center">
      <p class="text-sm text-gray-500"> 2024 Husniddin</p>
    </footer>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'

export default {
  name: 'HomeView',
  setup() {
    const questions = ref([])
    const loading = ref(true)
    const error = ref(null)
    const searchQuery = ref('')
    const selectedCategory = ref(null)

    const categories = computed(() => {
      const uniqueCategories = new Set(questions.value.map(q => q.category))
      return Array.from(uniqueCategories)
    })

    const filteredQuestions = computed(() => {
      return questions.value.filter(question => {
        const matchesCategory = !selectedCategory.value || question.category === selectedCategory.value
        const matchesSearch = !searchQuery.value || 
          question.question.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          question.answer.toLowerCase().includes(searchQuery.value.toLowerCase())
        return matchesCategory && matchesSearch
      })
    })

    const loadQuestions = async (category) => {
      try {
        const response = await fetch(`/questions/${category}.json`)
        if (!response.ok) {
          console.error(`Failed to load ${category} questions: ${response.status}`)
          return []
        }
        const data = await response.json()
        return data.map(q => ({ ...q, showAnswer: false }))
      } catch (err) {
        console.error(`Error loading ${category} questions:`, err)
        return []
      }
    }

    const formatAnswer = (answer) => {
      let formattedAnswer = answer
      const codeBlocks = answer.match(/```[\s\S]*?```/g) || []
      
      codeBlocks.forEach(block => {
        const code = block.replace(/```/g, '').trim()
        const highlightedCode = hljs.highlightAuto(code).value
        formattedAnswer = formattedAnswer.replace(
          block,
          `<pre><code>${highlightedCode}</code></pre>`
        )
      })
      
      return formattedAnswer
    }

    onMounted(async () => {
      try {
        const categories = ['javascript', 'python', 'algorithms']
        const allQuestions = []
        
        for (const category of categories) {
          const categoryQuestions = await loadQuestions(category)
          allQuestions.push(...categoryQuestions)
        }
        
        questions.value = allQuestions
      } catch (err) {
        error.value = err.message
      } finally {
        loading.value = false
      }
    })

    return {
      questions,
      loading,
      error,
      searchQuery,
      selectedCategory,
      categories,
      filteredQuestions,
      formatAnswer
    }
  }
}
</script>

<style>
.prose {
  color: #e5e7eb;
  max-width: none !important;
  width: 100% !important;
}

.prose p {
  margin-top: 1.25em;
  margin-bottom: 1.25em;
  line-height: 1.75;
  width: 100%;
}

.prose pre {
  color: #e5e7eb;
  background-color: #111827;
  margin: 1.25em 0;
  padding: 1em;
  border-radius: 0.375rem;
  overflow-x: auto;
  width: 100%;
}

.prose code {
  color: #e5e7eb;
  background-color: transparent;
  border-radius: 0;
  padding: 0;
  font-weight: inherit;
  font-size: 0.875em;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.prose ul {
  margin-top: 1.25em;
  margin-bottom: 1.25em;
  list-style-type: disc;
  padding-left: 1.625em;
  width: 100%;
}

.prose li {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  width: 100%;
}

.prose a {
  color: #60a5fa;
  text-decoration: underline;
  font-weight: 500;
}

.prose a:hover {
  color: #93c5fd;
}
</style>
