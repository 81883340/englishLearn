import React, { useState, useEffect, useCallback, useRef } from 'react'
import triggerConfetti from '../utils/confetti'

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
  handleCompleteDailyGoal
}) {
  const [currentWord, setCurrentWord] = useState(null)
  const [userInput, setUserInput] = useState('')
  const [showResult, setShowResult] = useState(null) // 'correct' | 'wrong' | null
  const [showHint, setShowHint] = useState(false)
  const [hasCheckedAnswer, setHasCheckedAnswer] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef(null)

  // 自动聚焦到输入框
  useEffect(() => {
    if (inputRef.current && !hasCheckedAnswer) {
      inputRef.current.focus()
    }
  }, [hasCheckedAnswer, currentWord])

  // 根据当前选定的词本筛选单词
  const getFilteredWordLibrary = useCallback(() => {
    if (currentBook === '全部词本') {
      return wordLibrary
    }
    return wordLibrary.filter(w => w.bookName === currentBook)
  }, [wordLibrary, currentBook])

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

    if (userInput.toLowerCase() === currentWord.word.toLowerCase()) {
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

      // 检查是否完成每日目标
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
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
            词库为空
          </h2>
          <p style={{ color: 'var(--gray)', marginBottom: '20px' }}>
            请先添加单词到词库
          </p>
          <button
            className="btn btn-primary"
            onClick={() => setCurrentPage('library')}
          >
            去添加单词
          </button>
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
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '12px',
        marginBottom: '8px'
      }}>
        {/* 提示信息 */}
        {showHint && !hasCheckedAnswer && (
          <div style={{
            padding: '8px 10px',
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
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <div style={{
            fontSize: '16px',
            color: 'var(--primary)',
            fontWeight: '600',
            marginBottom: '4px',
            lineHeight: '1.3'
          }}>
            {currentWord.meaning}
          </div>
          {currentWord.phonetic && (
            <div style={{
              fontSize: '12px',
              color: 'var(--gray)',
              fontFamily: 'Arial, sans-serif',
              marginBottom: '3px'
            }}>
              📢 {currentWord.phonetic}
            </div>
          )}
          <div style={{
            fontSize: '11px',
            color: 'var(--gray)',
            marginBottom: '8px'
          }}>
            请拼写这个单词
          </div>
        </div>

        {/* 输入框 */}
        <div style={{
          position: 'relative',
          marginBottom: '10px'
        }}>
          {/* 显示占位符 */}
          <div style={{
            display: 'flex',
            gap: '3px',
            justifyContent: 'center',
            marginBottom: '8px'
          }}>
            {Array(currentWord.word.length).fill(0).map((_, index) => (
              <div
                key={index}
                style={{
                  width: '24px',
                  height: '32px',
                  borderBottom: `2px solid ${
                    userInput[index]
                      ? showResult === 'correct'
                        ? '#10b981'
                        : showResult === 'wrong'
                          ? userInput[index].toLowerCase() === currentWord.word[index].toLowerCase()
                            ? '#10b981'
                            : '#ef4444'
                          : 'var(--primary)'
                      : '#e5e7eb'
                  }`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: userInput[index]
                    ? showResult === 'correct'
                      ? '#10b981'
                      : showResult === 'wrong'
                        ? userInput[index].toLowerCase() === currentWord.word[index].toLowerCase()
                          ? '#10b981'
                          : '#ef4444'
                        : 'var(--dark)'
                    : 'var(--gray)',
                  transition: 'all 0.2s ease'
                }}
              >
                {userInput[index] || ''}
              </div>
            ))}
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
              padding: '8px 12px',
              fontSize: '18px',
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
            padding: '8px 12px',
            background: 'rgba(16, 185, 129, 0.1)',
            borderRadius: '6px',
            marginBottom: '10px',
            animation: 'fade-in 0.3s ease'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#10b981',
              fontWeight: '600',
              marginBottom: '3px',
              textAlign: 'center'
            }}>
              ✓ 回答正确！
            </p>
            <p style={{
              fontSize: '11px',
              color: 'var(--gray)',
              textAlign: 'center'
            }}>
              自动进入下一题...
            </p>
          </div>
        )}

        {showResult === 'wrong' && (
          <div style={{
            padding: '8px 12px',
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '6px',
            marginBottom: '10px',
            animation: 'fade-in 0.3s ease'
          }}>
            <p style={{
              fontSize: '14px',
              color: 'var(--danger)',
              fontWeight: '600',
              marginBottom: '4px',
              textAlign: 'center'
            }}>
              正确答案是: {currentWord.word}
            </p>
            {currentWord.phonetic && (
              <p style={{
                fontSize: '11px',
                color: 'var(--gray)',
                textAlign: 'center',
                marginBottom: '3px'
              }}>
                音标: {currentWord.phonetic}
              </p>
            )}
            <p style={{
              fontSize: '10px',
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
                  padding: '8px 12px',
                  fontSize: '13px',
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
                  padding: '8px 12px',
                  fontSize: '13px',
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
                  padding: '8px 12px',
                  fontSize: '13px',
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
                  padding: '8px 12px',
                  fontSize: '13px',
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
                  padding: '8px 12px',
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              >
                跳过
              </button>
            </>
          )}
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

export default MobileExam
