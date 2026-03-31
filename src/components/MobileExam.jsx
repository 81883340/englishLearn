import React, { useState, useEffect, useCallback, useRef } from 'react'
import triggerConfetti from '../utils/confetti'
import toast from 'react-hot-toast'

function MobileExam({
  wordLibrary,
  learnedWords,
  setLearnedWords,
  updateProgress,
  progress,
  setCurrentPage,
  mistakeBook,
  setMistakeBook,
  currentBook,
  setPoints,
  dailyGoal,
  handleCompleteDailyGoal,
  libraryUnits,
  setCurrentUnitIndex,
  getCurrentUnitWords
}) {
  const [currentWord, setCurrentWord] = useState(null)
  const [userInput, setUserInput] = useState('')
  const [showResult, setShowResult] = useState(null) // 'correct' | 'wrong' | null
  const [showHint, setShowHint] = useState(false)
  const [hasCheckedAnswer, setHasCheckedAnswer] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [todayLearnedCount, setTodayLearnedCount] = useState(0)
  const [showUnitCompleteModal, setShowUnitCompleteModal] = useState(false)
  const inputRef = useRef(null)

  // 自动聚焦到输入框
  useEffect(() => {
    if (inputRef.current && !hasCheckedAnswer) {
      inputRef.current.focus()
    }
  }, [hasCheckedAnswer, currentWord])

  // 根据当前选定的词本筛选单词（使用词库单元）
  const getFilteredWordLibrary = useCallback(() => {
    // 先根据当前词本筛选单词
    let filteredByBook = wordLibrary
    if (currentBook !== '全部词本') {
      filteredByBook = wordLibrary.filter(w => w.bookName === currentBook)
    }

    // 如果有词库单元，获取当前单元的单词
    const unitWords = getCurrentUnitWords(currentBook)

    // 优先使用词库单元的单词，如果没有则使用筛选后的词库
    if (unitWords && unitWords.length > 0) {
      return unitWords
    }

    return filteredByBook
  }, [wordLibrary, currentBook, getCurrentUnitWords])

  const getRandomWord = useCallback((excludeId = null) => {
    const filteredLibrary = getFilteredWordLibrary()
    const unlearned = filteredLibrary.filter(w => !learnedWords.includes(w.id))
    let pool = unlearned.length > 0 ? unlearned : filteredLibrary

    if (excludeId && pool.length > 1) {
      pool = pool.filter(w => w.id !== excludeId)
    }

    if (pool.length === 0) return null
    const randomIndex = Math.floor(Math.random() * pool.length)
    return pool[randomIndex]
  }, [getFilteredWordLibrary, learnedWords])

  // 初始化第一个单词
  useEffect(() => {
    const word = getRandomWord()
    if (word) {
      setCurrentWord(word)
    }
  }, [])

  // 切换到下一个单词
  const nextWord = useCallback(() => {
    const newWord = getRandomWord(currentWord?.id)
    if (newWord) {
      setCurrentWord(newWord)
      setUserInput('')
      setShowResult(null)
      setShowHint(false)
      setHasCheckedAnswer(false)
    }
  }, [currentWord, getRandomWord])

  // 提交答案
  const submitAnswer = useCallback(() => {
    if (!currentWord || userInput.length === 0) return

    setHasCheckedAnswer(true)

    // 移除空格后进行比较
    const cleanInput = userInput.replace(/\s+/g, '')
    const cleanWord = currentWord.word.replace(/\s+/g, '')

    if (cleanInput.toLowerCase() === cleanWord.toLowerCase()) {
      // 答对
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

      // 增加积分
      setPoints(prev => prev + 2)

      // 增加今日学习计数
      const newTodayCount = todayLearnedCount + 1
      setTodayLearnedCount(newTodayCount)

      // 检查是否完成每日目标
      if (newTodayCount >= dailyGoal) {
        handleCompleteDailyGoal()
        setTimeout(() => {
          setShowUnitCompleteModal(true)
        }, 1500)
      } else {
        triggerConfetti()
      }

      // 加入错词本
      const existingMistake = mistakeBook.find(m => m.word === currentWord.word.toLowerCase())

      if (existingMistake) {
        // 已存在，更新错误次数和时间
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
        // 新增错词
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
        setMistakeBook([...mistakeBook, newMistake])
      }

      triggerConfetti()
      setTimeout(() => {
        nextWord()
      }, 1500)
    } else {
      // 答错
      setShowResult('wrong')
      updateProgress({
        wrongAnswers: progress.wrongAnswers + 1,
        streak: 0
      })

      // 自动加入错词本
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
        setMistakeBook([...mistakeBook, newMistake])
      }
    }
  }, [currentWord, userInput, progress, learnedWords, updateProgress, setLearnedWords, mistakeBook, setMistakeBook, setPoints, nextWord])

  // 处理输入变化
  const handleInputChange = (e) => {
    if (hasCheckedAnswer) return
    setUserInput(e.target.value)
  }

  // 处理键盘提交
  const handleKeyPress = (e) => {
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

  if (!currentWord) {
    const filteredLibrary = getFilteredWordLibrary()
    const libraryUnitsForBook = libraryUnits[currentBook] || []
    const unitWords = getCurrentUnitWords(currentBook)
    
    // 更精确的判断逻辑
    const hasUnits = libraryUnitsForBook.length > 0
    const hasUnitWords = unitWords && unitWords.length > 0
    const hasFilteredWords = filteredLibrary && filteredLibrary.length > 0
    
    // 调试信息（可选）
    console.log('Debug - MobileExam Component:', {
      currentBook,
      libraryUnitsForBookLength: libraryUnitsForBook.length,
      unitWordsLength: unitWords ? unitWords.length : 0,
      filteredLibraryLength: filteredLibrary ? filteredLibrary.length : 0,
      hasUnits,
      hasUnitWords,
      hasFilteredWords
    })

    let title = ''
    let message = ''
    let showSetGoalButton = false
    let showSelectBookButton = false
    let showAddWordsButton = false

    if (!hasFilteredWords) {
      title = '当前词本为空'
      message = currentBook !== '全部词本' ? `当前词本 "${currentBook}" 中没有单词，请先添加单词` : '词库中没有单词，请先添加单词'
      showAddWordsButton = true
    } else if (!hasUnits) {
      title = '请先设置学习目标'
      message = `当前词本 "${currentBook}" 还没有设置学习目标，请返回首页设置每日学习数量`
      showSetGoalButton = true
    } else if (!hasUnitWords) {
      title = '词库单元为空'
      message = `当前词本 "${currentBook}" 的词库单元为空，请检查学习目标设置或重新设置目标`
      showSetGoalButton = true
    } else {
      // 理论上不应该到这里，因为前面的条件都没满足的话应该能获取到单词
      title = '未知错误'
      message = '无法加载学习内容，请刷新页面重试'
      showSetGoalButton = true
    }

    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
            {title}
          </h2>
          <p style={{ color: 'var(--gray)', marginBottom: '20px' }}>
            {message}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '30px', flexWrap: 'wrap' }}>
            {showSetGoalButton && (
              <button className="btn btn-primary" onClick={() => setCurrentPage('home')}>
                🎯 返回首页设置目标
              </button>
            )}
            {showSelectBookButton && (
              <button className="btn btn-primary" onClick={() => setCurrentPage('library')}>
                去选择词本
              </button>
            )}
            {showAddWordsButton && (
              <button className="btn btn-primary" onClick={() => setCurrentPage('library')}>
                去添加单词
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '10px',
      maxWidth: '600px',
      margin: '0 auto',
      overflow: 'hidden'
    }}>
      {/* 顶部导航栏 */}
      <nav className="navbar" style={{
        marginBottom: '8px',
        padding: '8px 12px',
        flexShrink: 0
      }}>
        <div className="navbar-brand">
          <span>📱 移动考试</span>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => setCurrentPage('home')}
          style={{
            padding: '6px 12px',
            fontSize: '13px',
            fontWeight: '600',
            borderRadius: '8px'
          }}
        >
          返回
        </button>
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
          连续正确: {progress.streak}
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
          正确率: {progress.correctAnswers + progress.wrongAnswers > 0
            ? Math.round((progress.correctAnswers / (progress.correctAnswers + progress.wrongAnswers)) * 100)
            : 0}%
        </span>
      </div>

      {/* 主卡片 */}
      <div className="card" style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '12px',
        marginBottom: '8px'
      }}>
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

        {/* 操作按钮区域 - 移到白色背景框内，结果反馈下方 */}
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
                onClick={nextWord}
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
        </div>
      </div>

      {/* 单元完成弹窗 */}
      {showUnitCompleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '60px', marginBottom: '16px' }}>🎉</div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '12px',
              color: 'var(--dark)'
            }}>
              今日学习完成！
            </h3>
            <p style={{
              fontSize: '16px',
              color: 'var(--gray)',
              marginBottom: '24px'
            }}>
              恭喜你完成了 {dailyGoal} 个单词的学习
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowUnitCompleteModal(false)
                  setTodayLearnedCount(0)
                  // 重置当前单元
                  setUserInput('')
                  setShowResult(null)
                  setShowHint(false)
                  setHasCheckedAnswer(false)
                  const filteredLibrary = getFilteredWordLibrary()
                  if (filteredLibrary.length > 0) {
                    setCurrentWord(filteredLibrary[0])
                  }
                  if (inputRef.current) {
                    inputRef.current.focus()
                  }
                }}
              >
                🔄 重学当前单元
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowUnitCompleteModal(false)
                  setTodayLearnedCount(0)
                  // 进入下一个单元
                  setCurrentUnitIndex(prev => prev + 1)
                  setUserInput('')
                  setShowResult(null)
                  setShowHint(false)
                  setHasCheckedAnswer(false)
                  const nextUnitWords = getCurrentUnitWords(currentBook)
                  if (nextUnitWords.length > 0) {
                    setCurrentWord(nextUnitWords[0])
                  } else {
                    toast.success('所有单元已完成！')
                    setCurrentPage('home')
                  }
                  if (inputRef.current) {
                    inputRef.current.focus()
                  }
                }}
              >
                📖 学习新单元
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowUnitCompleteModal(false)
                  setCurrentPage('home')
                }}
              >
                🏠 返回首页
              </button>
            </div>
          </div>
        </div>
      )}

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

export default MobileExam
