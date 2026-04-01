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
  const [showResult, setShowResult] = useState(null) // 'correct' 或 'wrong'
  const [showHint, setShowHint] = useState(false)
  const [hasCheckedAnswer, setHasCheckedAnswer] = useState(false)
  const [todayReviewCount, setTodayReviewCount] = useState(0)
  const [reviewQueue, setReviewQueue] = useState([])
  const [reviewIndex, setReviewIndex] = useState(0) // 已完成的单词数量
  const [showWord, setShowWord] = useState(false)
  const isMounted = useRef(true)

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

  // 初始化复习队列（仅在组件挂载时执行一次）
  useEffect(() => {
    isMounted.current = true
    const todayWords = getTodayReviewWords()
    setReviewQueue(todayWords)
    setTodayReviewCount(todayWords.length)

    if (todayWords.length > 0) {
      setCurrentWord(todayWords[0])
      setReviewIndex(0)
    }

    return () => {
      isMounted.current = false
    }
  }, []) // 空依赖，只执行一次

  // 更新全局错词本（函数式更新确保最新状态）
  const updateGlobalMistakeBook = useCallback((wordId, updateFn) => {
    setMistakeBook(prevBook => {
      const item = prevBook.find(m => m.id === wordId)
      if (!item) return prevBook
      return prevBook.map(m => m.id === wordId ? updateFn(m) : m)
    })
  }, [setMistakeBook])

  // 提交答案后的处理（正确/错误）
  const processAnswer = useCallback((correct) => {
    if (!currentWord) return

    // 更新全局错词本
    updateGlobalMistakeBook(currentWord.id, (item) => {
      if (correct) {
        // 答对，更新到下一个复习间隔
        const nextLevel = Math.min(item.repetitionLevel + 1, SPACED_REPETITION_INTERVALS.length - 1)
        const nextInterval = SPACED_REPETITION_INTERVALS[nextLevel] || 30
        const nextReviewDate = new Date()
        nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval)

        toast.success(`下次复习: ${nextInterval}天后`)
        return {
          ...item,
          repetitionLevel: nextLevel,
          nextReviewDate: nextReviewDate.toISOString(),
          lastReviewDate: new Date().toISOString()
        }
      } else {
        // 答错，重置复习间隔
        const nextReviewDate = new Date()
        nextReviewDate.setDate(nextReviewDate.getDate() + 1)

        toast.error('已重置到第一天复习')
        return {
          ...item,
          wrongCount: item.wrongCount + 1,
          repetitionLevel: 0,
          nextReviewDate: nextReviewDate.toISOString(),
          wrongDate: new Date().toISOString()
        }
      }
    })

    // 从当前复习队列中移除该单词（无论对错，本次复习结束）
    setReviewQueue(prevQueue => prevQueue.filter((_, idx) => idx !== reviewIndex))
    // 更新已复习数量
    setReviewIndex(prev => prev + 1)
  }, [currentWord, reviewIndex, updateGlobalMistakeBook])

  // 提交答案
  const submitAnswer = () => {
    if (!currentWord || userInput.length === 0 || hasCheckedAnswer) return

    setHasCheckedAnswer(true)
    const correct = userInput.toLowerCase() === currentWord.word.toLowerCase()
    setShowResult(correct ? 'correct' : 'wrong')
    processAnswer(correct)
  }

  // 移动到下一个单词
  const nextWord = useCallback(() => {
    // 重置输入和状态
    setUserInput('')
    setShowResult(null)
    setShowHint(false)
    setHasCheckedAnswer(false)
    setShowWord(false)

    // 获取更新后的队列（依赖 reviewQueue 状态）
    setReviewQueue(prevQueue => {
      const newIndex = reviewIndex // 注意：此时 reviewIndex 已经 +1
      if (newIndex < prevQueue.length) {
        setCurrentWord(prevQueue[newIndex])
        return prevQueue
      } else {
        // 复习完成
        setCurrentWord(null)
        return prevQueue
      }
    })
  }, [reviewIndex])

  // 当队列变化且当前单词为空但队列非空时，自动设置当前单词
  useEffect(() => {
    if (!currentWord && reviewQueue.length > 0 && reviewIndex < reviewQueue.length) {
      setCurrentWord(reviewQueue[reviewIndex])
    }
  }, [currentWord, reviewQueue, reviewIndex])

  // 跳过当前单词（移到队列末尾）
  const skipWord = () => {
    if (!currentWord || hasCheckedAnswer) return

    if (reviewQueue.length === 1) {
      toast('只有一个待复习单词，无法跳过', { icon: '⚠️' })
      return
    }

    setReviewQueue(prevQueue => {
      const newQueue = [...prevQueue]
      const skipped = newQueue.splice(reviewIndex, 1)[0]
      newQueue.push(skipped)
      // 保持当前索引不变，因为移除了一个元素，新队列中当前索引位置是下一个单词
      setCurrentWord(newQueue[reviewIndex])
      return newQueue
    })
    toast.info('已跳过，稍后复习')

    // 重置输入状态
    setUserInput('')
    setShowResult(null)
    setShowHint(false)
    setHasCheckedAnswer(false)
    setShowWord(false)
  }

  // 标记为已掌握
  const markAsMastered = () => {
    if (!currentWord) return
    if (window.confirm(`确定"${currentWord.word}"已掌握吗？将从错词本移除。`)) {
      // 从全局错词本移除
      setMistakeBook(prevBook => prevBook.filter(m => m.id !== currentWord.id))
      // 从复习队列中移除
      setReviewQueue(prevQueue => prevQueue.filter((_, idx) => idx !== reviewIndex))
      setReviewIndex(prev => prev + 1)
      toast.success('单词已移除')
      nextWord()
    }
  }

  // 虚拟键盘处理
  const keyboardRows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ]

  const handleKeyPress = (key) => {
    if (hasCheckedAnswer) return

    if (key === 'BACK') {
      setUserInput(prev => prev.slice(0, -1))
    } else if (key === 'SPACE') {
      setUserInput(prev => prev + ' ')
    } else if (key.length === 1) {
      setUserInput(prev => prev + key)
    }
  }

  // 物理键盘处理
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase()

      if (hasCheckedAnswer) {
        if (key === ' ') {
          e.preventDefault()
          if (reviewQueue.length > 0 && reviewIndex < reviewQueue.length) {
            nextWord()
          }
        }
        return
      }

      if (key === 'backspace') {
        e.preventDefault()
        handleKeyPress('BACK')
      } else if (key === ' ') {
        e.preventDefault()
        handleKeyPress('SPACE')
      } else if (key === 'enter') {
        e.preventDefault()
        submitAnswer()
      } else if (key.length === 1 && /[a-z]/.test(key)) {
        handleKeyPress(key)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hasCheckedAnswer, userInput, reviewQueue, reviewIndex, nextWord, submitAnswer])

  // 进度百分比（已完成的单词数 / 总单词数）
  const getProgressPercent = () => {
    if (reviewQueue.length === 0) return 0
    return Math.round((reviewIndex / reviewQueue.length) * 100)
  }

  const getIntervalName = (level) => {
    if (level >= SPACED_REPETITION_INTERVALS.length) return '已掌握'
    return `${SPACED_REPETITION_INTERVALS[level]}天后`
  }

  // 无复习单词界面
  if (reviewQueue.length === 0 || !currentWord) {
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
            {reviewQueue.length === 0 && reviewIndex === 0 ? '今日无需复习' : '今日复习已完成'}
          </h2>
          <p style={{ color: 'var(--gray)', marginBottom: '30px' }}>
            {reviewQueue.length === 0 && reviewIndex === 0
              ? '根据遗忘曲线，今天没有需要复习的单词'
              : '根据遗忘曲线，明天将会提醒您复习'}
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
            <span>已复习: {reviewIndex} / {reviewQueue.length}</span>
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

        {/* 单词展示区域 */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ marginBottom: '24px' }}>
            {showWord || hasCheckedAnswer ? (
              <>
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
              </>
            ) : (
              <>
                <h1 style={{
                  fontSize: '24px',
                  color: 'var(--primary)',
                  fontWeight: '600',
                  marginBottom: '16px'
                }}>
                  {currentWord.meaning}
                </h1>
                {currentWord.phonetic && (
                  <p style={{
                    fontSize: '18px',
                    color: 'var(--gray)',
                    fontFamily: 'Arial, sans-serif',
                    marginBottom: '20px'
                  }}>
                    📢 {currentWord.phonetic}
                  </p>
                )}
                <p style={{ fontSize: '14px', color: 'var(--gray)', marginBottom: '20px' }}>
                  请拼写这个单词
                </p>

                {/* 占位符 */}
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

          {(showWord || hasCheckedAnswer) && (
            <>
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
          )}
        </div>

        {/* 错误时显示正确答案 */}
        {showResult === 'wrong' && hasCheckedAnswer && (
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

        {/* 操作按钮 */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          marginBottom: '40px',
          flexWrap: 'wrap'
        }}>
          {!hasCheckedAnswer && !showWord && (
            <button
              className="btn btn-secondary"
              onClick={() => setShowHint(!showHint)}
            >
              💡 {showHint ? '隐藏提示' : '显示提示'}
            </button>
          )}

          {!showWord && (
            <button
              className="btn btn-secondary"
              onClick={() => setShowWord(!showWord)}
            >
              👁️ {showWord ? '隐藏单词' : '查看单词'}
            </button>
          )}

          {!hasCheckedAnswer && (
            <button
              className="btn btn-danger"
              onClick={skipWord}
            >
              跳过 →
            </button>
          )}

          {!hasCheckedAnswer && !showWord && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={submitAnswer}
              disabled={userInput.length === 0}
            >
              检查答案 (Enter)
            </button>
          )}

          {hasCheckedAnswer && (
            <button className="btn btn-primary" onClick={nextWord}>
              下一个单词 (Space)
            </button>
          )}

          {hasCheckedAnswer && (
            <button className="btn btn-success" onClick={markAsMastered}>
              ✓ 已掌握
            </button>
          )}
        </div>

        {showHint && !hasCheckedAnswer && (
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

      {/* 虚拟键盘 */}
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
                    background: '#e5e7eb',
                    color: 'var(--dark)',
                    cursor: hasCheckedAnswer ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
                  }}
                  disabled={hasCheckedAnswer}
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
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
              }}
              disabled={hasCheckedAnswer}
            >
              Space
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpacedRepetition