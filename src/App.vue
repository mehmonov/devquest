<template>
  <div class="min-h-screen bg-gray-900 text-gray-100">
    <nav class="bg-gray-800 border-b border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <h1 class="text-2xl font-bold text-blue-400">DevQuest</h1>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <div>
      <HomeView />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import HomeView from './views/HomeView.vue'

export default {
  name: 'App',
  components: {
    HomeView
  },
  setup() {
    const questions = ref([])
    const loading = ref(true)
    const error = ref(null)
    const searchQuery = ref('')
    const selectedCategory = ref('Hammasi')
    
    const categories = ['Hammasi', 'JavaScript', 'Python', 'Algorithms']

    // Savollarni yuklash
    const loadQuestions = async () => {
      try {
        loading.value = true
        error.value = null
        
        const files = ['questions_1.json', 'question_1732562503460.json']
        const loadedQuestions = []
        
        for (const file of files) {
          const response = await fetch(`/questions/${file}`)
          if (!response.ok) throw new Error(`${file} faylini yuklab bo'lmadi`)
          const question = await response.json()
          loadedQuestions.push({
            ...question,
            showAnswer: false
          })
        }
        
        questions.value = loadedQuestions.sort((a, b) => b.id - a.id)
      } catch (err) {
        error.value = err.message
      } finally {
        loading.value = false
      }
    }

    // Filtrlangan savollar
    const filteredQuestions = computed(() => {
      let result = questions.value

      if (selectedCategory.value !== 'Hammasi') {
        result = result.filter(q => q.category === selectedCategory.value)
      }

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(q => 
          q.question.toLowerCase().includes(query) || 
          q.answer.toLowerCase().includes(query)
        )
      }

      return result
    })

    // Kodni formatlash
    const formatAnswer = (answer) => {
      return answer.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
        const highlighted = language
          ? hljs.highlight(code, { language }).value
          : hljs.highlightAuto(code).value
        return `<pre class="bg-gray-900 p-4 rounded-lg overflow-x-auto"><code class="hljs">${highlighted}</code></pre>`
      })
    }

    // Kategoriyani tanlash
    const selectCategory = (category) => {
      selectedCategory.value = category
    }

    onMounted(() => {
      loadQuestions()
    })

    return {
      questions,
      loading,
      error,
      searchQuery,
      selectedCategory,
      categories,
      filteredQuestions,
      formatAnswer,
      selectCategory
    }
  }
}
</script>

<style>
.prose {
  color: #e5e7eb;
  max-width: none;
}

.prose pre {
  color: #e5e7eb;
  background-color: #111827;
}

.prose code {
  color: #e5e7eb;
  background-color: transparent;
  border-radius: 0;
  padding: 0;
  font-weight: inherit;
  font-size: inherit;
}
</style>
