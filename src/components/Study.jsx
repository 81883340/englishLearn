import React, { useState, useEffect, useCallback, useRef } from 'react'
import triggerConfetti from '../utils/confetti'
import toast from 'react-hot-toast'

function Study({ wordLibrary, learnedWords, setLearnedWords, updateProgress, progress, setCurrentPage, mistakeBook, setMistakeBook, currentBook, dailyGoal, handleCompleteDailyGoal }) {
  const [mode, setMode] = useState('learn') // 'learn' | 'exam'
  const [currentWord, setCurrentWord] = useState(null)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [showResult, setShowResult] = useState(null) // 'correct' | 'wrong' | null
  const [showHint, setShowHint] = useState(false)
  const [pressedKey, setPressedKey] = useState(null)
  const [hasCheckedAnswer, setHasCheckedAnswer] = useState(false)
  const [todayLearnedCount, setTodayLearnedCount] = useState(0)
  
  // 根据当前词本过滤单词
  const filteredWordLibrary = currentBook === '全部词本'
    ? wordLibrary
    : wordLibrary.filter(w => w.bookName === currentBook)

  // 计算今日应该学习的单词范围（按每日目标分割词本）
  const getTodayWordRange = () => {
    if (currentBook === '全部词本') {
      return { start: 0, end: filteredWordLibrary.length }
    }

    // 使用词本名哈希作为种子，确保每个词本的学习进度独立
    const bookHash = currentBook.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const startDate = new Date('2024-01-01') // 假设2024-01-01为开始日期
    const daysSinceStart = Math.floor((new Date() - startDate) / (1000 * 60 * 60 * 24))

    const dayIndex = daysSinceStart % Math.ceil(filteredWordLibrary.length / dailyGoal)
    const start = dayIndex * dailyGoal
    const end = Math.min(start + dailyGoal, filteredWordLibrary.length)

    return { start, end }
  }

  // 今日应学习的单词
  const wordRange = getTodayWordRange()
  const todayWords = filteredWordLibrary.slice(wordRange.start, wordRange.end)

  // 使用 ref 来避免闭包问题
  const hasCheckedAnswerRef = useRef(hasCheckedAnswer)
  useEffect(() => {
    hasCheckedAnswerRef.current = hasCheckedAnswer
  }, [hasCheckedAnswer])

  const getRandomWord = useCallback((excludeId = null) => {
    const unlearned = filteredWordLibrary.filter(w => !learnedWords.includes(w.id))
    let pool = unlearned.length > 0 ? unlearned : filteredWordLibrary

    if (excludeId && pool.length > 1) {
      pool = pool.filter(w => w.id !== excludeId)
    }

    const randomIndex = Math.floor(Math.random() * pool.length)
    return pool[randomIndex]
  }, [filteredWordLibrary, learnedWords])

  // 初始化单词
  useEffect(() => {
    if (todayWords.length > 0) {
      if (mode === 'learn') {
        // 从今日应学习单词的第一个开始
        setCurrentWordIndex(0)
        setCurrentWord(todayWords[0])
        setTodayLearnedCount(0)
      } else {
        setCurrentWord(getRandomWord())
      }
    }
  }, [mode, todayWords, currentBook, dailyGoal])

  // 重置到新单词（用于考试模式）
  const resetToNextWord = useCallback(() => {
    const newWord = getRandomWord(currentWord?.id)
    setCurrentWord(newWord)
    setUserInput('')
    setShowResult(null)
    setShowHint(false)
    setHasCheckedAnswer(false)
  }, [currentWord, getRandomWord])

  // 虚拟键盘按键处理（未提交状态）
  const handleKeyPress = useCallback((key) => {
    if (hasCheckedAnswerRef.current) return

    if (key === 'BACK') {
      setUserInput(prev => prev.slice(0, -1))
    } else if (key === 'SPACE') {
      setUserInput(prev => prev + ' ')
    } else if (key.length === 1) {
      setUserInput(prev => prev + key)
    }
  }, [])

  // 提交答案
  const submitAnswer = useCallback(() => {
    if (!currentWord || userInput.length === 0) return

    setHasCheckedAnswer(true)

    if (userInput.toLowerCase() === currentWord.word.toLowerCase()) {
      // 答对
      setShowResult('correct')
      const newStreak = progress.streak + 1
      const newCorrect = progress.correctAnswers + 1
      const newTodayCount = todayLearnedCount + 1

      updateProgress({
        totalLearned: progress.totalLearned + 1,
        correctAnswers: newCorrect,
        streak: newStreak
      })

      if (!learnedWords.includes(currentWord.id)) {
        setLearnedWords([...learnedWords, currentWord.id])
      }

      setTodayLearnedCount(newTodayCount)

      // 检查是否完成每日目标
      if (mode === 'learn' && newTodayCount >= dailyGoal) {
        if (newTodayCount === dailyGoal) {
          // 刚好完成目标
          handleCompleteDailyGoal()
          toast.success('🎉 恭喜完成今日学习目标！')
        }
      }

      triggerConfetti()
    } else {
      // 答错 - 自动加入单词本
      setShowResult('wrong')
      updateProgress({
        wrongAnswers: progress.wrongAnswers + 1,
        streak: 0
      })

      // 自动加入单词本
      const existingMistake = mistakeBook.find(m => m.word === currentWord.word)
      if (existingMistake) {
        // 更新已有错词
        setMistakeBook(mistakeBook.map(m =>
          m.word === currentWord.word
            ? {
                ...m,
                wrongCount: m.wrongCount + 1,
                wrongDate: new Date().toISOString()
              }
            : m
        ))
      } else {
        // 添加新错词
        const nextReviewDate = new Date()
        nextReviewDate.setDate(nextReviewDate.getDate() + 1)

        setMistakeBook([...mistakeBook, {
          id: Date.now(),
          word: currentWord.word,
          meaning: currentWord.meaning,
          example: currentWord.example,
          phonetic: currentWord.phonetic || '',
          wrongCount: 1,
          wrongDate: new Date().toISOString(),
          nextReviewDate: nextReviewDate.toISOString(),
          repetitionLevel: 0
        }])
      }
    }
  }, [currentWord, userInput, progress, learnedWords, updateProgress, setLearnedWords, mistakeBook, setMistakeBook, mode, todayLearnedCount, dailyGoal, handleCompleteDailyGoal])

  // 物理键盘处理 - 使用 useCallback 避免频繁重建
  const handlePhysicalKeyboard = useCallback((e) => {
    const key = e.key.toLowerCase()

    // 按键高亮效果
    setPressedKey(key)
    setTimeout(() => setPressedKey(null), 150)

    const checked = hasCheckedAnswerRef.current

    // 考试模式 - 已检查答案状态
    if (mode === 'exam' && checked) {
      // 按空格键切换到下一个单词
      if (key === ' ') {
        resetToNextWord()
      }
      return
    }

    // 学习模式
    if (mode === 'learn') {
      if (!e.ctrlKey && !e.altKey && !e.metaKey &&
          key !== 'control' && key !== 'alt' && key !== 'meta' &&
          key !== 'backspace' && key !== 'tab' && key !== 'escape') {
        if (currentWordIndex < todayWords.length - 1) {
          // 还有今日的单词，继续学习
          const newIndex = currentWordIndex + 1
          setCurrentWordIndex(newIndex)
          setCurrentWord(todayWords[newIndex])
          setTodayLearnedCount(newIndex + 1)
        } else {
          // 今日单词学完了
          if (confirm(`恭喜！今日目标已完成！\n已学习 ${todayWords.length} 个单词\n是否继续学习？`)) {
            const globalIndex = (filteredWordLibrary.findIndex(w => w.id === currentWord.id) + 1) % filteredWordLibrary.length
            setCurrentWordIndex(globalIndex)
            setCurrentWord(filteredWordLibrary[globalIndex])
          }
        }
        setUserInput('')
        setShowResult(null)
        setShowHint(false)
        setHasCheckedAnswer(false)
        return
      }
    }

    // 考试模式 - 未检查答案状态
    if (mode === 'exam' && !checked) {
      if (key === 'backspace') {
        handleKeyPress('BACK')
      } else if (key === ' ') {
        e.preventDefault()
        handleKeyPress('SPACE')
      } else if (key === 'enter') {
        // 回车键提交答案
        e.preventDefault()
        submitAnswer()
      } else if (key.length === 1 && /[a-z]/.test(key)) {
        handleKeyPress(key)
      }
    }
  }, [mode, currentWordIndex, filteredWordLibrary, handleKeyPress, resetToNextWord, submitAnswer, currentBook])

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
    setHasCheckedAnswer(false)
    if (mode === 'exam') {
      // 从考试切换到学习，重置到第一个单词
      setCurrentWordIndex(0)
      setCurrentWord(wordLibrary[0])
    } else {
      // 从学习切换到考试，选择随机单词
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
  }, [updateProgress])

  const nextWord = () => {
    setUserInput('')
    setShowResult(null)
    setShowHint(false)
    setHasCheckedAnswer(false)

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
    setHasCheckedAnswer(false)

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

  if (!currentWord || filteredWordLibrary.length === 0) {
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
          <span>📚 {mode === 'learn' ? '学习模式' : '考试模式'} - {currentBook === '全部词本' ? '全部' : currentBook}</span>
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
            // 学习模式：显示单词、音标、释义、例句
            <>
              <div style={{ marginBottom: '24px' }}>
                <h1 style={{
                  fontSize: '56px',
                  fontWeight: '800',
                  color: 'var(--dark)',
                  marginBottom: '12px',
                  lineHeight: '1.2'
                }}>
                  {currentWord.word}
                </h1>
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
            // 考试模式：只显示释义、音标，隐藏单词和例句
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
          {mode === 'exam' && hasCheckedAnswer && (
            <button className="btn btn-primary" onClick={nextWord}>
              下一个单词 (Space)
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
                cursor: hasCheckedAnswer ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
              }}
              disabled={hasCheckedAnswer}
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
