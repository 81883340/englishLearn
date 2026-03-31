import React, { useState, useEffect, useCallback, useRef } from 'react'

// 简单的纸屑效果
const triggerConfetti = () => {
  const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444']
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div')
    confetti.style.cssText = `
      position: fixed;
      width: 10px;
      height: 10px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${Math.random() * 100}vw;
      top: -10px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
      animation: confetti-fall ${2 + Math.random() * 2}s linear forwards;
      pointer-events: none;
      z-index: 9999;
    `
    document.body.appendChild(confetti)
    setTimeout(() => confetti.remove(), 4000)
  }
}

// 全局动画样式
const styleSheet = document.createElement('style')
styleSheet.textContent = `
  @keyframes confetti-fall {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
  }
  .fade-in { animation: fadeIn 0.4s ease-out; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); }
`
document.head.appendChild(styleSheet)

function Study({ wordLibrary, learnedWords, setLearnedWords, updateProgress, progress, setCurrentPage, mistakeBook, setMistakeBook, currentBook, setCurrentBook, studyProgress, setStudyProgress, dailyGoal, setPoints, handleCompleteDailyGoal }) {
  const [mode, setMode] = useState('learn') // 'learn' | 'exam'
  const [currentWord, setCurrentWord] = useState(null)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [showResult, setShowResult] = useState(null) // 'correct' | 'wrong' | null
  const [showHint, setShowHint] = useState(false)
  const [pressedKey, setPressedKey] = useState(null)
  const [hasCheckedAnswer, setHasCheckedAnswer] = useState(false)
  const [todayLearnedCount, setTodayLearnedCount] = useState(0)
  const [sessionLearnedCount, setSessionLearnedCount] = useState(0)

  // 单词发音功能
  const speakWord = (word) => {
    if (!word) return
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = 'en-US'
      utterance.rate = 1
      utterance.pitch = 1
      utterance.volume = 1

      const voices = window.speechSynthesis.getVoices()
      const enVoice = voices.find(v => v.lang.includes('en-US') && (v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Samantha') || v.name.includes('Daniel')))
      if (enVoice) utterance.voice = enVoice
      window.speechSynthesis.speak(utterance)
    } else {
      alert('您的浏览器不支持语音合成功能')
    }
  }

  const hasCheckedAnswerRef = useRef(hasCheckedAnswer)
  useEffect(() => {
    hasCheckedAnswerRef.current = hasCheckedAnswer
  }, [hasCheckedAnswer])

  const getFilteredWordLibrary = useCallback(() => {
    if (currentBook === '全部词本') return wordLibrary
    return wordLibrary.filter(w => w.bookName === currentBook)
  }, [wordLibrary, currentBook])

  const getTodayStudyWords = useCallback(() => {
    const filteredLibrary = getFilteredWordLibrary()
    if (filteredLibrary.length === 0) return []
    const bookProgress = studyProgress[currentBook] || { lastIndex: 0, learnedIndices: [] }
    const startIndex = bookProgress.lastIndex || 0
    const todayNeedCount = dailyGoal - todayLearnedCount
    if (todayNeedCount <= 0) return []
    const studyWords = []
    for (let i = 0; i < todayNeedCount && (startIndex + i) < filteredLibrary.length; i++) {
      const wordIndex = (startIndex + i) % filteredLibrary.length
      studyWords.push(filteredLibrary[wordIndex])
    }
    return studyWords
  }, [getFilteredWordLibrary, studyProgress, currentBook, dailyGoal, todayLearnedCount])

  const getRandomWord = useCallback((excludeId = null) => {
    const filteredLibrary = getFilteredWordLibrary()
    const unlearned = filteredLibrary.filter(w => !learnedWords.includes(w.id))
    let pool = unlearned.length > 0 ? unlearned : filteredLibrary
    if (excludeId && pool.length > 1) pool = pool.filter(w => w.id !== excludeId)
    const randomIndex = Math.floor(Math.random() * pool.length)
    return pool[randomIndex]
  }, [getFilteredWordLibrary, learnedWords])

  useEffect(() => {
    const filteredLibrary = getFilteredWordLibrary()
    if (filteredLibrary.length > 0) {
      if (mode === 'learn') {
        const bookProgress = studyProgress[currentBook] || { lastIndex: 0 }
        const startIndex = bookProgress.lastIndex || 0
        setCurrentWordIndex(startIndex)
        setCurrentWord(filteredLibrary[startIndex])
      } else {
        setCurrentWord(getRandomWord())
      }
    }
  }, [mode, currentBook])

  const resetToNextWord = useCallback(() => {
    const newWord = getRandomWord(currentWord?.id)
    setCurrentWord(newWord)
    setUserInput('')
    setShowResult(null)
    setShowHint(false)
    setHasCheckedAnswer(false)
  }, [currentWord, getRandomWord])

  const resetCurrentWord = useCallback(() => {
    setUserInput('')
    setShowResult(null)
    setShowHint(false)
    setHasCheckedAnswer(false)
  }, [])

  const handleKeyPress = useCallback((key) => {
    if (hasCheckedAnswerRef.current) return
    if (key === 'BACK') setUserInput(prev => prev.slice(0, -1))
    else if (key === 'SPACE') setUserInput(prev => prev + ' ')
    else if (key.length === 1) setUserInput(prev => prev + key)
  }, [])

  const submitAnswer = useCallback(() => {
    if (!currentWord || userInput.length === 0) return
    setHasCheckedAnswer(true)
    const cleanInput = userInput.replace(/\s+/g, '').toLowerCase()
    const cleanWord = currentWord.word.replace(/\s+/g, '').toLowerCase()

    if (cleanInput === cleanWord) {
      setShowResult('correct')
      updateProgress({
        totalLearned: progress.totalLearned + 1,
        correctAnswers: progress.correctAnswers + 1,
        streak: progress.streak + 1
      })
      if (!learnedWords.includes(currentWord.id)) setLearnedWords([...learnedWords, currentWord.id])
      setPoints(p => p + 2)
      setTodayLearnedCount(c => c + 1)
      setSessionLearnedCount(c => c + 1)

      if (currentBook !== '全部词本') {
        const lib = getFilteredWordLibrary()
        const idx = lib.findIndex(w => w.id === currentWord.id)
        setStudyProgress({
          ...studyProgress,
          [currentBook]: { ...studyProgress[currentBook], lastIndex: (idx + 1) % lib.length, lastStudyDate: new Date().toISOString() }
        })
      }
      if (todayLearnedCount + 1 >= dailyGoal) handleCompleteDailyGoal()
      triggerConfetti()
    } else {
      setShowResult('wrong')
      updateProgress({ wrongAnswers: progress.wrongAnswers + 1, streak: 0 })
      if (mode === 'exam') {
        const exist = mistakeBook.find(m => m.word === currentWord.word.toLowerCase())
        if (exist) {
          setMistakeBook(mistakeBook.map(m => m.word === currentWord.word.toLowerCase() ? { ...m, wrongCount: m.wrongCount + 1, wrongDate: new Date().toISOString(), repetitionLevel: 0 } : m))
        } else {
          setMistakeBook([...mistakeBook, {
            id: Date.now(), word: currentWord.word.toLowerCase(), meaning: currentWord.meaning,
            example: currentWord.example, phonetic: currentWord.phonetic || '', wrongCount: 1,
            wrongDate: new Date().toISOString(), nextReviewDate: new Date(Date.now() + 86400000).toISOString(), repetitionLevel: 0
          }])
        }
      }
    }
  }, [currentWord, userInput, progress, learnedWords, updateProgress, setLearnedWords, mode, mistakeBook, setMistakeBook, setPoints, todayLearnedCount, dailyGoal, handleCompleteDailyGoal, currentBook, studyProgress, setStudyProgress, getFilteredWordLibrary])

  const handlePhysicalKeyboard = useCallback((e) => {
    const key = e.key.toLowerCase()
    setPressedKey(key)
    setTimeout(() => setPressedKey(null), 150)
    const checked = hasCheckedAnswerRef.current

    if (mode === 'exam' && checked) {
      if (key === ' ') {
        e.preventDefault()
        if (showResult === 'correct') resetToNextWord()
        if (showResult === 'wrong') { setUserInput(''); setShowResult(null); setShowHint(false); setHasCheckedAnswer(false) }
      }
      return
    }

    if (mode === 'learn') {
      if (!e.ctrlKey && !e.altKey && !e.metaKey && !['backspace', 'tab', 'escape'].includes(key)) {
        const lib = getFilteredWordLibrary()
        const ni = (currentWordIndex + 1) % lib.length
        setCurrentWordIndex(ni)
        setCurrentWord(lib[ni])
        setUserInput('')
        setShowResult(null)
        setShowHint(false)
        setHasCheckedAnswer(false)
        return
      }
    }

    if (mode === 'exam' && !checked) {
      if (key === 'backspace') { e.preventDefault(); handleKeyPress('BACK') }
      else if (key === ' ') { e.preventDefault(); handleKeyPress('SPACE') }
      else if (key === 'enter') { e.preventDefault(); submitAnswer() }
      else if (/^[a-z]$/.test(key)) handleKeyPress(key)
    }
  }, [mode, currentWordIndex, getFilteredWordLibrary, handleKeyPress, resetToNextWord, submitAnswer, showResult])

  useEffect(() => {
    window.addEventListener('keydown', handlePhysicalKeyboard)
    return () => window.removeEventListener('keydown', handlePhysicalKeyboard)
  }, [handlePhysicalKeyboard])

  const toggleMode = () => {
    const lib = getFilteredWordLibrary()
    setMode(p => p === 'learn' ? 'exam' : 'learn')
    setUserInput('')
    setShowResult(null)
    setShowHint(false)
    setHasCheckedAnswer(false)
    if (mode === 'exam') {
      const prog = studyProgress[currentBook] || { lastIndex: 0 }
      setCurrentWordIndex(prog.lastIndex)
      setCurrentWord(lib[prog.lastIndex || 0])
    } else {
      setCurrentWord(getRandomWord())
    }
  }

  const handleWrong = useCallback(() => {
    setHasCheckedAnswer(true)
    setShowResult('wrong')
    updateProgress({ wrongAnswers: progress.wrongAnswers + 1, streak: 0 })
    if (mode === 'exam') {
      const exist = mistakeBook.find(m => m.word === currentWord.word.toLowerCase())
      if (exist) {
        setMistakeBook(mistakeBook.map(m => m.word === currentWord.word.toLowerCase() ? { ...m, wrongCount: m.wrongCount + 1, wrongDate: new Date().toISOString(), repetitionLevel: 0 } : m))
      } else {
        setMistakeBook([...mistakeBook, {
          id: Date.now(), word: currentWord.word.toLowerCase(), meaning: currentWord.meaning,
          example: currentWord.example, phonetic: currentWord.phonetic || '', wrongCount: 1,
          wrongDate: new Date().toISOString(), nextReviewDate: new Date(Date.now() + 86400000).toISOString(), repetitionLevel: 0
        }])
      }
    }
  }, [updateProgress, progress, mode, mistakeBook, setMistakeBook, currentWord])

  const nextWord = () => {
    setUserInput('')
    setShowResult(null)
    setShowHint(false)
    setHasCheckedAnswer(false)
    if (mode === 'learn') {
      const lib = getFilteredWordLibrary()
      const ni = (currentWordIndex + 1) % lib.length
      setCurrentWordIndex(ni)
      setCurrentWord(lib[ni])
      if (currentBook !== '全部词本') {
        setStudyProgress({ ...studyProgress, [currentBook]: { ...studyProgress[currentBook], lastIndex: ni, lastStudyDate: new Date().toISOString() } })
      }
    } else {
      setCurrentWord(getRandomWord(currentWord?.id))
    }
  }

  const prevWord = () => {
    setUserInput('')
    setShowResult(null)
    setShowHint(false)
    setHasCheckedAnswer(false)
    if (mode === 'learn') {
      const lib = getFilteredWordLibrary()
      const ni = (currentWordIndex - 1 + lib.length) % lib.length
      setCurrentWordIndex(ni)
      setCurrentWord(lib[ni])
      if (currentBook !== '全部词本') {
        setStudyProgress({ ...studyProgress, [currentBook]: { ...studyProgress[currentBook], lastIndex: ni, lastStudyDate: new Date().toISOString() } })
      }
    }
  }

  const keyboardRows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ]

  const getKeyColor = (key) => {
    const k = key.toLowerCase()
    if (showResult === 'correct') return '#10b981'
    if (showResult === 'wrong') return '#ef4444'
    if (pressedKey === k) return '#6366f1'
    if (mode === 'learn' && currentWord) {
      const t = userInput.length
      return t < currentWord.word.length && currentWord.word[t].toLowerCase() === k ? '#6366f1' : '#f3f4f6'
    }
    return '#f3f4f6'
  }

  if (!currentWord) {
    const lib = getFilteredWordLibrary()
    return (
      <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '60px 30px', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '20px', color: '#1f2937' }}>
            {lib.length === 0 ? '当前词本为空' : '词库为空'}
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '30px' }}>
            {currentBook !== '全部词本' ? `当前学习：${currentBook}` : '请先选择词本'}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn" onClick={() => setCurrentPage('library')} style={{ padding: '12px 24px', borderRadius: '10px', background: '#6366f1', color: 'white', border: 'none', cursor: 'pointer' }}>
              去管理单词
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in" style={{ maxWidth: '920px', margin: '0 auto', padding: '24px' }}>
      {/* 顶部导航 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ fontSize: '22px', fontWeight: '700', color: '#1f2937' }}>
          📚 {mode === 'learn' ? '学习模式' : '考试模式'}
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => setMode('learn')} style={{ padding: '10px 16px', borderRadius: '10px', border: 'none', background: mode === 'learn' ? '#6366f1' : '#f3f4f6', color: mode === 'learn' ? 'white' : '#374151', fontWeight: '600', cursor: 'pointer' }}>学习</button>
          <button onClick={() => setMode('exam')} style={{ padding: '10px 16px', borderRadius: '10px', border: 'none', background: mode === 'exam' ? '#6366f1' : '#f3f4f6', color: mode === 'exam' ? 'white' : '#374151', fontWeight: '600', cursor: 'pointer' }}>考试</button>
          <button onClick={() => setCurrentPage('library')} style={{ padding: '10px 16px', borderRadius: '10px', border: 'none', background: '#f3f4f6', color: '#374151', fontWeight: '600', cursor: 'pointer' }}>切换词本</button>
          <button onClick={() => setCurrentPage('home')} style={{ padding: '10px 16px', borderRadius: '10px', border: 'none', background: '#f3f4f6', color: '#374151', fontWeight: '600', cursor: 'pointer' }}>返回</button>
        </div>
      </div>

      {/* 状态标签 */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '28px', flexWrap: 'wrap' }}>
        <span style={{ padding: '8px 16px', borderRadius: '50px', background: '#6366f1', color: 'white', fontSize: '14px', fontWeight: '600' }}>
          连续正确 {progress.streak}
        </span>
        {mode === 'learn' && (
          <>
            <span style={{ padding: '8px 16px', borderRadius: '50px', background: '#10b981', color: 'white', fontSize: '14px', fontWeight: '600' }}>
              今日 {todayLearnedCount}/{dailyGoal}
            </span>
            <span style={{ padding: '8px 16px', borderRadius: '50px', background: '#f59e0b', color: 'white', fontSize: '14px', fontWeight: '600' }}>
              {currentBook === '全部词本' ? '全部词本' : currentBook}
            </span>
          </>
        )}
      </div>

      {/* 单词卡片核心区 */}
      <div className="card" style={{
        background: 'white',
        borderRadius: '24px',
        padding: '48px 32px',
        boxShadow: '0 15px 50px rgba(0,0,0,0.06)',
        marginBottom: '32px',
        textAlign: 'center'
      }}>
        {mode === 'learn' ? (
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            {/* 单词 + 发音 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
              <h1 style={{
                fontSize: '52px',
                fontWeight: '800',
                color: '#111827',
                margin: '0',
                letterSpacing: '1px'
              }}>
                {currentWord.word}
              </h1>
              <button
                onClick={() => speakWord(currentWord.word)}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white',
                  fontSize: '26px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(99,102,241,0.3)',
                  transition: '0.2s'
                }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.08)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
              >
                🔊
              </button>
            </div>

            {/* 音标 */}
            {currentWord.phonetic && (
              <p style={{
                fontSize: '20px',
                color: '#6b7280',
                margin: '0 0 24px 0',
                fontWeight: '500'
              }}>
                {currentWord.phonetic}
              </p>
            )}

            {/* 释义 */}
            <p style={{
              fontSize: '26px',
              color: '#6366f1',
              fontWeight: '700',
              margin: '0 0 20px 0',
              lineHeight: '1.5'
            }}>
              {currentWord.meaning}
            </p>

            {/* 例句 */}
            <p style={{
              fontSize: '18px',
              color: '#4b5563',
              fontStyle: 'italic',
              margin: '0',
              lineHeight: '1.6'
            }}>
              "{currentWord.example}"
            </p>
          </div>
        ) : (
          <div style={{ maxWidth: '650px', margin: '0 auto' }}>
            <div style={{ fontSize: '26px', color: '#6366f1', fontWeight: '700', marginBottom: '16px' }}>
              {currentWord.meaning}
            </div>
            {currentWord.phonetic && (
              <div style={{ fontSize: '18px', color: '#6b7280', marginBottom: '12px' }}>
                {currentWord.phonetic}
              </div>
            )}
            <div style={{ fontSize: '15px', color: '#9ca3af', marginBottom: '32px' }}>
              请拼写单词
            </div>

            {/* 拼写占位 */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '36px' }}>
              {currentWord.word.split('').map((char, i) => {
                if (char === ' ') return <div key={i} style={{ width: '20px' }} />
                let inputPos = 0
                currentWord.word.slice(0, i).split('').forEach(c => { if (c !== ' ') inputPos++ })
                return (
                  <div key={i} style={{
                    width: '38px',
                    height: '52px',
                    borderBottom: '3px solid #d1d5db',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '26px',
                    fontWeight: '700',
                    color: showResult === 'correct' ? '#10b981' : showResult === 'wrong' ? '#ef4444' : '#111827'
                  }}>
                    {userInput[inputPos] || ''}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 结果提示 */}
        {showResult === 'wrong' && (
          <div style={{
            padding: '20px',
            background: 'rgba(239,68,68,0.08)',
            borderRadius: '16px',
            margin: '24px 0'
          }}>
            <p style={{ color: '#dc2626', fontSize: '18px', fontWeight: '600', margin: '0 0 6px 0' }}>
              正确：{currentWord.word}
            </p>
            {currentWord.phonetic && <p style={{ color: '#6b7280', margin: 0 }}>{currentWord.phonetic}</p>}
          </div>
        )}

        {showResult === 'correct' && (
          <div style={{
            padding: '20px',
            background: 'rgba(16,185,129,0.08)',
            borderRadius: '16px',
            margin: '24px 0'
          }}>
            <p style={{ color: '#059669', fontSize: '18px', fontWeight: '600', margin: '0 0 6px 0' }}>
              ✔ 回答正确
            </p>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
              按空格键继续
            </p>
          </div>
        )}

        {/* 按钮组 */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '20px' }}>
          {mode === 'learn' && (
            <button onClick={prevWord} style={{ padding: '12px 20px', borderRadius: '12px', border: 'none', background: '#f3f4f6', color: '#374151', fontWeight: '600', cursor: 'pointer' }}>← 上一个</button>
          )}
          {mode === 'exam' && (
            <button onClick={() => setShowHint(!showHint)} style={{ padding: '12px 20px', borderRadius: '12px', border: 'none', background: '#f3f4f6', color: '#374151', fontWeight: '600', cursor: 'pointer' }}>💡 提示</button>
          )}
          {mode === 'exam' && !hasCheckedAnswer && (
            <button onClick={submitAnswer} disabled={!userInput} style={{ padding: '12px 20px', borderRadius: '12px', border: 'none', background: '#6366f1', color: 'white', fontWeight: '600', cursor: 'pointer' }}>确定</button>
          )}
          {mode === 'exam' && !hasCheckedAnswer && (
            <button onClick={handleWrong} style={{ padding: '12px 20px', borderRadius: '12px', border: 'none', background: '#ef4444', color: 'white', fontWeight: '600', cursor: 'pointer' }}>显示答案</button>
          )}
          {mode === 'exam' && hasCheckedAnswer && showResult === 'correct' && (
            <button onClick={resetToNextWord} style={{ padding: '12px 20px', borderRadius: '12px', border: 'none', background: '#6366f1', color: 'white', fontWeight: '600', cursor: 'pointer' }}>下一题</button>
          )}
          {mode === 'exam' && hasCheckedAnswer && showResult === 'wrong' && (
            <button onClick={() => { setUserInput(''); setShowResult(null); setHasCheckedAnswer(false) }} style={{ padding: '12px 20px', borderRadius: '12px', border: 'none', background: '#6366f1', color: 'white', fontWeight: '600', cursor: 'pointer' }}>重新拼写</button>
          )}
          {mode === 'learn' && (
            <button onClick={nextWord} style={{ padding: '12px 20px', borderRadius: '12px', border: 'none', background: '#6366f1', color: 'white', fontWeight: '600', cursor: 'pointer' }}>下一个 →</button>
          )}
          <button onClick={toggleMode} style={{ padding: '12px 20px', borderRadius: '12px', border: 'none', background: '#f3f4f6', color: '#374151', fontWeight: '600', cursor: 'pointer' }}>
            {mode === 'learn' ? '切换考试' : '切换学习'}
          </button>
        </div>

        {/* 提示面板 */}
        {showHint && mode === 'exam' && (
          <div style={{
            marginTop: '24px',
            padding: '20px',
            background: 'rgba(99,102,241,0.06)',
            borderRadius: '16px',
            textAlign: 'left'
          }}>
            <p style={{ margin: '0 0 6px 0', color: '#6366f1', fontWeight: '600' }}>
              长度：{currentWord.word.length} 字母
            </p>
            <p style={{ margin: 0, color: '#6b7280', fontStyle: 'italic' }}>
              例句：{currentWord.example}
            </p>
          </div>
        )}
      </div>

      {/* 虚拟键盘 */}
      {mode === 'exam' && (
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
            {keyboardRows.map((row, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '6px' }}>
                {row.map(key => (
                  <button
                    key={key}
                    onClick={() => handleKeyPress(key)}
                    disabled={hasCheckedAnswer}
                    style={{
                      width: '48px',
                      height: '56px',
                      borderRadius: '10px',
                      border: 'none',
                      background: getKeyColor(key),
                      color: getKeyColor(key) === '#f3f4f6' ? '#111827' : 'white',
                      fontSize: '20px',
                      fontWeight: '600',
                      cursor: hasCheckedAnswer ? 'not-allowed' : 'pointer',
                      transition: '0.15s'
                    }}
                    onMouseDown={e => e.target.style.transform = 'scale(0.96)'}
                    onMouseUp={e => e.target.style.transform = 'scale(1)'}
                  >
                    {key.toUpperCase()}
                  </button>
                ))}
              </div>
            ))}
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button onClick={() => handleKeyPress('BACK')} disabled={hasCheckedAnswer} style={{ width: '110px', height: '56px', borderRadius: '10px', border: 'none', background: '#e5e7eb', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>← 删除</button>
              <button onClick={() => handleKeyPress('SPACE')} disabled={hasCheckedAnswer} style={{ width: '310px', height: '56px', borderRadius: '10px', border: 'none', background: '#e5e7eb', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>空格</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Study