import React, { useState, useEffect, useRef } from 'react'

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
  const [currentWord, setCurrentWord] = useState(null)
  const [userInput, setUserInput] = useState('')
  const [showResult, setShowResult] = useState(null) // 'correct' | 'wrong' | null
  const [showHint, setShowHint] = useState(false)

  const getRandomWord = () => {
    const unlearned = wordLibrary.filter(w => !learnedWords.includes(w.id))
    const pool = unlearned.length > 0 ? unlearned : wordLibrary
    const randomIndex = Math.floor(Math.random() * pool.length)
    return pool[randomIndex]
  }

  useEffect(() => {
    if (wordLibrary.length > 0) {
      setCurrentWord(getRandomWord())
    }
  }, [wordLibrary, learnedWords])

  useEffect(() => {
    if (userInput === currentWord?.word) {
      handleCorrect()
    }
  }, [userInput])

  const handleKeyPress = (key) => {
    if (showResult) return

    if (key === 'BACK') {
      setUserInput(prev => prev.slice(0, -1))
    } else if (key === 'SPACE') {
      setUserInput(prev => prev + ' ')
    } else if (key.length === 1) {
      setUserInput(prev => prev + key)
    }
  }

  const handlePhysicalKeyboard = (e) => {
    if (showResult) {
      if (e.key === 'Enter') {
        nextWord()
      }
      return
    }

    if (e.key === 'Backspace') {
      handleKeyPress('BACK')
    } else if (e.key === ' ') {
      e.preventDefault()
      handleKeyPress('SPACE')
    } else if (e.key === 'Enter') {
      nextWord()
    } else if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
      handleKeyPress(e.key.toLowerCase())
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handlePhysicalKeyboard)
    return () => window.removeEventListener('keydown', handlePhysicalKeyboard)
  }, [showResult, userInput, currentWord])

  const handleCorrect = () => {
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
  }

  const handleWrong = () => {
    setShowResult('wrong')
    updateProgress({
      wrongAnswers: progress.wrongAnswers + 1,
      streak: 0
    })
  }

  const nextWord = () => {
    setUserInput('')
    setShowResult(null)
    setShowHint(false)
    setCurrentWord(getRandomWord())
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

    const targetIndex = userInput.length
    if (targetIndex < currentWord?.word.length) {
      return currentWord.word[targetIndex].toLowerCase() === lowerKey ? 'var(--primary)' : '#e5e7eb'
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
          <span>📚 学习模式</span>
        </div>
        <div className="navbar-nav">
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
        </div>

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
          marginBottom: '40px'
        }}>
          <button
            className="btn btn-secondary"
            onClick={() => setShowHint(!showHint)}
          >
            💡 {showHint ? '隐藏提示' : '显示提示'}
          </button>
          {showResult && (
            <button className="btn btn-primary" onClick={nextWord}>
              下一个单词 →
            </button>
          )}
          {!showResult && (
            <button className="btn btn-danger" onClick={handleWrong}>
              显示答案
            </button>
          )}
        </div>

        {showHint && (
          <div style={{
            padding: '16px 24px',
            background: 'rgba(99, 102, 241, 0.1)',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <p style={{ color: 'var(--primary)', fontWeight: '500' }}>
              单词长度: {currentWord.word.length} 个字母
            </p>
          </div>
        )}
      </div>

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
                    cursor: showResult ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
                  }}
                  disabled={showResult}
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
                cursor: showResult ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
              }}
              disabled={showResult}
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
                cursor: showResult ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
              }}
              disabled={showResult}
            >
              Space
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Study
