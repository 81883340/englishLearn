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
      const enVoice = voices.find(v => v.lang.includes('en-US') && (v.name.includes('Google') ||
                                     v.name.includes('Microsoft') ||
                                     v.name.includes('Samantha') ||
                                     v.name.includes('Daniel')))
      if (enVoice) {
        utterance.voice = enVoice
      }

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
    if (currentBook === '全部词本') {
      return wordLibrary
    }
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

    if (excludeId && pool.length > 1) {
      pool = pool.filter(w => w.id !== excludeId)
    }

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

  // 👇 这里屏蔽了空格，完全禁止输入
  const handleKeyPress = useCallback((key) => {
    if (hasCheckedAnswerRef.current) return

    // 禁止空格
    if (key === 'SPACE') return

    if (key === 'BACK') {
      setUserInput(prev => prev.slice(0, -1))
    } else if (key.length === 1) {
      setUserInput(prev => prev + key)
    }
  }, [])

  const submitAnswer = useCallback(() => {
    if (!currentWord || userInput.length === 0) return

    setHasCheckedAnswer(true)

    const cleanInput = userInput.replace(/\s+/g, '')
    const cleanWord = currentWord.word.replace(/\s+/g, '')

    if (cleanInput.toLowerCase() === cleanWord.toLowerCase()) {
      setShowResult('correct')
      const newStreak = progress.streak + 1
      const newCorrect = progress.correctAnswers + 1

      updateProgress({
        totalLearned: progress.totalLearned + 1,
        correctAnswers: newCorrect,
        streak: newStreak
      })

      if (!learnedWords.includes(currentWord.id)) {
        setLearnedWords([...learnedWords, currentWord.id])
      }

      setPoints(prev => prev + 2)
      setTodayLearnedCount(prev => prev + 1)
      setSessionLearnedCount(prev => prev + 1)

      if (currentBook !== '全部词本') {
        const filteredLibrary = getFilteredWordLibrary()
        const currentIndex = filteredLibrary.findIndex(w => w.id === currentWord.id)
        const newLastIndex = (currentIndex + 1) % filteredLibrary.length

        setStudyProgress({
          ...studyProgress,
          [currentBook]: {
            ...studyProgress[currentBook],
            lastIndex: newLastIndex,
            lastStudyDate: new Date().toISOString()
          }
        })
      }

      const newTodayCount = todayLearnedCount + 1
      if (newTodayCount >= dailyGoal) {
        handleCompleteDailyGoal()
      }

      triggerConfetti()
    } else {
      setShowResult('wrong')
      updateProgress({
        wrongAnswers: progress.wrongAnswers + 1,
        streak: 0
      })

      if (mode === 'exam') {
        const existingMistake = mistakeBook.find(m => m.word === currentWord.word.toLowerCase())

        if (existingMistake) {
          setMistakeBook(mistakeBook.map(m =>
            m.word === currentWord.word.toLowerCase()
              ? {
                  ...m,
                  wrongCount: m.wrongCount + 1,
                  wrongDate: new Date().toISOString(),
                  repetitionLevel: 0
                }
              : m
          ))
        } else {
          const newMistake = {
            id: Date.now(),
            word: currentWord.word.toLowerCase(),
            meaning: currentWord.meaning,
            example: currentWord.example,
            phonetic: currentWord.phonetic || '',
            wrongCount: 1,
            wrongDate: new Date().toISOString(),
            nextReviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            repetitionLevel: 0
          }
          setMistakeBook([mistakeBook, newMistake])
        }
      }
    }
  }, [currentWord, userInput, progress, learnedWords, updateProgress, setLearnedWords, mode, mistakeBook, setMistakeBook, setPoints, todayLearnedCount, setTodayLearnedCount, setSessionLearnedCount, dailyGoal, handleCompleteDailyGoal, currentBook, studyProgress, setStudyProgress, getFilteredWordLibrary])

  // 👇 物理键盘也屏蔽空格输入
  const handlePhysicalKeyboard = useCallback((e) => {
    const key = e.key.toLowerCase()

    setPressedKey(key)
    setTimeout(() => setPressedKey(null), 150)

    const checked = hasCheckedAnswerRef.current

    if (mode === 'exam' && checked) {
      if (key === ' ') {
        e.preventDefault()
        if (showResult === 'correct') {
          resetToNextWord()
        }
        if (showResult === 'wrong') {
          setUserInput('')
          setShowResult(null)
          setShowHint(false)
          setHasCheckedAnswer(false)
        }
      }
      return
    }

    if (mode === 'learn') {
      if (!e.ctrlKey && !e.altKey && !e.metaKey &&
          key !== 'control' && key !== 'alt' && key !== 'meta' &&
          key !== 'backspace' && key !== 'tab' && key !== 'escape') {
        const newIndex = (currentWordIndex + 1) % wordLibrary.length
        setCurrentWordIndex(newIndex)
        setCurrentWord(wordLibrary[newIndex])
        setUserInput('')
        setShowResult(null)
        setShowHint(false)
        setHasCheckedAnswer(false)
        return
      }
    }

    if (mode === 'exam' && !checked) {
      // 👇 禁止物理键盘空格
      if (key === ' ') {
        e.preventDefault()
        return
      }

      if (key === 'backspace') {
        e.preventDefault()
        handleKeyPress('BACK')
      } else if (key === 'enter') {
        e.preventDefault()
        submitAnswer()
      } else if (key.length === 1 && /[a-z]/.test(key)) {
        handleKeyPress(key)
      }
    }
  }, [mode, currentWordIndex, wordLibrary, handleKeyPress, resetToNextWord, submitAnswer, showResult])

  useEffect(() => {
    window.addEventListener('keydown', handlePhysicalKeyboard)
    return () => window.removeEventListener('keydown', handlePhysicalKeyboard)
  }, [handlePhysicalKeyboard])

  const toggleMode = () => {
    const filteredLibrary = getFilteredWordLibrary()
    setMode(prev => prev === 'learn' ? 'exam' : 'learn')
    setUserInput('')
    setShowResult(null)
    setShowHint(false)
    setHasCheckedAnswer(false)
    if (mode === 'exam') {
      const bookProgress = studyProgress[currentBook] || { lastIndex: 0 }
      const startIndex = bookProgress.lastIndex || 0
      setCurrentWordIndex(startIndex)
      setCurrentWord(filteredLibrary[0])
    } else {
      setCurrentWord(getRandomWord())
    }
  }

  const handleWrong = useCallback(() => {
    setHasCheckedAnswer(true)
    setShowResult('wrong')
    updateProgress({
      wrongAnswers: progress.wrongAnswers + 1,
      streak: 0
    })

    if (mode === 'exam') {
      const existingMistake = mistakeBook.find(m => m.word === currentWord.word.toLowerCase())

      if (existingMistake) {
        setMistakeBook(mistakeBook.map(m =>
          m.word === currentWord.word.toLowerCase()
            ? {
                ...m,
                wrongCount: m.wrongCount + 1,
                wrongDate: new Date().toISOString(),
                repetitionLevel: 0
              }
            : m
        ))
      } else {
        const newMistake = {
          id: Date.now(),
          word: currentWord.word.toLowerCase(),
          meaning: currentWord.meaning,
          example: currentWord.example,
          phonetic: currentWord.phonetic || '',
          wrongCount: 1,
          wrongDate: new Date().toISOString(),
          nextReviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          repetitionLevel: 0
        }
        setMistakeBook([mistakeBook, newMistake])
      }
    }
  }, [updateProgress, progress, mode, mistakeBook, setMistakeBook, currentWord])

  const nextWord = () => {
    setUserInput('')
    setShowResult(null)
    setShowHint(false)
    setHasCheckedAnswer(false)

    if (mode === 'learn') {
      const filteredLibrary = getFilteredWordLibrary()
      const newIndex = (currentWordIndex + 1) % filteredLibrary.length
      setCurrentWordIndex(newIndex)
      setCurrentWord(filteredLibrary[newIndex])

      if (currentBook !== '全部词本') {
        setStudyProgress({
          ...studyProgress,
          [currentBook]: {
            ...studyProgress[currentBook],
            lastIndex: newIndex,
            lastStudyDate: new Date().toISOString()
          }
        })
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
      const filteredLibrary = getFilteredWordLibrary()
      const newIndex = (currentWordIndex - 1 + filteredLibrary.length) % filteredLibrary.length
      setCurrentWordIndex(newIndex)
      setCurrentWord(filteredLibrary[newIndex])

      if (currentBook !== '全部词本') {
        setStudyProgress({
          ...studyProgress,
          [currentBook]: {
            ...studyProgress[currentBook],
            lastIndex: newIndex,
            lastStudyDate: new Date().toISOString()
          }
        })
      }
    }
  }

  const keyboardRows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ]

  const getKeyColor = (key) => {
    const lowerKey = key.toLowerCase()
    if (showResult === 'correct') return '#10b981'
    if (showResult === 'wrong') return '#ef4444'

    if (pressedKey === lowerKey) return 'var(--primary)'

    if (mode === 'learn') {
      const targetIndex = userInput.length
      if (targetIndex < currentWord?.word.length) {
        return currentWord.word[targetIndex].toLowerCase() === lowerKey ? 'var(--primary)' : '#e5e7eb'
      }
    }

    return '#e5e7eb'
  }

  if (!currentWord) {
    const filteredLibrary = getFilteredWordLibrary()
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '20px' }}>
            {filteredLibrary.length === 0 ? '当前词本为空' : '词库为空'}
          </h2>
          <p style={{ color: 'var(--gray)', marginBottom: '20px' }}>
            {currentBook !== '全部词本' ? `当前学习词本: ${currentBook}` : '请先选择一个词本'}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '30px' }}>
            {currentBook === '全部词本' && (
              <button className="btn btn-primary" onClick={() => setCurrentPage('library')}>
                去选择词本
              </button>
            )}
            <button className="btn btn-primary" onClick={() => setCurrentPage('library')}>
              去添加单词
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container fade-in">
      <nav className="navbar">
        <div className="navbar-brand">
          <span>📚 {mode === 'learn' ? '学习模式' : '考试模式'}</span>
        </div>
        <div className="navbar-nav">
          <button
            className={`nav-link ${mode === 'learn' ? 'active' : ''}`}
            onClick={() => mode !== 'learn' && toggleMode()}
          >
            学习模式
          </button>
          <button
            className={`nav-link ${mode === 'exam' ? 'active' : ''}`}
            onClick={() => mode !== 'exam' && toggleMode()}
          >
            考试模式
          </button>
          <button
            className="nav-link"
            onClick={() => setCurrentPage('library')}
            style={{ fontSize: '13px' }}
          >
            📖 切换词本
          </button>
          <button className="nav-link" onClick={() => setCurrentPage('home')}>
            返回首页
          </button>
        </div>
      </nav>

      <div className="card" style={{
        maxWidth: '800px',
        margin: '0 auto 40px',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '30px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-block',
            padding: '8px 20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            连续正确: {progress.streak}
          </span>
          {mode === 'learn' && (
            <>
              <span style={{
                display: 'inline-block',
                padding: '8px 20px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                今日学习: {todayLearnedCount}/{dailyGoal}
              </span>
              <span style={{
                display: 'inline-block',
                padding: '8px 20px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                当前词本: {currentBook === '全部词本' ? '全部' : currentBook}
              </span>
            </>
          )}
        </div>

        <div style={{ marginBottom: '40px' }}>
          {mode === 'learn' ? (
            <>
              <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '12px' }}>
                  <h1 style={{
                    fontSize: '56px',
                    fontWeight: '800',
                    color: 'var(--dark)',
                    marginBottom: 0,
                    lineHeight: '1.2'
                  }}>
                    {currentWord.word}
                  </h1>
                  <button
                    onClick={() => speakWord(currentWord.word)}
                    style={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      border: '2px solid #a78bfa',
                      borderRadius: '50%',
                      width: '56px',
                      height: '56px',
                      fontSize: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.1)'
                      e.target.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)'
                      e.target.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.3)'
                    }}
                    title="点击发音"
                  >
                    🔊
                  </button>
                </div>
                {currentWord.phonetic && (
                  <p style={{
                    fontSize: '20px',
                    color: 'var(--gray)',
                    fontFamily: 'Arial, sans-serif',
                    fontWeight: '400',
                    marginBottom: '16px'
                  }}>
                    📢 {currentWord.phonetic}
                  </p>
                )}
              </div>
              <p style={{
                fontSize: '24px',
                color: 'var(--primary)',
                fontWeight: '600',
                marginBottom: '16px'
              }}>
                {currentWord.meaning}
              </p>
              <p style={{
                fontSize: '18px',
                color: 'var(--gray)',
                fontStyle: 'italic'
              }}>
                "{currentWord.example}"
              </p>
            </>
          ) : (
            <>
              <div style={{
                fontSize: '24px',
                color: 'var(--primary)',
                fontWeight: '600',
                marginBottom: '16px'
              }}>
                {currentWord.meaning}
              </div>
              {currentWord.phonetic && (
                <div style={{
                  fontSize: '18px',
                  color: 'var(--gray)',
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: '400',
                  marginBottom: '12px'
                }}>
                  📢 {currentWord.phonetic}
                </div>
              )}
              <div style={{
                fontSize: '14px',
                color: 'var(--gray)',
                marginBottom: '10px'
              }}>
                请拼写这个单词
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                marginBottom: '30px',
                flexWrap: 'wrap',
                padding: '10px'
              }}>
                {currentWord.word.split('').map((char, index) => {
                  if (char === ' ') {
                    return (
                      <div
                        key={index}
                        style={{
                          width: '24px',
                          height: '60px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      />
                    )
                  }

                  let inputIndex = 0
                  let charCount = 0
                  for (let i = 0; i < index; i++) {
                    if (currentWord.word[i] !== ' ') {
                      charCount++
                    }
                  }
                  inputIndex = charCount

                  return (
                    <div
                      key={index}
                      style={{
                        width: '52px',
                        height: '60px',
                        borderBottom: '4px solid #d1d5db',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px',
                        fontWeight: '700',
                        color: userInput[inputIndex]
                          ? showResult === 'correct'
                            ? '#10b981'
                            : showResult === 'wrong'
                              ? '#ef4444'
                              : 'var(--dark)'
                          : '#9ca3af'
                      }}
                    >
                      {userInput[inputIndex] || ''}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {mode === 'learn' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '40px'
          }}>
            <div style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              {userInput.split('').map((char, index) => (
                <span
                  key={index}
                  style={{
                    display: 'inline-block',
                    width: '50px',
                    height: '60px',
                    lineHeight: '60px',
                    fontSize: '32px',
                    fontWeight: '700',
                    color: 'white',
                    background: char === currentWord.word[index]
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    borderRadius: '10px',
                    textAlign: 'center',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {char}
                </span>
              ))}
            </div>
          </div>
        )}

        {showResult === 'wrong' && (
          <div style={{
            padding: '20px',
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <p style={{
              fontSize: '20px',
              color: 'var(--danger)',
              fontWeight: '600',
              marginBottom: '10px'
            }}>
              正确答案是: {currentWord.word}
            </p>
            {currentWord.phonetic && (
              <p style={{
                fontSize: '16px',
                color: 'var(--gray)',
                fontWeight: '500'
              }}>
                音标: {currentWord.phonetic}
              </p>
            )}
          </div>
        )}

        {showResult === 'correct' && (
          <div style={{
            padding: '20px',
            background: 'rgba(16, 185, 129, 0.1)',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <p style={{
              fontSize: '20px',
              color: '#10b981',
              fontWeight: '600',
              marginBottom: '10px'
            }}>
              ✓ 回答正确！
            </p>
            <p style={{
              fontSize: '14px',
              color: 'var(--gray)'
            }}>
              按空格键继续下一题
            </p>
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          marginBottom: '40px',
          flexWrap: 'wrap'
        }}>
          {mode === 'learn' && (
            <button className="btn btn-secondary" onClick={prevWord}>
              ← 上一个
            </button>
          )}
          {mode === 'exam' && (
            <button
              className="btn btn-secondary"
              onClick={() => setShowHint(!showHint)}
            >
              💡 {showHint ? '隐藏提示' : '显示提示'}
            </button>
          )}
          {mode === 'exam' && !hasCheckedAnswer && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={submitAnswer}
              disabled={userInput.length === 0}
            >
              检查答案 (Enter)
            </button>
          )}
          {mode === 'exam' && !hasCheckedAnswer && (
            <button className="btn btn-danger" onClick={handleWrong}>
              显示答案
            </button>
          )}
          {mode === 'exam' && hasCheckedAnswer && showResult === 'correct' && (
            <button className="btn btn-primary" onClick={resetToNextWord}>
              下一个单词 (Space)
            </button>
          )}
          {mode === 'exam' && hasCheckedAnswer && showResult === 'wrong' && (
            <button className="btn btn-primary" onClick={() => {
              setUserInput('')
              setShowResult(null)
              setShowHint(false)
              setHasCheckedAnswer(false)
            }}>
              重新拼写 (Space)
            </button>
          )}
          {mode === 'learn' && (
            <button className="btn btn-primary" onClick={nextWord}>
              下一个单词 →
            </button>
          )}
          {mode === 'learn' && (
            <button className="btn btn-secondary" onClick={toggleMode}>
              切换到考试模式
            </button>
          )}
          {mode === 'exam' && (
            <button className="btn btn-secondary" onClick={toggleMode}>
              切换到学习模式
            </button>
          )}
        </div>

        {showHint && mode === 'exam' && (
          <div style={{
            padding: '16px 24px',
            background: 'rgba(99, 102, 241, 0.1)',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <p style={{ color: 'var(--primary)', fontWeight: '500', marginBottom: '8px' }}>
              单词长度: {currentWord.word.length} 个字母
            </p>
            <p style={{ color: 'var(--gray)', fontSize: '14px', fontStyle: 'italic' }}>
              例句: "{currentWord.example}"
            </p>
          </div>
        )}
      </div>

      {mode === 'exam' && (
        <div className="card" style={{
          maxWidth: '700px',
          margin: '0 auto',
          padding: '30px'
        }}>
        <h3 style={{
          textAlign: 'center',
          marginBottom: '20px',
          color: 'var(--dark)',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          虚拟键盘
        </h3>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          alignItems: 'center'
        }}>
          {keyboardRows.map((row, rowIndex) => (
            <div key={rowIndex} style={{ display: 'flex', gap: '6px' }}>
              {row.map((key) => (
                <button
                  key={key}
                  onClick={() => handleKeyPress(key)}
                  style={{
                    width: '48px',
                    height: '56px',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '20px',
                    fontWeight: '600',
                    background: getKeyColor(key),
                    color: getKeyColor(key) === '#e5e7eb' ? 'var(--dark)' : 'white',
                    cursor: hasCheckedAnswer ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
                  }}
                  disabled={hasCheckedAnswer}
                  onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
                  onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                  {key.toUpperCase()}
                </button>
              ))}
            </div>
          ))}

          <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
            <button
              onClick={() => handleKeyPress('BACK')}
              style={{
                width: '100px',
                height: '56px',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                background: '#e5e7eb',
                color: 'var(--dark)',
                cursor: hasCheckedAnswer ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
              }}
              disabled={hasCheckedAnswer}
            >
              ← Back
            </button>
            {/* 👇 空格按钮还在，但点击已经无效 */}
            <button
              style={{
                width: '300px',
                height: '56px',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                background: '#e5e7eb',
                color: 'var(--dark)',
                cursor: 'default',
                opacity: 0.6
              }}
              disabled
            >
              Space 已禁用
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}

export default Study