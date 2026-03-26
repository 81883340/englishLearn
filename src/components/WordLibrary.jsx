import React, { useState, useEffect } from 'react'

// 单词发音功能
const speakWord = (word) => {
  if (!word) return
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = 'en-US'
    utterance.rate = 0.9
    utterance.pitch = 1
    window.speechSynthesis.speak(utterance)
  } else {
    alert('您的浏览器不支持语音合成功能')
  }
}

// 简化的翻译映射（避免重复键）
const techTermsMap = {};

// 翻译API池 - 优先使用Google翻译API
const translationAPIs = [
  // Google Translate (免费，有速率限制但质量好)
  {
    name: 'GoogleTranslate',
    fn: async (text) => {
      try {
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=${encodeURIComponent(text)}`);
        const data = await res.json();
        if (data && data[0]) {
          return data[0].map(item => item[0]).join('');
        }
        return text;
      } catch (error) {
        console.error('Google翻译失败:', error);
        return text;
      }
    }
  },
  // MyMemory (5000 chars/day - 备用)
  {
    name: 'MyMemory',
    fn: async (text) => {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh-CN`);
      const data = await res.json();
      return data.responseData?.translatedText || text;
    }
  }
];

// 免费翻译接口（优先本地映射，然后Google翻译API）
const translate = async (text) => {
  if (!text) return "";

  // 优先检查技术术语映射
  const textLower = text.toLowerCase();
  if (techTermsMap[textLower]) {
    console.log(`使用本地映射: "${text}" -> "${techTermsMap[textLower]}"`);
    return techTermsMap[textLower];
  }

  // 优先使用Google翻译API
  const googleAPI = translationAPIs[0];
  try {
    console.log(`优先使用 ${googleAPI.name} API翻译: "${text}"`);
    const translated = await googleAPI.fn(text);
    console.log(`${googleAPI.name} 翻译结果: "${text}" -> "${translated}"`);
    return translated;
  } catch (error) {
    console.error(`${googleAPI.name} 翻译失败:`, error);
  }

  // Google失败，尝试MyMemory
  const myMemoryAPI = translationAPIs[1];
  try {
    console.log(`尝试使用 ${myMemoryAPI.name} API翻译: "${text}"`);
    const translated = await myMemoryAPI.fn(text);
    console.log(`${myMemoryAPI.name} 翻译结果: "${text}" -> "${translated}"`);
    return translated;
  } catch (error) {
    console.error(`${myMemoryAPI.name} 翻译失败:`, error);
  }

  // 所有API都失败，返回原文
  console.warn(`所有翻译API都失败，返回原文: "${text}"`);
  return text;
};

