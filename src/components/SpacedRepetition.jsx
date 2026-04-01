import React, { useState, useEffect, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'

// 遗忘曲线时间间隔（天）
const SPACED_REPETITION_INTERVALS = [1, 2, 4, 7, 15, 30]

function SpacedRepetition({
  mistakeBook,
  setMistakeBook,
  setCurrentPage,
  currentBook
}) {
  const [currentWord, setCurrentWord] = useState(null)
  const [userInput, setUserInput] = useState('')
  const [showResult, setShowResult] = useState(null)
  const [showHint, setShowHint] = useState(false)
  const [hasCheckedAnswer, setHasCheckedAnswer] = useState(false)
  const [todayReviewCount, setTodayReviewCount] = useState(0)
  const [reviewQueue, setReviewQueue] = useState([])
  const [reviewIndex, setReviewIndex] = useState(0)
  const [showWord, setShowWord] = useState(false)
  const [streak, setStreak] = useState(0)
  const [reviewStats, setReviewStats] = useState({ correct: 0, wrong: 0 })
  const [isFocused, setIsFocused] = useState(false)
  const [pressedKey, setPressedKey] = useState(null)
  const inputRef = useRef(null)

  // 获取今天需要复习的单词
  const getTodayReviewWords = useCallback(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return mistakeBook.filter(item => {
      const reviewDate = new Date(item.nextReviewDate)
      reviewDate.setHours(0, 0, 0, 0)
      return reviewDate <= today
    })
  }, [mistakeBook])

  // 初始化复习队列
  useEffect(() => {
    const todayWords = getTodayReviewWords()
    setReviewQueue(todayWords)
    setTodayReviewCount(todayWords.length)

    if (todayWords.length > 0) {
      setCurrentWord(todayWords[0])
    }
  }, [mistakeBook])

  // 自动聚焦到输入框
  useEffect(() => {
    if (inputRef.current && !hasCheckedAnswer && currentWord && !showWord) {
      inputRef.current.focus()
    }
  }, [hasCheckedAnswer, currentWord, showWord])

  // 更新复习进度
  const updateReviewProgress = (wordId, correct) => {
    const item = mistakeBook.find(m => m.id === wordId)
    if (!item) return

    if (correct) {
      // 答对，更新到下一个复习间隔
      const nextInterval = SPACED_REPETITION_INTERVALS[item.repetitionLevel] || 30
      const nextReviewDate = new Date()
      nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval)

      setMistakeBook(mistakeBook.map(m =>
        m.id === wordId
          ? {
              ...m,
              repetitionLevel: Math.min(item.repetitionLevel + 1, SPACED_REPETITION_INTERVALS.length - 1),
              nextReviewDate: nextReviewDate.toISOString(),
              lastReviewDate: new Date().toISOString()
            }
          : m
      ))

      toast.success(`下次复习: ${nextInterval}天后`)
    } else {
      // 答错，重置复习间隔
      const nextReviewDate = new Date()
      nextReviewDate.setDate(nextReviewDate.getDate() + 1)

      setMistakeBook(mistakeBook.map(m =>
        m.id === wordId
          ? {
              ...m,
              wrongCount: item.wrongCount + 1,
              repetitionLevel: 0,
              nextReviewDate: nextReviewDate.toISOString(),
              wrongDate: new Date().toISOString()
            }
          : m
      ))

      toast.error('已重置到第一天复习')
    }
  }

  // 提交答案
  const submitAnswer = useCallback(() => {
    if (!currentWord || userInput.length === 0) return

    setHasCheckedAnswer(true)
    const correct = userInput.toLowerCase() === currentWord.word.toLowerCase()

    // 更新统计信息
    if (correct) {
      setShowResult('correct')
      setStreak(prev => prev + 1)
      setReviewStats(prev => ({ ...prev, correct: prev.correct + 1 }))
      updateReviewProgress(currentWord.id, true)
    } else {
      setShowResult('wrong')
      setStreak(0)
      setReviewStats(prev => ({ ...prev, wrong: prev.wrong + 1 }))
      updateReviewProgress(currentWord.id, false)
    }
  }, [currentWord, userInput])

  // 处理输入变化
  const handleInputChange = (e) => {
    if (hasCheckedAnswer) return
    setUserInput(e.target.value)
  }

  // 虚拟键盘行
  const keyboardRows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ]

  // 虚拟键盘按键处理
  const handleVirtualKeyPress = (key) => {
    if (hasCheckedAnswer) return

    // 禁止空格输入（与Study考试模式一致）
    if (key === 'SPACE') return

    if (key === 'BACK') {
      setUserInput(prev => prev.slice(0, -1))
    } else if (key.length === 1) {
      setUserInput(prev => prev + key)
    }
  }

  // 获取按键颜色（与Study考试模式一致）
  const getKeyColor = (key) => {
    const lowerKey = key.toLowerCase()
    if (showResult === 'correct') return '#10b981'
    if (showResult === 'wrong') return '#ef4444'

    if (pressedKey === lowerKey) return 'var(--primary)'

    // 学习模式下的键盘提示（显示下一个预期字母）
    const targetIndex = userInput.length
    if (targetIndex < currentWord?.word.length) {
      return currentWord.word[targetIndex].toLowerCase() === lowerKey ? 'var(--primary)' : '#e5e7eb'
    }

    return '#e5e7eb'
  }

  // 处理回车键提交
  const handleEnterKeyPress = (e) => {
    if (e.key === 'Enter' && !hasCheckedAnswer) {
      submitAnswer()
    }
  }

  // 重新拼写
  const retryWord = () => {
    setUserInput('')
    setShowResult(null)
    setShowHint(false)
    setHasCheckedAnswer(false)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // 下一个单词
  const nextWord = useCallback(() => {
    setUserInput('')
    setShowResult(null)
    setShowHint(false)
    setHasCheckedAnswer(false)
    setShowWord(false)

    const newIndex = reviewIndex + 1
    if (newIndex < reviewQueue.length) {
      setReviewIndex(newIndex)
      setCurrentWord(reviewQueue[newIndex])
    } else {
      // 复习完成
      setCurrentWord(null)
      toast.success('今日复习完成！🎉')
    }
  }, [reviewIndex, reviewQueue])

  // 跳过当前单词
  const skipWord = () => {
    setUserInput('')
    setShowResult(null)
    setShowHint(false)
    setHasCheckedAnswer(false)

    // 将当前单词移到队列末尾
    const skippedWord = currentWord
    const newQueue = [...reviewQueue]
    newQueue.splice(reviewIndex, 1)
    newQueue.push(skippedWord)

    setReviewQueue(newQueue)
    setReviewIndex(0)
    setCurrentWord(newQueue[0])
    toast.info('已跳过，稍后复习')
  }

  // 标记为已掌握
  const markAsMastered = () => {
    if (confirm(`确定"${currentWord.word}"已掌握吗？将从错词本移除。`)) {
      setMistakeBook(mistakeBook.filter(m => m.id !== currentWord.id))
      nextWord()
      toast.success('单词已移除')
    }
  }

  

  // 物理键盘处理（与Study考试模式一致）
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase()

      // 设置按下的键用于视觉反馈
      setPressedKey(key)
      setTimeout(() => setPressedKey(null), 150)

      if (hasCheckedAnswer) {
        // 检查答案后，空格键用于下一步操作
        if (key === ' ') {
          e.preventDefault()
          if (showResult === 'correct') {
            nextWord()
          } else if (showResult === 'wrong') {
            retryWord()
          }
        }
        return
      }

      // 禁止物理键盘空格
      if (key === ' ') {
        e.preventDefault()
        return
      }

      // 处理其他按键
      if (key === 'backspace') {
        e.preventDefault()
        setUserInput(prev => prev.slice(0, -1))
      } else if (key === 'enter') {
        e.preventDefault()
        submitAnswer()
      } else if (key.length === 1 && /[a-z]/.test(key)) {
        setUserInput(prev => prev + key)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hasCheckedAnswer, showResult, submitAnswer, nextWord, retryWord])

  const getProgressPercent = () => {
    if (reviewQueue.length === 0) return 0
    return Math.round(((reviewIndex) / reviewQueue.length) * 100)
  }

  const getIntervalName = (level) => {
    if (level >= SPACED_REPETITION_INTERVALS.length) return '已掌握'
    return `${SPACED_REPETITION_INTERVALS[level]}天后`
  }

  if (!currentWord && reviewQueue.length === 0) {
    return (
      <div className="container fade-in">
        <nav className="navbar">
          <div className="navbar-brand">
            <span>🧠 遗忘曲线复习</span>
          </div>
          <div className="navbar-nav">
            <button className="nav-link" onClick={() => setCurrentPage('home')}>
              返回首页
            </button>
          </div>
        </nav>

        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>🎉</div>
          <h2 style={{ fontSize: '28px', marginBottom: '16px', color: 'var(--dark)' }}>
            今日复习已完成
          </h2>
          <p style={{ color: 'var(--gray)', marginBottom: '30px' }}>
            根据遗忘曲线，明天将会提醒您复习
          </p>

          <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              marginBottom: '20px',
              color: 'var(--dark)'
            }}>
              复习进度统计
            </h3>
            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              textAlign: 'center'
            }}>
              <div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '800',
                  color: 'var(--primary)'
                }}>
                  {mistakeBook.length}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--gray)' }}>
                  总错词数
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '800',
                  color: 'var(--success)'
                }}>
                  {mistakeBook.filter(m => m.repetitionLevel >= SPACED_REPETITION_INTERVALS.length - 1).length}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--gray)' }}>
                  已掌握
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '800',
                  color: 'var(--danger)'
                }}>
                  {mistakeBook.filter(m => new Date(m.nextReviewDate) <= new Date()).length}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--gray)' }}>
                  待复习
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <button className="btn btn-primary" onClick={() => setCurrentPage('mistake')}>
              查看错词本
            </button>
          </div>
        </div>

        {/* 虚拟键盘 */}
        <div className="card" style={{
          maxWidth: '700px',
          margin: '20px auto 0',
          padding: '20px'
        }}>
          <h3 style={{
            textAlign: 'center',
            marginBottom: '15px',
            color: 'var(--dark)',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            虚拟键盘
          </h3>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            alignItems: 'center'
          }}>
            {keyboardRows.map((row, rowIndex) => (
              <div key={rowIndex} style={{ display: 'flex', gap: '4px' }}>
                {row.map((key) => (
                  <button
                    key={key}
                    onClick={() => handleVirtualKeyPress(key)}
                    style={{
                      width: '40px',
                      height: '48px',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '18px',
                      fontWeight: '600',
                      background: getKeyColor(key),
                      color: getKeyColor(key) === '#e5e7eb' ? 'var(--dark)' : 'white',
                      cursor: hasCheckedAnswer ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 3px 8px rgba(0, 0, 0, 0.1)'
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

            <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
              <button
                onClick={() => handleVirtualKeyPress('BACK')}
                style={{
                  width: '90px',
                  height: '48px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  background: '#e5e7eb',
                  color: 'var(--dark)',
                  cursor: hasCheckedAnswer ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 3px 8px rgba(0, 0, 0, 0.1)'
                }}
                disabled={hasCheckedAnswer}
              >
                ← Back
              </button>
              <button
                style={{
                  width: '250px',
                  height: '48px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
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
      </div>
    )
  }

  return (
    <div className="container fade-in">
      <nav className="navbar">
        <div className="navbar-brand">
          <span>🧠 遗忘曲线复习</span>
        </div>
        <div className="navbar-nav">
          <button className="nav-link" onClick={() => setCurrentPage('home')}>
            返回首页
          </button>
        </div>
      </nav>

      {/* 统计信息 */}
      <div style={{
        display: 'flex',
        gap: '6px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '8px',
        flexShrink: 0
      }}>
        <span style={{
          display: 'inline-block',
          padding: '4px 10px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          连续正确: {streak}
        </span>
        <span style={{
          display: 'inline-block',
          padding: '4px 10px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          正确率: {reviewStats.correct + reviewStats.wrong > 0
            ? Math.round((reviewStats.correct / (reviewStats.correct + reviewStats.wrong)) * 100)
            : 0}%
        </span>
      </div>

      <div className="card" style={{
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        {/* 进度条 */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
            fontSize: '14px',
            color: 'var(--gray)'
          }}>
            <span>进度: {reviewIndex + 1} / {reviewQueue.length}</span>
            <span>{getProgressPercent()}%</span>
          </div>
          <div style={{
            height: '8px',
            background: '#e5e7eb',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
              width: `${getProgressPercent()}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* 复习信息 */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          marginBottom: '30px',
          flexWrap: 'wrap'
        }}>
          <span style={{
            padding: '6px 16px',
            background: 'rgba(99, 102, 241, 0.1)',
            color: 'var(--primary)',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            今日待复习: {todayReviewCount}
          </span>
          <span style={{
            padding: '6px 16px',
            background: 'rgba(16, 185, 129, 0.1)',
            color: '#10b981',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            当前级别: {getIntervalName(currentWord?.repetitionLevel || 0)}
          </span>
          <span style={{
            padding: '6px 16px',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            错误次数: {currentWord?.wrongCount || 0}
          </span>
        </div>

        {/* 提示信息 */}
        {showHint && !hasCheckedAnswer && (
          <div style={{
            padding: '6px 10px',
            background: 'rgba(99, 102, 241, 0.1)',
            borderRadius: '6px',
            marginBottom: '8px'
          }}>
            <p style={{ color: 'var(--primary)', fontWeight: '500', marginBottom: '2px', fontSize: '11px' }}>
              单词长度: {currentWord.word.length} 个字母
            </p>
            <p style={{ color: 'var(--gray)', fontSize: '10px', fontStyle: 'italic' }}>
              例句: "{currentWord.example}"
            </p>
          </div>
        )}

        {/* 单词释义 */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          {showWord ? (
            <>
              <div style={{
                fontSize: '24px',
                color: 'var(--dark)',
                fontWeight: '800',
                marginBottom: '3px',
                lineHeight: '1.3'
              }}>
                {currentWord.word}
              </div>
              {currentWord.phonetic && (
                <div style={{
                  fontSize: '11px',
                  color: 'var(--gray)',
                  fontFamily: 'Arial, sans-serif',
                  marginBottom: '2px'
                }}>
                  📢 {currentWord.phonetic}
                </div>
              )}
              <div style={{
                fontSize: '10px',
                color: 'var(--primary)',
                marginBottom: '6px',
                fontWeight: '600'
              }}>
                释义: {currentWord.meaning}
              </div>
            </>
          ) : (
            <>
              <div style={{
                fontSize: '15px',
                color: 'var(--primary)',
                fontWeight: '600',
                marginBottom: '3px',
                lineHeight: '1.3'
              }}>
                {currentWord.meaning}
              </div>
              {currentWord.phonetic && (
                <div style={{
                  fontSize: '11px',
                  color: 'var(--gray)',
                  fontFamily: 'Arial, sans-serif',
                  marginBottom: '2px'
                }}>
                  📢 {currentWord.phonetic}
                </div>
              )}
              <div style={{
                fontSize: '10px',
                color: 'var(--gray)',
                marginBottom: '6px'
              }}>
                请拼写这个单词
              </div>
            </>
          )}
        </div>

        {/* 输入框 */}
        <div style={{
          position: 'relative',
          marginBottom: '8px'
        }}>
          {/* 显示占位符 */}
          <div style={{
            display: 'flex',
            gap: '2px',
            justifyContent: 'center',
            marginBottom: '6px'
          }}>
            {currentWord.word.split('').map((char, index) => {
              // 如果是空格，显示空占位符（没有下划线）
              if (char === ' ') {
                return (
                  <div
                    key={index}
                    style={{
                      width: '10px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  />
                )
              }

              // 计算实际的用户输入索引（跳过空格）
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
                    width: '22px',
                    height: '28px',
                    borderBottom: `2px solid ${
                      userInput[inputIndex]
                        ? showResult === 'correct'
                          ? '#10b981'
                          : showResult === 'wrong'
                            ? userInput[inputIndex].toLowerCase() === currentWord.word[index].toLowerCase()
                              ? '#10b981'
                              : '#ef4444'
                            : 'var(--primary)'
                        : '#e5e7eb'
                    }`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: userInput[inputIndex]
                      ? showResult === 'correct'
                        ? '#10b981'
                        : showResult === 'wrong'
                          ? userInput[inputIndex].toLowerCase() === currentWord.word[index].toLowerCase()
                            ? '#10b981'
                            : '#ef4444'
                          : 'var(--dark)'
                      : 'var(--gray)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {userInput[inputIndex] || ''}
                </div>
              )
            })}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="输入单词..."
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            disabled={hasCheckedAnswer}
            style={{
              width: '100%',
              padding: '6px 10px',
              fontSize: '16px',
              fontWeight: '600',
              border: `2px solid ${
                showResult === 'correct' ? '#10b981' :
                showResult === 'wrong' ? '#ef4444' :
                isFocused ? 'var(--primary)' : '#e5e7eb'
              }`,
              borderRadius: '6px',
              outline: 'none',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              background: hasCheckedAnswer ? '#f9fafb' : 'white',
              color: showResult === 'correct' ? '#10b981' :
                     showResult === 'wrong' ? '#ef4444' :
                     'var(--dark)',
              letterSpacing: '2px',
              textTransform: 'lowercase'
            }}
          />
        </div>

        {/* 结果反馈 */}
        {showResult === 'correct' && (
          <div style={{
            padding: '6px 10px',
            background: 'rgba(16, 185, 129, 0.1)',
            borderRadius: '6px',
            marginBottom: '8px',
            animation: 'fade-in 0.3s ease'
          }}>
            <p style={{
              fontSize: '13px',
              color: '#10b981',
              fontWeight: '600',
              marginBottom: '2px',
              textAlign: 'center'
            }}>
              ✓ 回答正确！
            </p>
            <p style={{
              fontSize: '10px',
              color: 'var(--gray)',
              textAlign: 'center'
            }}>
              自动进入下一题...
            </p>
          </div>
        )}

        {showResult === 'wrong' && (
          <div style={{
            padding: '6px 10px',
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '6px',
            marginBottom: '8px',
            animation: 'fade-in 0.3s ease'
          }}>
            <p style={{
              fontSize: '13px',
              color: 'var(--danger)',
              fontWeight: '600',
              marginBottom: '3px',
              textAlign: 'center'
            }}>
              正确答案是: {currentWord.word}
            </p>
            {currentWord.phonetic && (
              <p style={{
                fontSize: '10px',
                color: 'var(--gray)',
                textAlign: 'center',
                marginBottom: '2px'
              }}>
                音标: {currentWord.phonetic}
              </p>
            )}
            <p style={{
              fontSize: '9px',
              color: 'var(--gray)',
              fontStyle: 'italic',
              textAlign: 'center'
            }}>
              "{currentWord.example}"
            </p>
          </div>
        )}

        {/* 操作按钮区域 */}
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          marginTop: 'auto'
        }}>
          {!hasCheckedAnswer && (
            <>
              <button
                className="btn btn-secondary"
                onClick={() => setShowHint(!showHint)}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                💡 {showHint ? '隐藏提示' : '显示提示'}
              </button>
              <button
                className="btn btn-primary"
                onClick={submitAnswer}
                disabled={userInput.length === 0}
                style={{
                  flex: 2,
                  padding: '7px 10px',
                  fontSize: '12px',
                  fontWeight: '600',
                  opacity: userInput.length === 0 ? 0.5 : 1
                }}
              >
                检查答案
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowWord(!showWord)}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                👁️ {showWord ? '隐藏单词' : '查看单词'}
              </button>
            </>
          )}
          {hasCheckedAnswer && showResult === 'wrong' && (
            <>
              <button
                className="btn btn-secondary"
                onClick={() => setShowHint(!showHint)}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                💡 {showHint ? '隐藏提示' : '显示提示'}
              </button>
              <button
                className="btn btn-primary"
                onClick={retryWord}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                重新拼写
              </button>
              <button
                className="btn btn-secondary"
                onClick={skipWord}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                跳过
              </button>
            </>
          )}
          {hasCheckedAnswer && showResult === 'correct' && (
            <>
              <button
                className="btn btn-secondary"
                onClick={nextWord}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                下一个单词
              </button>
              <button
                className="btn btn-success"
                onClick={markAsMastered}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                ✓ 已掌握
              </button>
            </>
          )}
        </div>

        {/* 虚拟键盘 */}
        <div className="card" style={{
          maxWidth: '700px',
          margin: '20px auto 0',
          padding: '20px'
        }}>
          <h3 style={{
            textAlign: 'center',
            marginBottom: '15px',
            color: 'var(--dark)',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            虚拟键盘
          </h3>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            alignItems: 'center'
          }}>
            {keyboardRows.map((row, rowIndex) => (
              <div key={rowIndex} style={{ display: 'flex', gap: '4px' }}>
                {row.map((key) => (
                  <button
                    key={key}
                    onClick={() => handleVirtualKeyPress(key)}
                    style={{
                      width: '40px',
                      height: '48px',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '18px',
                      fontWeight: '600',
                      background: getKeyColor(key),
                      color: getKeyColor(key) === '#e5e7eb' ? 'var(--dark)' : 'white',
                      cursor: hasCheckedAnswer ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 3px 8px rgba(0, 0, 0, 0.1)'
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

            <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
              <button
                onClick={() => handleVirtualKeyPress('BACK')}
                style={{
                  width: '90px',
                  height: '48px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  background: '#e5e7eb',
                  color: 'var(--dark)',
                  cursor: hasCheckedAnswer ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 3px 8px rgba(0, 0, 0, 0.1)'
                }}
                disabled={hasCheckedAnswer}
              >
                ← Back
              </button>
              <button
                style={{
                  width: '250px',
                  height: '48px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
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
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default SpacedRepetition
