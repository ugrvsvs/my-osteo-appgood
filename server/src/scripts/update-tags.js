// Остеопатические теги
const OSTEO_TAGS = [
  'Растяжка',
  'Укрепление',
  'Мобильность',
  'Дыхание',
  'Осанка',
  'Миофасциальный релиз',
  'Баланс/Координация',
  'Суставы',
  'Профилактика',
  'Реабилитация',
]

const API_URL = 'http://localhost:3001/api'

async function updateTags() {
  try {
    console.log('🔍 Получаю список видео...')
    const res = await fetch(`${API_URL}/videos`)
    if (!res.ok) throw new Error('Failed to fetch videos')
    
    const videos = await res.json()
    console.log(`📹 Найдено видео: ${videos.length}`)
    
    for (const video of videos) {
      try {
        let tags = video.tags || []
        
        // Если теги пустые или есть неправильные, устанавливаем стандартные
        const hasStrangeTag = tags.some(t => !OSTEO_TAGS.includes(t))
        
        if (tags.length === 0 || hasStrangeTag) {
          // Выбираем 2-3 подходящих тега в зависимости от видео
          let newTags = []
          
          if (video.title.toLowerCase().includes('растяж')) {
            newTags = ['Растяжка', 'Мобильность']
          } else if (video.title.toLowerCase().includes('укреп')) {
            newTags = ['Укрепление', 'Осанка']
          } else if (video.title.toLowerCase().includes('дыхан')) {
            newTags = ['Дыхание', 'Осанка']
          } else if (video.title.toLowerCase().includes('баланс')) {
            newTags = ['Баланс/Координация', 'Мобильность']
          } else if (video.title.toLowerCase().includes('осанк')) {
            newTags = ['Осанка', 'Укрепление']
          } else if (video.title.toLowerCase().includes('суставы')) {
            newTags = ['Суставы', 'Мобильность']
          } else if (video.title.toLowerCase().includes('реабилит')) {
            newTags = ['Реабилитация', 'Укрепление']
          } else {
            // По умолчанию мобильность и профилактика
            newTags = ['Мобильность', 'Профилактика']
          }
          
          // Обновляем через API
          const updateRes = await fetch(`${API_URL}/videos/${video.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: video.title,
              url: video.url,
              description: video.description,
              thumbnail_url: video.thumbnail_url,
              duration: video.duration,
              tags: newTags,
              body_zones: video.body_zones,
            }),
          })
          
          if (updateRes.ok) {
            console.log(`✅ "${video.title}" -> ${newTags.join(', ')}`)
          } else {
            console.error(`❌ Ошибка обновления видео ${video.id}`)
          }
        } else {
          console.log(`✓ "${video.title}" уже имеет корректные теги`)
        }
      } catch (err) {
        console.error(`❌ Ошибка обработки видео:`, err.message)
      }
    }
    
    console.log('\n✨ Обновление тегов завершено!')
  } catch (error) {
    console.error('❌ Ошибка:', error.message)
  }
}

updateTags()
