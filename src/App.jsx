import React, { useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import Home from './components/Home'
import Study from './components/Study'
import WordLibrary from './components/WordLibrary'
import Badges from './components/Badges'
import './App.css'

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

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem('englishProgress')
    return saved ? JSON.parse(saved) : {
      totalLearned: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      streak: 0,
      lastStudyDate: null,
      badges: []
    }
  })
  const [wordLibrary, setWordLibrary] = useState(() => {
    const saved = localStorage.getItem('wordLibrary')
    return saved ? JSON.parse(saved) : [
      { id: 1, word: 'hello', meaning: '你好', example: 'Hello, how are you?' },
      { id: 2, word: 'world', meaning: '世界', example: 'The world is beautiful.' },
      { id: 3, word: 'learning', meaning: '学习', example: 'Learning is a lifelong process.' },
      { id: 4, word: 'english', meaning: '英语', example: 'I am learning English.' },
      { id: 5, word: 'keyboard', meaning: '键盘', example: 'I use a keyboard every day.' },
      { id: 6, word: 'screen', meaning: '屏幕', example: 'The screen is very bright.' },
      { id: 7, word: 'modern', meaning: '现代的', example: 'This is a modern design.' },
      { id: 8, word: 'platform', meaning: '平台', example: 'This is a great learning platform.' },
      { id: 9, word: 'progress', meaning: '进步', example: 'I made good progress today.' },
      { id: 10, word: 'success', meaning: '成功', example: 'Success comes from hard work.' }
    ]
  })

  const [learnedWords, setLearnedWords] = useState(() => {
    const saved = localStorage.getItem('learnedWords')
    return saved ? JSON.parse(saved) : []
  })

  const badgeDefinitions = [
    { id: 'first_word', name: '初学者', description: '完成第一个单词', icon: '🌟', condition: (p) => p.totalLearned >= 1 },
    { id: 'ten_words', name: '起步者', description: '学习10个单词', icon: '📚', condition: (p) => p.totalLearned >= 10 },
    { id: 'fifty_words', name: '进阶者', description: '学习50个单词', icon: '🎯', condition: (p) => p.totalLearned >= 50 },
    { id: 'hundred_words', name: '学者', description: '学习100个单词', icon: '🏆', condition: (p) => p.totalLearned >= 100 },
    { id: 'perfect_day', name: '完美一天', description: '连续答对20个题', icon: '💯', condition: (p) => p.streak >= 20 },
    { id: 'dedicated', name: '坚持不懈', description: '连续学习7天', icon: '🔥', condition: (p) => p.streakDays >= 7 },
    { id: 'master', name: '单词大师', description: '学习200个单词', icon: '👑', condition: (p) => p.totalLearned >= 200 },
    { id: 'expert', name: '专家', description: '正确率达到90%', icon: '⭐', condition: (p) => p.correctAnswers > 0 && p.correctAnswers / (p.correctAnswers + p.wrongAnswers) >= 0.9 }
  ]

  useEffect(() => {
    localStorage.setItem('wordLibrary', JSON.stringify(wordLibrary))
  }, [wordLibrary])

  useEffect(() => {
    localStorage.setItem('learnedWords', JSON.stringify(learnedWords))
  }, [learnedWords])

  useEffect(() => {
    localStorage.setItem('englishProgress', JSON.stringify(progress))
  }, [progress])

  const updateProgress = (newProgress) => {
    const updated = { ...progress, ...newProgress }
    setProgress(updated)
    checkBadges(updated)
  }

  const checkBadges = (currentProgress) => {
    badgeDefinitions.forEach(badge => {
      if (!progress.badges.includes(badge.id) && badge.condition(currentProgress)) {
        const newBadges = [...progress.badges, badge.id]
        updateProgress({ badges: newBadges })
        toast.success(`🎉 恭喜获得徽章: ${badge.name}!`)
        setTimeout(() => {
          triggerConfetti()
        }, 300)
      }
    })
  }

  const handleBackupProgress = () => {
    const backupData = {
      progress,
      learnedWords,
      wordLibrary,
      backupDate: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `english-learning-backup-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('备份成功！')
  }

  const handleRestoreProgress = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result)
          if (data.progress && data.learnedWords && data.wordLibrary) {
            if (confirm(`确定要恢复 ${data.backupDate ? new Date(data.backupDate).toLocaleDateString() : ''} 的备份吗？当前数据将被覆盖。`)) {
              setProgress(data.progress)
              setLearnedWords(data.learnedWords)
              setWordLibrary(data.wordLibrary)
              toast.success('恢复成功！')
            }
          } else {
            toast.error('备份文件格式错误')
          }
        } catch (error) {
          toast.error('备份文件格式错误')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <Home
            progress={progress}
            wordLibrary={wordLibrary}
            setCurrentPage={setCurrentPage}
            handleBackupProgress={handleBackupProgress}
            handleRestoreProgress={handleRestoreProgress}
          />
        )
      case 'study':
        return (
          <Study
            wordLibrary={wordLibrary}
            learnedWords={learnedWords}
            setLearnedWords={setLearnedWords}
            updateProgress={updateProgress}
            progress={progress}
            setCurrentPage={setCurrentPage}
          />
        )
      case 'library':
        return (
          <WordLibrary
            wordLibrary={wordLibrary}
            setWordLibrary={setWordLibrary}
            setCurrentPage={setCurrentPage}
          />
        )
      case 'badges':
        return (
          <Badges
            progress={progress}
            badgeDefinitions={badgeDefinitions}
            setCurrentPage={setCurrentPage}
          />
        )
      default:
        return (
          <Home
            progress={progress}
            wordLibrary={wordLibrary}
            setCurrentPage={setCurrentPage}
            handleBackupProgress={handleBackupProgress}
            handleRestoreProgress={handleRestoreProgress}
          />
        )
    }
  }

  return (
    <div className="app">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '16px 24px',
            fontSize: '14px',
            fontWeight: '500',
          }
        }}
      />
      {renderPage()}
    </div>
  )
}

export default App