// 获取单词信息（音标、中文、英文释义、例句）- 使用 Free Dictionary API
// 中文翻译优先使用 Google API，备选 Free Dictionary API
const fetchWordInfo = async (word) => {
  console.log(`开始获取单词信息: ${word}`);
  const wordLower = word.toLowerCase();

  try {
    // 使用 Free Dictionary API 获取音标、英文释义、例句和备选中文翻译
    // 添加 translations=true 查询参数以获取翻译（作为备选）
    const response = await fetch(`https://freedictionaryapi.com/api/v1/entries/en/${word}?translations=true`)

    if (response.ok) {
      console.log(`字典API请求成功: ${word}`);
      const data = await response.json()
      console.log(`API完整响应:`, JSON.stringify(data, null, 2))

      if (data && data.entries && data.entries.length > 0) {
        const entry = data.entries[0]

        // 获取音标
        let phonetic = ''
        if (entry.pronunciations && entry.pronunciations.length > 0) {
          const phoneticObj = entry.pronunciations.find(p => p.type === 'IPA') || entry.pronunciations[0]
          phonetic = phoneticObj.text || ''
          console.log(`找到音标: "${phonetic}"`)
        }

        // 获取第一个含义和例句
        let englishDefinition = ''
        let exampleSentence = ''

        if (entry.senses && entry.senses.length > 0) {
          const firstSense = entry.senses[0]
          englishDefinition = firstSense.definition || ''
          
          console.log(`第一个含义数据:`, {
            hasExamples: firstSense.examples && firstSense.examples.length > 0,
            hasQuotes: firstSense.quotes && firstSense.quotes.length > 0,
            hasTranslations: firstSense.translations && firstSense.translations.length > 0,
            examples: firstSense.examples,
            quotes: firstSense.quotes,
            translations: firstSense.translations
          })

          // 获取例句 - 只从 examples 数组查找（quotes 是历史文献引用，不适合学习）
          if (firstSense.examples && firstSense.examples.length > 0) {
            exampleSentence = firstSense.examples[0]
            console.log(`找到例句 (examples): "${exampleSentence}"`)
          }

          // 如果第一个含义没有例句，查找其他含义（包括subsenses）
          if (!exampleSentence) {
            console.log(`第一个含义没有例句，在其他含义（包括subsenses）中查找...`)
            // 收集所有senses（包括subsenses）
            const allSenses = [...entry.senses]
            for (const sense of entry.senses) {
              if (sense.subsenses && sense.subsenses.length > 0) {
                for (const subsense of sense.subsenses) {
                  if (subsense.examples && subsense.examples.length > 0) {
                    exampleSentence = subsense.examples[0]
                    console.log(`在subsenses中找到例句: "${exampleSentence}"`)
                    break
                  }
                  allSenses.push(subsense)
                }
              }
            }

            // 遍历收集的所有senses查找例句
            for (const sense of allSenses) {
              if (sense.examples && sense.examples.length > 0) {
                exampleSentence = sense.examples[0]
                console.log(`在其他senses中找到例句 (examples): "${exampleSentence}"`)
                break
              }
              if (exampleSentence) break
            }
          }

          // 获取中文翻译 - 在所有含义的 translations 中查找（作为备选）
          let chineseTranslation = ''
          for (const sense of entry.senses) {
            if (sense.translations && sense.translations.length > 0) {
              const zhTranslation = sense.translations.find(t =>
                t.language && (t.language.code === 'zh' || t.language.name === 'Chinese' || t.language.name === '中文' || t.language.name.toLowerCase().includes('chinese'))
              )
              if (zhTranslation) {
                chineseTranslation = zhTranslation.word
                console.log(`找到中文翻译（备选）: "${chineseTranslation}"`)
                break
              }
            }
            if (chineseTranslation) break
          }

          console.log(`字典API返回 - 音标: "${phonetic}", 英文释义: "${englishDefinition.substring(0, 50)}...", 例句: "${exampleSentence || '无'}"`)

          // 获取中文翻译 - 优先级：本地映射 > Google API > Free Dictionary API 翻译
          console.log(`获取中文翻译: "${word}"`)
          let chineseMeaning = techTermsMap[wordLower]
          if (chineseMeaning) {
            console.log(`使用本地映射: "${wordLower}" -> "${chineseMeaning}"`)
          } else {
            // 使用 Google API
            chineseMeaning = await translate(word)
            if (chineseMeaning === word) {
              // Google API 失败，使用 Free Dictionary API 的翻译作为备选
              if (chineseTranslation) {
                chineseMeaning = chineseTranslation
                console.log(`使用 Free Dictionary API 翻译（备选）: "${chineseMeaning}"`)
              } else {
                console.log(`所有翻译来源都失败，使用原文`)
              }
            }
          }

          console.log(`单词 ${word} 最终结果:`, {
            phonetic,
            englishDefinition,
            chineseMeaning,
            exampleSentence
          });

          return {
            word: wordLower,
            phonetic,
            englishDefinition,
            chineseMeaning,
            example: exampleSentence || `${word} - example sentence`
          }
        }
      }
    } else {
      console.log(`字典API请求失败 (${response.status}): ${word}`);
    }

    // 如果字典API没有返回数据，使用翻译API
    console.log(`字典API无数据，使用翻译API翻译单词: "${word}"`)
    
    // 优先使用本地映射
    let chineseMeaning = techTermsMap[wordLower];
    if (!chineseMeaning) {
      chineseMeaning = await translate(word);
    }

    return {
      word: wordLower,
      phonetic: '',
      englishDefinition: word,
      chineseMeaning,
      example: `${word} - example sentence`
    }
  } catch (error) {
    console.error('获取单词信息失败:', error)
    // 即使出错也返回基本结构
    let chineseMeaning = techTermsMap[wordLower] || word;
    return {
      word: wordLower,
      phonetic: '',
      englishDefinition: word,
      chineseMeaning,
      example: `${word} - example sentence`
    }
  }
}



