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

function Study({ wordLibrary, learnedWords, setLearnedWords, updateProgress, progress, setCurrentPage }) {
  const [mode, setMode] = useState('learn') // 'learn' | 'exam'
  const [currentWord, setCurrentWord] = useState(null)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [showResult, setShowResult] = useState(null) // 'correct' | 'wrong' | null
  const [showHint, setShowHint] = useState(false)
  const [pressedKey, setPressedKey] = useState(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // 使用 ref 来避免闭包问题
  const isSubmittedRef = useRef(isSubmitted)
  useEffect(() => {
    isSubmittedRef.current = isSubmitted
  }, [isSubmitted])

  const getRandomWord = useCallback((excludeId = null) => {
    const unlearned = wordLibrary.filter(w => !learnedWords.includes(w.id))
    let pool = unlearned.length > 0 ? unlearned : wordLibrary

    if (excludeId && pool.length > 1) {
      pool = pool.filter(w => w.id !== excludeId)
    }

    const randomIndex = Math.floor(Math.random() * pool.length)
    return pool[randomIndex]
  }, [wordLibrary, learnedWords])

  // 初始化单词
  useEffect(() => {
    if (wordLibrary.length > 0) {
      if (mode === 'learn') {
        setCurrentWordIndex(0)
        setCurrentWord(wordLibrary[0])
      } else {
        setCurrentWord(getRandomWord())
      }
    }
  }, [wordLibrary, learnedWords, mode, getRandomWord])

  // 重置到新单词（用于考试模式）
  const resetToNextWord = useCallback(() => {
    const newWord = getRandomWord(currentWord?.id)
    setCurrentWord(newWord)
    setUserInput('')
    setShowResult(null)
    setShowHint(false)
    setIsSubmitted(false)
  }, [currentWord, getRandomWord])

  // 虚拟键盘按键处理（未提交状态）
  const handleKeyPress = useCallback((key) => {
    if (isSubmittedRef.current) return

    if (key === 'BACK') {
      setUserInput(prev => prev.slice(0, -1))
    } else if (key === 'SPACE') {
      setUserInput(prev => prev + ' ')
    } else if (key.length === 1) {
      setUserInput(prev => prev + key)
    }
  }, [])

  // 物理键盘处理 - 使用 useCallback 避免频繁重建
  const handlePhysicalKeyboard = useCallback((e) => {
    const key = e.key.toLowerCase()

    // 按键高亮效果
    setPressedKey(key)
    setTimeout(() => setPressedKey(null), 150)

    const submitted = isSubmittedRef.current

    // 考试模式 - 已提交状态
    if (mode === 'exam' && submitted) {
      // 按任意键继续到下一个单词
      if (key.length === 1 || key === 'enter' || key === ' ') {
        resetToNextWord()
      }
      return
    }

    // 学习模式
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
        setIsSubmitted(false)
        return
      }
    }

    // 考试模式 - 未提交状态
    if (mode === 'exam' && !submitted) {
      if (key === 'backspace') {
        handleKeyPress('BACK')
      } else if (key === ' ') {
        e.preventDefault()
        handleKeyPress('SPACE')
      } else if (key === 'enter') {
        // 回车键提交答案
        submitAnswer()
        e.preventDefault()
      } else if (key.length === 1 && /[a-z]/.test(key)) {
        handleKeyPress(key)
      }
    }
  }, [mode, currentWordIndex, wordLibrary, handleKeyPress, resetToNextWord])

  useEffect(() => {
    window.addEventListener('keydown', handlePhysicalKeyboard)
    return () => window.removeEventListener('keydown', handlePhysicalKeyboard)
  }, [handlePhysicalKeyboard])

  const toggleMode = () => {
    setMode(prev => prev === 'learn' ? 'exam' : 'learn')
    // 切换模式后重置状态
    setUserInput('')
    setShowResult(null)
    setShowHint(false)
    setIsSubmitted(false)
    if (mode === 'exam') {
      // 从考试切换到学习，重置到第一个单词
      setCurrentWordIndex(0)
      setCurrentWord(wordLibrary[0])
    } else {
      // 从学习切换到考试，选择随机单词
      setCurrentWord(getRandomWord())
    }
  }

  const submitAnswer = useCallback(() => {
    if (!currentWord || userInput.length === 0) return

    setIsSubmitted(true)
    setShowResult(null)

    if (userInput.toLowerCase() === currentWord.word.toLowerCase()) {
      // 答对
      setTimeout(() => {
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

        triggerConfetti()
      }, 0)
    } else {
      // 答错
      setTimeout(() => {
        setShowResult('wrong')
        updateProgress({
          wrongAnswers: progress.wrongAnswers + 1,
          streak: 0
        })
      }, 0)
    }
  }, [currentWord, userInput, progress, learnedWords, updateProgress, setLearnedWords])

  const handleWrong = useCallback(() => {
    setIsSubmitted(true)
    setShowResult('wrong')
    updateProgress({
      wrongAnswers: progress.wrongAnswers + 1,
      streak: 0
    })
  }, [updateProgress])

  const nextWord = () => {
    setUserInput('')
    setShowResult(null)
    setShowHint(false)
    setIsSubmitted(false)

    if (mode === 'learn') {
      const newIndex = (currentWordIndex + 1) % wordLibrary.length
      setCurrentWordIndex(newIndex)
      setCurrentWord(wordLibrary[newIndex])
    } else {
      setCurrentWord(getRandomWord(currentWord?.id))
    }
  }

  const prevWord = () => {
    setUserInput('')
    setShowResult(null)
    setShowHint(false)
    setIsSubmitted(false)

    if (mode === 'learn') {
      const newIndex = (currentWordIndex - 1 + wordLibrary.length) % wordLibrary.length
      setCurrentWordIndex(newIndex)
      setCurrentWord(wordLibrary[newIndex])
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

    // 按键高亮
    if (pressedKey === lowerKey) return 'var(--primary)'

    // 学习模式：显示提示颜色
    if (mode === 'learn') {
      const targetIndex = userInput.length
      if (targetIndex < currentWord?.word.length) {
        return currentWord.word[targetIndex].toLowerCase() === lowerKey ? 'var(--primary)' : '#e5e7eb'
      }
    }

    return '#e5e7eb'
  }

  if (!currentWord) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '20px' }}>词库为空</h2>
          <p style={{ color: 'var(--gray)', marginBottom: '30px' }}>
            请先在词库管理中添加单词
          </p>
          <button className="btn btn-primary" onClick={() => setCurrentPage('library')}>
            去添加单词
          </button>
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
        <div style={{ marginBottom: '30px' }}>
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
        </div>

        <div style={{ marginBottom: '40px' }}>
          {mode === 'learn' ? (
            // 学习模式：显示单词、释义、例句
            <>
              <h1 style={{
                fontSize: '48px',
                fontWeight: '800',
                color: 'var(--dark)',
                marginBottom: '20px'
              }}>
                {currentWord.word}
              </h1>
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
            // 考试模式：只显示释义，隐藏单词和例句
            <>
              <div style={{
                fontSize: '24px',
                color: 'var(--primary)',
                fontWeight: '600',
                marginBottom: '16px'
              }}>
                {currentWord.meaning}
              </div>
              <div style={{
                fontSize: '14px',
                color: 'var(--gray)',
                marginBottom: '10px'
              }}>
                请拼写这个单词
              </div>
              {/* 显示占位符 */}
              <div style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                {Array(currentWord.word.length).fill(0).map((_, index) => (
                  <div
                    key={index}
                    style={{
                      width: '40px',
                      height: '50px',
                      borderBottom: '3px solid var(--gray)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      fontWeight: '700',
                      color: userInput[index]
                        ? showResult === 'correct'
                          ? '#10b981'
                          : showResult === 'wrong'
                            ? '#ef4444'
                            : 'var(--dark)'
                        : 'var(--gray)'
                    }}
                  >
                    {userInput[index] || ''}
                  </div>
                ))}
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
          {isSubmitted && mode === 'exam' && (
            <button className="btn btn-primary" onClick={nextWord}>
              下一个单词 →
            </button>
          )}
          {!isSubmitted && mode === 'exam' && (
            <button
              className="btn btn-primary"
              onClick={submitAnswer}
              disabled={userInput.length === 0}
            >
              检查答案 (Enter)
            </button>
          )}
          {!isSubmitted && mode === 'exam' && (
            <button className="btn btn-danger" onClick={handleWrong}>
              显示答案
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
                    cursor: isSubmitted ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
                  }}
                  disabled={isSubmitted}
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
                cursor: isSubmitted ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
              }}
              disabled={isSubmitted}
            >
              ← Back
            </button>
            <button
              onClick={() => handleKeyPress('SPACE')}
              style={{
                width: '300px',
                height: '56px',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                background: '#e5e7eb',
                color: 'var(--dark)',
                cursor: isSubmitted ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
              }}
              disabled={isSubmitted}
            >
              Space
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}

export default Study
