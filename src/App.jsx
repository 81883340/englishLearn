import React, { useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import triggerConfetti from './utils/confetti'
import Home from './components/Home'
import Study from './components/Study'
import WordLibrary from './components/WordLibrary'
import Badges from './components/Badges'
import MistakeBook from './components/mistakeBook'
import SpacedRepetition from './components/SpacedRepetition'
import './App.css'

// 安全地从 localStorage 读取数据，带错误处理
const safeLoadFromStorage = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key)
    if (!saved) return defaultValue
    const parsed = JSON.parse(saved)
    return parsed
  } catch (error) {
    console.error(`Failed to load ${key} from storage:`, error)
    localStorage.removeItem(key) // 清除损坏的数据
    return defaultValue
  }
}

// 安全地从 localStorage 读取字符串数据（不需要 JSON.parse）
const safeLoadString = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key)
    if (!saved) return defaultValue
    return saved
  } catch (error) {
    console.error(`Failed to load ${key} from storage:`, error)
    localStorage.removeItem(key)
    return defaultValue
  }
}

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [currentBook, setCurrentBook] = useState(() =>
    safeLoadString('currentBook', '全部词本')
  )
  const [points, setPoints] = useState(() =>
    safeLoadFromStorage('points', 0)
  )
  const [checkInHistory, setCheckInHistory] = useState(() =>
    safeLoadFromStorage('checkInHistory', [])
  )
  const [progress, setProgress] = useState(() =>
    safeLoadFromStorage('englishProgress', {
      totalLearned: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      streak: 0,
      lastStudyDate: null,
      badges: []
    })
  )
  const [wordLibrary, setWordLibrary] = useState(() =>
    safeLoadFromStorage('wordLibrary', [
      { id: 1, word: 'hello', meaning: '你好', example: 'Hello, how are you?', bookName: '默认词本' },
      { id: 2, word: 'world', meaning: '世界', example: 'The world is beautiful.', bookName: '默认词本' },
      { id: 3, word: 'learning', meaning: '学习', example: 'Learning is a lifelong process.', bookName: '默认词本' },
      { id: 4, word: 'english', meaning: '英语', example: 'I am learning English.', bookName: '默认词本' },
      { id: 5, word: 'keyboard', meaning: '键盘', example: 'I use a keyboard every day.', bookName: '默认词本' },
      { id: 6, word: 'screen', meaning: '屏幕', example: 'The screen is very bright.', bookName: '默认词本' },
      { id: 7, word: 'modern', meaning: '现代的', example: 'This is a modern design.', bookName: '默认词本' },
      { id: 8, word: 'platform', meaning: '平台', example: 'This is a great learning platform.', bookName: '默认词本' },
      { id: 9, word: 'progress', meaning: '进步', example: 'I made good progress today.', bookName: '默认词本' },
      { id: 10, word: 'success', meaning: '成功', example: 'Success comes from hard work.', bookName: '默认词本' }
    ])
  )

  const [learnedWords, setLearnedWords] = useState(() =>
    safeLoadFromStorage('learnedWords', [])
  )

  const [mistakeBook, setMistakeBook] = useState(() =>
    safeLoadFromStorage('mistakeBook', [])
  )

  // 保存每个词本的学习进度（当前学习到的索引）
  const [studyProgress, setStudyProgress] = useState(() =>
    safeLoadFromStorage('studyProgress', {})
  )

  // 学习目标和积分系统
  const [dailyGoal, setDailyGoal] = useState(() =>
    safeLoadFromStorage('dailyGoal', 20)
  )

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

  // 安全地保存到 localStorage，避免不必要的写入
  useEffect(() => {
    try {
      localStorage.setItem('wordLibrary', JSON.stringify(wordLibrary))
    } catch (error) {
      console.error('Failed to save wordLibrary:', error)
    }
  }, [wordLibrary])

  useEffect(() => {
    try {
      localStorage.setItem('learnedWords', JSON.stringify(learnedWords))
    } catch (error) {
      console.error('Failed to save learnedWords:', error)
    }
  }, [learnedWords])

  useEffect(() => {
    try {
      localStorage.setItem('mistakeBook', JSON.stringify(mistakeBook))
    } catch (error) {
      console.error('Failed to save mistakeBook:', error)
    }
  }, [mistakeBook])

  useEffect(() => {
    try {
      localStorage.setItem('englishProgress', JSON.stringify(progress))
    } catch (error) {
      console.error('Failed to save progress:', error)
    }
  }, [progress])

  useEffect(() => {
    try {
      localStorage.setItem('currentBook', currentBook)
    } catch (error) {
      console.error('Failed to save currentBook:', error)
    }
  }, [currentBook])

  useEffect(() => {
    try {
      localStorage.setItem('studyProgress', JSON.stringify(studyProgress))
    } catch (error) {
      console.error('Failed to save studyProgress:', error)
    }
  }, [studyProgress])

  useEffect(() => {
    try {
      localStorage.setItem('dailyGoal', dailyGoal)
    } catch (error) {
      console.error('Failed to save dailyGoal:', error)
    }
  }, [dailyGoal])

  useEffect(() => {
    try {
      localStorage.setItem('points', points)
    } catch (error) {
      console.error('Failed to save points:', error)
    }
  }, [points])

  useEffect(() => {
    try {
      localStorage.setItem('checkInHistory', JSON.stringify(checkInHistory))
    } catch (error) {
      console.error('Failed to save checkInHistory:', error)
    }
  }, [checkInHistory])

  // 检查今日是否已打卡
  const getTodayDate = () => new Date().toISOString().split('T')[0]

  const isCheckedInToday = () => {
    const today = getTodayDate()
    return checkInHistory.includes(today)
  }

  // 打卡功能
  const handleCheckIn = () => {
    if (isCheckedInToday()) {
      toast.error('今天已经打卡过了！')
      return
    }

    const today = getTodayDate()
    setCheckInHistory([...checkInHistory, today])
    setPoints(points + 10) // 每日打卡奖励10积分
    toast.success('🎉 打卡成功！获得10积分')
    triggerConfetti()
  }

  // 完成每日学习目标（自动打卡）
  const handleCompleteDailyGoal = () => {
    const today = getTodayDate()
    let totalBonus = dailyGoal * 2
    let message = `🏆 完成今日目标！获得 ${totalBonus} 积分`

    // 自动打卡（如果今天还未打卡）
    if (!checkInHistory.includes(today)) {
      setCheckInHistory([...checkInHistory, today])
      totalBonus += 10
      message = `🏆 完成今日目标并自动打卡！获得 ${totalBonus} 积分（含打卡奖励）`
    }

    setPoints(points + totalBonus)
    toast.success(message)
    triggerConfetti()
  }

  const updateProgress = (newProgress) => {
    const updated = { ...progress, ...newProgress }
    setProgress(updated)
    checkBadges(updated)
  }

  const checkBadges = (currentProgress) => {
    badgeDefinitions.forEach(badge => {
      // 修复：使用 currentProgress.badges 而不是 progress.badges (闭包问题)
      if (!currentProgress.badges.includes(badge.id) && badge.condition(currentProgress)) {
        const newBadges = [...currentProgress.badges, badge.id]
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
      mistakeBook,
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

  // 验证备份文件的数据结构
  const isValidBackupData = (data) => {
    return (
      data &&
      typeof data === 'object' &&
      data.progress &&
      typeof data.progress === 'object' &&
      typeof data.progress.totalLearned === 'number' &&
      Array.isArray(data.learnedWords) &&
      Array.isArray(data.wordLibrary)
    )
  }

  const handleRestoreProgress = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result)
          
          // 使用验证函数检查数据完整性
          if (!isValidBackupData(data)) {
            toast.error('备份文件格式错误或数据不完整')
            return
          }
          
          const backupDate = data.backupDate ? new Date(data.backupDate).toLocaleDateString() : '未知日期'
          if (!confirm(`确定要恢复 ${backupDate} 的备份吗？当前数据将被覆盖。`)) {
            return
          }
          
          // 恢复数据
          setProgress(data.progress)
          setLearnedWords(data.learnedWords)
          setWordLibrary(data.wordLibrary)
          setMistakeBook(data.mistakeBook || [])
          
          toast.success('恢复成功！')
        } catch (error) {
          console.error('Restore error:', error)
          toast.error('备份文件格式错误')
        }
      }
      reader.onerror = () => {
        toast.error('读取文件失败')
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
            mistakeBook={mistakeBook}
            setCurrentPage={setCurrentPage}
            handleBackupProgress={handleBackupProgress}
            handleRestoreProgress={handleRestoreProgress}
            badgeDefinitions={badgeDefinitions}
            dailyGoal={dailyGoal}
            setDailyGoal={setDailyGoal}
            points={points}
            checkInHistory={checkInHistory}
            currentBook={currentBook}
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
            mistakeBook={mistakeBook}
            setMistakeBook={setMistakeBook}
            currentBook={currentBook}
            setCurrentBook={setCurrentBook}
            studyProgress={studyProgress}
            setStudyProgress={setStudyProgress}
            dailyGoal={dailyGoal}
            setPoints={setPoints}
            handleCompleteDailyGoal={handleCompleteDailyGoal}
          />
        )
      case 'library':
        return (
          <WordLibrary
            wordLibrary={wordLibrary}
            setWordLibrary={setWordLibrary}
            setCurrentPage={setCurrentPage}
            currentBook={currentBook}
            setCurrentBook={setCurrentBook}
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
      case 'mistake':
        return (
          <MistakeBook
            mistakeBook={mistakeBook}
            setMistakeBook={setMistakeBook}
            wordLibrary={wordLibrary}
            setCurrentPage={setCurrentPage}
            currentBook={currentBook}
            setCurrentBook={setCurrentBook}
          />
        )
      case 'review':
        return (
          <SpacedRepetition
            wordLibrary={wordLibrary}
            mistakeBook={mistakeBook}
            setMistakeBook={setMistakeBook}
            setCurrentPage={setCurrentPage}
            currentBook={currentBook}
            setCurrentBook={setCurrentBook}
          />
        )
      default:
        return (
          <Home
            progress={progress}
            wordLibrary={wordLibrary}
            mistakeBook={mistakeBook}
            setCurrentPage={setCurrentPage}
            handleBackupProgress={handleBackupProgress}
            handleRestoreProgress={handleRestoreProgress}
            badgeDefinitions={badgeDefinitions}
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