function WordLibrary({ wordLibrary, setWordLibrary, setCurrentPage, currentBook, setCurrentBook }) {
  // localBook 用于词库管理页面的显示筛选
  const [localBook, setLocalBook] = useState(() => {
    const saved = localStorage.getItem('localBook')
    return saved ? JSON.parse(saved) : '全部词本'
  })

  // 获取当前学习词本的数量
  const getCurrentBookWordsCount = () => {
    if (currentBook === '全部词本') {
      return wordLibrary.length
    }
    return wordLibrary.filter(w => w.bookName === currentBook).length
  }
  const [newWord, setNewWord] = useState({ word: '', meaning: '', example: '', phonetic: '', bookName: '默认词本' })
  const [editingId, setEditingId] = useState(null)
  const [editingWord, setEditingWord] = useState({ word: '', meaning: '', example: '', phonetic: '', bookName: '默认词本' })
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [isAutoFetching, setIsAutoFetching] = useState(false)
  const [autoFetchProgress, setAutoFetchProgress] = useState({ current: 0, total: 0 })
  const [selectedWords, setSelectedWords] = useState([])
  const [books, setBooks] = useState(() => {
    const saved = localStorage.getItem('wordBooks')
    return saved ? JSON.parse(saved) : ['默认词本']
  })
  const [showBookModal, setShowBookModal] = useState(false)
  const [newBookName, setNewBookName] = useState('')
  const [showImportModal, setShowImportModal] = useState(false)
  const [importTargetBook, setImportTargetBook] = useState('默认词本')
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transferTargetBook, setTransferTargetBook] = useState('默认词本')

  // 自动获取单词信息
  const handleAutoFetch = async (wordText) => {
    setIsAutoFetching(true)
    try {
      const wordInfo = await fetchWordInfo(wordText.trim())
      if (wordInfo) {
        setNewWord({
          word: wordInfo.word,
          meaning: wordInfo.chineseMeaning || wordInfo.englishDefinition,
          example: wordInfo.example,
          phonetic: wordInfo.phonetic
        })
        return true
      } else {
        alert('未找到该单词信息，请手动输入')
        return false
      }
    } catch (error) {
      console.error('获取单词信息失败:', error)
      alert('获取单词信息失败，请检查网络或手动输入')
      return false
    } finally {
      setIsAutoFetching(false)
    }
  }

  // 批量自动获取（从文本列表）
  const handleBatchAutoFetch = async (words) => {
    setIsAutoFetching(true)
    setAutoFetchProgress({ current: 0, total: words.length })
    const newWords = []

    for (let i = 0; i < words.length; i++) {
      const wordText = words[i].trim()
      if (!wordText) continue

      try {
        const wordInfo = await fetchWordInfo(wordText)
        if (wordInfo) {
          newWords.push({
            id: Date.now() + i,
            word: wordInfo.word,
            meaning: wordInfo.chineseMeaning || wordInfo.englishDefinition,
            example: wordInfo.example,
            phonetic: wordInfo.phonetic,
            bookName: importTargetBook
          })
        }
      } catch (error) {
        console.error(`获取单词 "${wordText}" 信息失败:`, error)
      }

      setAutoFetchProgress({ current: i + 1, total: words.length })
      // 添加延迟，避免请求过快
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    setWordLibrary([...wordLibrary, ...newWords])
    setIsAutoFetching(false)
    alert(`成功获取 ${newWords.length} 个单词的信息到 "${importTargetBook}"`)
  }

  // 从TXT文件批量导入
  const handleTxtImport = () => {
    setShowImportModal(true)
  }

  // 执行TXT导入
  const executeTxtImport = (file) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target.result
      const words = content.split('\n').map(w => w.trim()).filter(w => w)

      if (confirm(`找到 ${words.length} 个单词，是否自动获取释义和例句？\n取消则按原有格式导入`)) {
        handleBatchAutoFetch(words)
      } else {
        // 按原有格式导入（每行一个单词，不获取释义）
        const newWords = words.map((word, i) => ({
          id: Date.now() + i,
          word: word.toLowerCase(),
          meaning: '',
          example: '',
          bookName: importTargetBook
        }))
        setWordLibrary([...wordLibrary, ...newWords])
        alert(`成功导入 ${newWords.length} 个单词到 "${importTargetBook}"`)
      }
    }
    reader.readAsText(file)
  }

  const handleAddWord = () => {
    if (!newWord.word.trim() || !newWord.meaning.trim()) {
      alert('请填写单词和释义')
      return
    }

    const word = {
      id: Date.now(),
      word: newWord.word.trim().toLowerCase(),
      meaning: newWord.meaning.trim(),
      example: newWord.example.trim() || `${newWord.word} - example sentence`,
      phonetic: newWord.phonetic || '',
      bookName: newWord.bookName || '默认词本'
    }

    setWordLibrary([...wordLibrary, word])
    setNewWord({ word: '', meaning: '', example: '', phonetic: '', bookName: localBook === '全部词本' ? '默认词本' : localBook })
    setShowAddForm(false)
  }

  const handleEditWord = () => {
    if (!editingWord.word.trim() || !editingWord.meaning.trim()) {
      alert('请填写单词和释义')
      return
    }

    setWordLibrary(wordLibrary.map(w =>
      w.id === editingId
        ? {
            ...w,
            word: editingWord.word.trim().toLowerCase(),
            meaning: editingWord.meaning.trim(),
            example: editingWord.example.trim(),
            phonetic: editingWord.phonetic || ''
          }
        : w
    ))
    setEditingId(null)
    setEditingWord({ word: '', meaning: '', example: '', phonetic: '' })
  }

  const handleDeleteWord = (id) => {
    if (confirm('确定要删除这个单词吗？')) {
      setWordLibrary(wordLibrary.filter(w => w.id !== id))
    }
  }

  const startEditing = (word) => {
    setEditingId(word.id)
    setEditingWord({
      word: word.word,
      meaning: word.meaning,
      example: word.example,
      phonetic: word.phonetic || ''
    })
  }

  // CSV解析函数 - 正确处理包含双引号的字段
  const parseCSVLine = (line) => {
    const result = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const nextChar = line[i + 1]

      if (inQuotes) {
        if (char === '"' && nextChar === '"') {
          // 双引号转义
          current += '"'
          i++ // 跳过下一个引号
        } else if (char === '"') {
          // 结束引号
          inQuotes = false
        } else {
          current += char
        }
      } else {
        if (char === '"') {
          // 开始引号
          inQuotes = true
        } else if (char === ',') {
          // 字段分隔符
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
    }
    result.push(current.trim())
    return result
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv'
    input.onchange = (e) => {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target.result

        try {
          let newWords = []

          // CSV 格式: word,meaning,example
          const lines = content.split('\n').filter(line => line.trim())
          const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase())

          // 检测列顺序
          const wordIndex = headers.findIndex(h => h.includes('word') || h === '单词')
          const meaningIndex = headers.findIndex(h => h.includes('meaning') || h === '释义' || h === '意思')
          const exampleIndex = headers.findIndex(h => h.includes('example') || h === '例句')
          const phoneticIndex = headers.findIndex(h => h.includes('phonetic') || h === '音标')

          // 如果没有表头，默认顺序: word,meaning,example
          const useDefault = wordIndex === -1 && meaningIndex === -1

          for (let i = useDefault ? 0 : 1; i < lines.length; i++) {
            const cols = parseCSVLine(lines[i])
            const word = useDefault ? cols[0] : cols[wordIndex]
            const meaning = useDefault ? cols[1] : cols[meaningIndex]
            const example = useDefault ? (cols[2] || '') : (exampleIndex >= 0 ? cols[exampleIndex] : '')
            const phonetic = useDefault ? (cols[3] || '') : (phoneticIndex >= 0 ? cols[phoneticIndex] : '')

            if (word && meaning) {
              newWords.push({
                id: Date.now() + i,
                word: word.toLowerCase(),
                meaning: meaning,
                example: example,
                phonetic: phonetic
              })
            }
          }

          if (newWords.length > 0) {
            setWordLibrary([...wordLibrary, ...newWords])
            alert(`成功导入 ${newWords.length} 个单词`)
          } else {
            alert('导入失败: 文件中没有找到有效的单词')
          }
        } catch (error) {
          console.error('CSV导入错误:', error)
          alert('导入失败: 文件格式错误')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const handleExport = () => {
    const bookWords = wordLibrary.filter(w => localBook === '全部词本' || w.bookName === localBook)
    const csvHeader = 'word,meaning,example,phonetic,bookName\n'
    const csvContent = bookWords.map(w =>
      `"${w.word}","${w.meaning}","${w.example.replace(/"/g, '""')}","${(w.phonetic || '').replace(/"/g, '""')}","${(w.bookName || '').replace(/"/g, '""')}"`
    ).join('\n')
    const csvData = csvHeader + csvContent

    const dataBlob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${localBook}-${new Date().toLocaleDateString()}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    localStorage.setItem('wordBooks', JSON.stringify(books))
  }, [books])

  const filteredWords = wordLibrary.filter(w => {
    const bookMatch = localBook === '全部词本' || w.bookName === localBook
    const searchMatch = w.word.includes(searchTerm.toLowerCase()) ||
                       w.meaning.includes(searchTerm)
    return bookMatch && searchMatch
  })

  const handleDeleteSelected = () => {
    if (selectedWords.length === 0) {
      alert('请选择要删除的单词')
      return
    }

    if (confirm(`确定要删除选中的 ${selectedWords.length} 个单词吗？`)) {
      setWordLibrary(wordLibrary.filter(w => !selectedWords.includes(w.id)))
      setSelectedWords([])
      alert(`成功删除 ${selectedWords.length} 个单词`)
    }
  }

  const handleTransferSelected = () => {
    if (selectedWords.length === 0) {
      alert('请选择要转移的单词')
      return
    }
    setShowTransferModal(true)
  }

  const executeTransfer = () => {
    if (confirm(`确定要将选中的 ${selectedWords.length} 个单词转移到 "${transferTargetBook}" 吗？`)) {
      setWordLibrary(wordLibrary.map(w =>
        selectedWords.includes(w.id)
          ? { ...w, bookName: transferTargetBook }
          : w
      ))
      setSelectedWords([])
      setShowTransferModal(false)
      alert(`成功将 ${selectedWords.length} 个单词转移到 "${transferTargetBook}"`)
    }
  }

  const toggleSelectAll = () => {
    if (selectedWords.length === filteredWords.length) {
      setSelectedWords([])
    } else {
      setSelectedWords(filteredWords.map(w => w.id))
    }
  }

  const handleAddBook = () => {
    if (!newBookName.trim()) {
      alert('请输入词本名称')
      return
    }

    if (books.includes(newBookName)) {
      alert('词本名称已存在')
      return
    }

    setBooks([...books, newBookName])
    setNewBookName('')
    setShowBookModal(false)
    alert('词本创建成功')
  }

  const handleDeleteBook = () => {
    if (localBook === '全部词本' || localBook === '默认词本') {
      alert('不能删除默认词本')
      return
    }

    if (confirm(`确定要删除词本"${localBook}"吗？该词本中的所有单词也将被删除。`)) {
      setWordLibrary(wordLibrary.filter(w => w.bookName !== localBook))
      setBooks(books.filter(b => b !== localBook))
      setLocalBook('全部词本')
      alert('词本已删除')
    }
  }

  return (
    <div className="container fade-in">
      <nav className="navbar">
        <div className="navbar-brand">
          <span>📚 词库管理</span>
        </div>
        <div className="navbar-nav">
          <button className="nav-link" onClick={() => setCurrentPage('home')}>
            返回首页
          </button>
        </div>
      </nav>

      <div className="card" style={{ marginBottom: '30px' }}>
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          <button
            className="btn btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
            disabled={isAutoFetching}
          >
            {showAddForm ? '收起表单' : '+ 添加单词'}
          </button>
          <button className="btn btn-secondary" onClick={handleImport} disabled={isAutoFetching}>
            📥 导入词库 (CSV)
          </button>
          <button className="btn btn-secondary" onClick={handleTxtImport} disabled={isAutoFetching}>
            📄 导入TXT并自动获取
          </button>
          <button className="btn btn-secondary" onClick={handleExport}>
            📤 导出词库 (CSV)
          </button>
          {selectedWords.length > 0 && (
            <>
              <button className="btn btn-primary" onClick={handleTransferSelected} style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                border: '2px solid #a78bfa'
              }}>
                📦 转移到词本
              </button>
              <button className="btn btn-danger" onClick={handleDeleteSelected}>
                删除选中 ({selectedWords.length})
              </button>
            </>
          )}
          <input
            type="text"
            className="input"
            placeholder="搜索单词或释义..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, minWidth: '200px' }}
          />
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <label style={{ fontSize: '14px', color: 'var(--gray)', fontWeight: '500' }}>
            词本:
          </label>
          <select
            className="input"
            value={localBook}
            onChange={(e) => setLocalBook(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="全部词本">全部词本</option>
            {books.map(book => (
              <option key={book} value={book}>{book}</option>
            ))}
          </select>
          <button
            className="btn btn-secondary"
            onClick={() => setShowBookModal(true)}
            style={{ padding: '8px 16px', fontSize: '14px' }}
          >
            + 新建词本
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              const targetBook = localBook === '全部词本' ? '全部词本' : localBook
              if (confirm(`确定要将 "${targetBook}" 设置为当前学习词本吗？\n${targetBook === '全部词本' ? '将学习所有词本的单词' : ''}`)) {
                setCurrentBook(targetBook)
                alert(`已将 "${targetBook}" 设置为当前学习词本`)
              }
            }}
            style={{ padding: '8px 16px', fontSize: '14px' }}
          >
            ⭐ 设为当前学习
          </button>
          {localBook !== '全部词本' && localBook !== '默认词本' && (
            <button
              className="btn btn-danger"
              onClick={handleDeleteBook}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              🗑️ 删除词本
            </button>
          )}
        </div>

        {isAutoFetching && (
          <div style={{
            padding: '16px',
            background: 'rgba(99, 102, 241, 0.1)',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div style={{ color: 'var(--primary)', fontWeight: '500', marginBottom: '8px' }}>
              正在获取单词信息...
            </div>
            <div style={{ color: 'var(--gray)', fontSize: '14px' }}>
              进度: {autoFetchProgress.current} / {autoFetchProgress.total}
            </div>
          </div>
        )}

        <div style={{
          padding: '12px 16px',
          background: currentBook === '全部词本' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(99, 102, 241, 0.1)',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '18px' }}>⭐</span>
          <span style={{ fontSize: '14px', fontWeight: '500', color: currentBook === '全部词本' ? '#d97706' : 'var(--primary)' }}>
            当前学习词本: {currentBook === '全部词本' ? '未设置（将学习全部词本）' : currentBook}
          </span>
        </div>

        <div style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '20px',
          color: 'var(--gray)',
          fontSize: '14px'
        }}>
          <span>总单词数: {wordLibrary.length}</span>
          <span>当前词本: {filteredWords.length}</span>
          <span>已选: {selectedWords.length}</span>
        </div>

        {showImportModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div className="card" style={{ maxWidth: '400px', width: '90%' }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                marginBottom: '20px',
                color: 'var(--dark)'
              }}>
                导入TXT到词本
              </h3>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: 'var(--dark)'
                }}>
                  选择词本
                </label>
                <select
                  className="input"
                  value={importTargetBook}
                  onChange={(e) => setImportTargetBook(e.target.value)}
                >
                  <option value="默认词本">默认词本</option>
                  {books.filter(b => b !== '默认词本').map(book => (
                    <option key={book} value={book}>{book}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <input
                  type="file"
                  accept=".txt"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) {
                      executeTxtImport(file)
                      setShowImportModal(false)
                    }
                  }}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowImportModal(false)
                    setImportTargetBook('默认词本')
                  }}
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {showTransferModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div className="card" style={{ maxWidth: '400px', width: '90%' }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                marginBottom: '20px',
                color: 'var(--dark)'
              }}>
                转移单词到词本
              </h3>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: 'var(--dark)'
                }}>
                  选择目标词本
                </label>
                <select
                  className="input"
                  value={transferTargetBook}
                  onChange={(e) => setTransferTargetBook(e.target.value)}
                >
                  {books.map(book => (
                    <option key={book} value={book}>{book}</option>
                  ))}
                </select>
              </div>
              <div style={{
                padding: '16px',
                background: 'rgba(99, 102, 241, 0.1)',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '14px',
                color: 'var(--dark)'
              }}>
                将转移 <strong>{selectedWords.length}</strong> 个单词到 <strong>"{transferTargetBook}"</strong>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-primary" onClick={executeTransfer}>
                  确定转移
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowTransferModal(false)
                    setTransferTargetBook('默认词本')
                  }}
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {showBookModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div className="card" style={{ maxWidth: '400px', width: '90%' }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                marginBottom: '20px',
                color: 'var(--dark)'
              }}>
                创建新词本
              </h3>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: 'var(--dark)'
                }}>
                  词本名称
                </label>
                <input
                  type="text"
                  className="input"
                  value={newBookName}
                  onChange={(e) => setNewBookName(e.target.value)}
                  placeholder="例如: 四级词汇"
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-primary" onClick={handleAddBook}>
                  创建
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowBookModal(false)
                    setNewBookName('')
                  }}
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {showAddForm && (
          <div style={{
            padding: '24px',
            background: 'rgba(99, 102, 241, 0.05)',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              marginBottom: '20px',
              color: 'var(--dark)'
            }}>
              添加新单词
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: 'var(--dark)'
                }}>
                  单词 *
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="input"
                    placeholder="例如: hello"
                    value={newWord.word}
                    onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                    style={{ flex: 1 }}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={() => handleAutoFetch(newWord.word)}
                    disabled={isAutoFetching || !newWord.word.trim()}
                  >
                    {isAutoFetching ? '获取中...' : '🔍 自动获取'}
                  </button>
                </div>
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: 'var(--dark)'
                }}>
                  释义 *
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="例如: 你好"
                  value={newWord.meaning}
                  onChange={(e) => setNewWord({ ...newWord, meaning: e.target.value })}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: 'var(--dark)'
                }}>
                  音标
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="例如: /həˈloʊ/"
                  value={newWord.phonetic}
                  onChange={(e) => setNewWord({ ...newWord, phonetic: e.target.value })}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: 'var(--dark)'
                }}>
                  词本
                </label>
                <select
                  className="input"
                  value={newWord.bookName || '默认词本'}
                  onChange={(e) => setNewWord({ ...newWord, bookName: e.target.value })}
                >
                  {books.map(book => (
                    <option key={book} value={book}>{book}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: 'var(--dark)'
                }}>
                  例句
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="例如: Hello, how are you?"
                  value={newWord.example}
                  onChange={(e) => setNewWord({ ...newWord, example: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-primary" onClick={handleAddWord}>
                  添加单词
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddForm(false)
                    setNewWord({ word: '', meaning: '', example: '', phonetic: '', bookName: localBook === '全部词本' ? '默认词本' : localBook })
                  }}
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div style={{
          marginBottom: '16px',
          paddingBottom: '16px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <input
            type="checkbox"
            checked={selectedWords.length === filteredWords.length && filteredWords.length > 0}
            onChange={toggleSelectAll}
          />
          <span style={{ fontSize: '14px', color: 'var(--gray)' }}>
            全选 ({filteredWords.length})
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px'
          }}>
            <thead>
              <tr style={{
                borderBottom: '2px solid var(--gray)',
                textAlign: 'left'
              }}>
                <th style={{ padding: '16px', fontWeight: '700', color: 'var(--dark)', width: '50px', textAlign: 'center' }}>
                  选择
                </th>
                <th style={{ padding: '16px', fontWeight: '700', color: 'var(--dark)', minWidth: '120px' }}>
                  单词
                </th>
                <th style={{ padding: '16px', fontWeight: '700', color: 'var(--dark)', minWidth: '100px' }}>
                  音标
                </th>
                <th style={{ padding: '16px', fontWeight: '700', color: 'var(--dark)', minWidth: '150px' }}>
                  释义
                </th>
                <th style={{ padding: '16px', fontWeight: '700', color: 'var(--dark)', minWidth: '100px' }}>
                  词本
                </th>
                <th style={{ padding: '16px', fontWeight: '700', color: 'var(--dark)', minWidth: '200px' }}>
                  例句
                </th>
                <th style={{ padding: '16px', fontWeight: '700', color: 'var(--dark)', width: '120px', textAlign: 'center' }}>
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredWords.map((word) => (
                <tr
                  key={word.id}
                  style={{
                    borderBottom: '1px solid var(--gray)',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  {editingId === word.id ? (
                    <>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedWords.includes(word.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedWords([...selectedWords, word.id])
                            } else {
                              setSelectedWords(selectedWords.filter(id => id !== word.id))
                            }
                          }}
                        />
                      </td>
                      <td style={{ padding: '16px' }}>
                        <input
                          type="text"
                          className="input"
                          value={editingWord.word}
                          onChange={(e) => setEditingWord({ ...editingWord, word: e.target.value })}
                          placeholder="单词"
                          style={{ width: '100%', fontSize: '14px' }}
                        />
                      </td>
                      <td style={{ padding: '16px' }}>
                        <input
                          type="text"
                          className="input"
                          value={editingWord.phonetic}
                          onChange={(e) => setEditingWord({ ...editingWord, phonetic: e.target.value })}
                          placeholder="音标"
                          style={{ width: '100%', fontSize: '14px' }}
                        />
                      </td>
                      <td style={{ padding: '16px' }}>
                        <input
                          type="text"
                          className="input"
                          value={editingWord.meaning}
                          onChange={(e) => setEditingWord({ ...editingWord, meaning: e.target.value })}
                          placeholder="释义"
                          style={{ width: '100%', fontSize: '14px' }}
                        />
                      </td>
                      <td style={{ padding: '16px' }}>
                        <select
                          className="input"
                          value={editingWord.bookName || '默认词本'}
                          onChange={(e) => setEditingWord({ ...editingWord, bookName: e.target.value })}
                          style={{ width: '100%', fontSize: '14px', padding: '8px' }}
                        >
                          {books.map(book => (
                            <option key={book} value={book}>{book}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <input
                          type="text"
                          className="input"
                          value={editingWord.example}
                          onChange={(e) => setEditingWord({ ...editingWord, example: e.target.value })}
                          placeholder="例句"
                          style={{ width: '100%', fontSize: '14px' }}
                        />
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                          <button
                            className="btn btn-success"
                            style={{ padding: '8px 16px', fontSize: '14px', fontWeight: '500' }}
                            onClick={handleEditWord}
                          >
                            ✓ 保存
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '8px 16px', fontSize: '14px', fontWeight: '500' }}
                            onClick={() => {
                              setEditingId(null)
                              setEditingWord({ word: '', meaning: '', example: '', phonetic: '', bookName: '默认词本' })
                            }}
                          >
                            ✕ 取消
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedWords.includes(word.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedWords([...selectedWords, word.id])
                            } else {
                              setSelectedWords(selectedWords.filter(id => id !== word.id))
                            }
                          }}
                        />
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            fontSize: '16px',
                            fontWeight: '700',
                            color: 'var(--primary)'
                          }}>
                            {word.word}
                          </span>
                          <button
                            onClick={() => speakWord(word.word)}
                            style={{
                              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                              border: '2px solid #a78bfa',
                              borderRadius: '50%',
                              width: '32px',
                              height: '32px',
                              fontSize: '16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              flexShrink: 0
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'scale(1.1)'
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'scale(1)'
                            }}
                            title="发音"
                          >
                            🔊
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '16px', color: 'var(--gray)', fontFamily: 'Arial, sans-serif' }}>
                        {word.phonetic || '-'}
                      </td>
                      <td style={{ padding: '16px', color: 'var(--dark)', fontWeight: '500' }}>
                        {word.meaning}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          fontSize: '12px',
                          padding: '2px 8px',
                          background: 'rgba(99, 102, 241, 0.1)',
                          color: 'var(--primary)',
                          borderRadius: '4px',
                          fontWeight: '500'
                        }}>
                          {word.bookName || '默认词本'}
                        </span>
                      </td>
                      <td style={{ padding: '16px', color: 'var(--gray)', fontStyle: 'italic' }}>
                        "{word.example}"
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '8px 16px', fontSize: '14px', fontWeight: '500' }}
                            onClick={() => startEditing(word)}
                          >
                            ✏ 编辑
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '8px 16px', fontSize: '14px', fontWeight: '500' }}
                            onClick={() => handleDeleteWord(word.id)}
                          >
                            🗑 删除
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredWords.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--gray)'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>📭</div>
            <p style={{ fontSize: '18px', marginBottom: '10px' }}>
              {searchTerm ? '没有找到匹配的单词' : '词库为空'}
            </p>
            <p>点击"添加单词"按钮开始构建你的词库</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default WordLibrary
