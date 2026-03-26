import React, { useState } from 'react'
import toast from 'react-hot-toast'

function Home({ progress, wordLibrary, mistakeBook, setCurrentPage, handleBackupProgress, handleRestoreProgress, badgeDefinitions, dailyGoal, setDailyGoal, points, checkInHistory, handleCheckIn }) {
  const accuracy = progress.correctAnswers + progress.wrongAnswers > 0
    ? Math.round((progress.correctAnswers / (progress.correctAnswers + progress.wrongAnswers)) * 100)
    : 0

  // 检查今日是否已打卡
  const getTodayDate = () => new Date().toISOString().split('T')[0]
  const isCheckedInToday = checkInHistory.includes(getTodayDate())
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [tempGoal, setTempGoal] = useState(dailyGoal)

  return (
    <div className="container fade-in">
      <nav className="navbar">
        <div className="navbar-brand">
          <span>📚 英语学习平台</span>
        </div>
        <div className="navbar-nav">
          <button
            className={`nav-link ${'home' ? 'active' : ''}`}
            onClick={() => setCurrentPage('home')}
          >
            首页
          </button>
          <button
            className={`nav-link`}
            onClick={() => setCurrentPage('study')}
          >
            开始学习
          </button>
          <button
            className={`nav-link`}
            onClick={() => setCurrentPage('review')}
          >
            复习
          </button>
          <button
            className={`nav-link`}
            onClick={() => setCurrentPage('library')}
          >
            词库管理
          </button>
          <button
            className={`nav-link`}
            onClick={() => setCurrentPage('mistake')}
          >
            错词本
          </button>
          <button
            className={`nav-link`}
            onClick={handleCheckIn}
            style={{
              background: isCheckedInToday ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              border: isCheckedInToday ? '2px solid var(--primary)' : 'none'
            }}
          >
            {isCheckedInToday ? '✓ 已打卡' : '📅 每日打卡'}
          </button>
        </div>
      </nav>

      <div style={{ marginBottom: '40px' }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: '800',
          color: 'white',
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          欢迎回来！
        </h1>
        <p style={{
          fontSize: '20px',
          color: 'rgba(255, 255, 255, 0.9)',
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          今天也要努力背单词哦！
        </p>
      </div>

      <div style={{
        maxWidth: '900px',
        margin: '0 auto 60px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        textAlign: 'center'
      }}>
        <button
          className="btn btn-primary"
          onClick={() => setCurrentPage('study')}
          style={{
            width: '100%',
            padding: '28px 40px',
            fontSize: '22px',
            fontWeight: '700',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            border: '3px solid #fbbf24',
            boxShadow: '0 10px 40px rgba(245, 158, 11, 0.5)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            color: 'white'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-6px)'
            e.target.style.boxShadow = '0 15px 50px rgba(245, 158, 11, 0.6)'
            e.target.style.background = 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 10px 40px rgba(245, 158, 11, 0.5)'
            e.target.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
          }}
        >
          <span style={{ fontSize: '40px', filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' }}>🚀</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}>开始学习</div>
            <div style={{ fontSize: '14px', fontWeight: '500', opacity: 0.95, textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}>
              使用虚拟键盘提升拼写能力
            </div>
          </div>
        </button>

        <button
          className="btn btn-primary"
          onClick={() => setCurrentPage('review')}
          style={{
            width: '100%',
            padding: '28px 40px',
            fontSize: '22px',
            fontWeight: '700',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            border: '3px solid #a78bfa',
            boxShadow: '0 10px 40px rgba(99, 102, 241, 0.5)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            color: 'white'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-6px)'
            e.target.style.boxShadow = '0 15px 50px rgba(99, 102, 241, 0.6)'
            e.target.style.background = 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 10px 40px rgba(99, 102, 241, 0.5)'
            e.target.style.background = 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'
          }}
        >
          <span style={{ fontSize: '40px', filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' }}>🧠</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}>遗忘曲线复习</div>
            <div style={{ fontSize: '14px', fontWeight: '500', opacity: 0.95, textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}>
              智能复习，记忆更牢固
            </div>
          </div>
        </button>
      </div>

      <div className="card">
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: 'var(--dark)',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          学习进度 & 成就
        </h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📖</div>
            <div className="stat-value">{progress.totalLearned}</div>
            <div className="stat-label">已学单词</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-value">{wordLibrary.length}</div>
            <div className="stat-label">词库数量</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">❌</div>
            <div className="stat-value">{mistakeBook.length}</div>
            <div className="stat-label">错词数量</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-value">{accuracy}%</div>
            <div className="stat-label">正确率</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-value">{progress.streak}</div>
            <div className="stat-label">连续正确</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-value">{progress.badges?.length || 0}</div>
            <div className="stat-label">已获成就</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-value">{badgeDefinitions?.length || 0}</div>
            <div className="stat-label">总成就数</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-value">{badgeDefinitions?.length > 0 ? Math.round(((progress.badges?.length || 0) / badgeDefinitions.length) * 100) : 0}%</div>
            <div className="stat-label">完成度</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-value">{points}</div>
            <div className="stat-label">我的积分</div>
          </div>
        </div>
        <div style={{
          marginTop: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '12px'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '12px 24px',
            background: 'rgba(99, 102, 241, 0.05)',
            borderRadius: '8px',
            fontSize: '14px',
            color: 'var(--dark)',
            fontWeight: '500'
          }}>
            今日目标：<span style={{ color: 'var(--primary)', fontWeight: '700' }}>{dailyGoal}</span> 个单词
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => setShowGoalModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 20px',
              fontSize: '14px'
            }}
          >
            ⚙️ 设置目标
          </button>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginTop: '30px'
      }}>
        <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => setCurrentPage('library')}>
          <div style={{ fontSize: '50px', marginBottom: '16px' }}>📝</div>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '700',
            marginBottom: '8px',
            color: 'var(--dark)'
          }}>
            词库管理
          </h3>
          <p style={{ color: 'var(--gray)', fontSize: '14px', marginBottom: '16px' }}>
            添加、编辑、导入导出单词
          </p>
        </div>

        <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => setCurrentPage('mistake')}>
          <div style={{ fontSize: '50px', marginBottom: '16px' }}>❌</div>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '700',
            marginBottom: '8px',
            color: 'var(--dark)'
          }}>
            错词本
          </h3>
          <p style={{ color: 'var(--gray)', fontSize: '14px', marginBottom: '16px' }}>
            查看和整理错词 ({mistakeBook.length})
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: '30px' }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '700',
          color: 'var(--dark)',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          数据管理
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          <button
            className="btn btn-primary"
            onClick={handleBackupProgress}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <span>💾</span> 备份进度
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleRestoreProgress}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <span>📥</span> 恢复进度
          </button>
        </div>
        <p style={{
          fontSize: '12px',
          color: 'var(--gray)',
          textAlign: 'center',
          marginTop: '16px'
        }}>
          备份包含学习进度、已学单词和词库数据
        </p>
      </div>

      {/* 设置每日目标弹窗 */}
      {showGoalModal && (
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
          zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '400px', width: '90%' }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              marginBottom: '20px',
              color: 'var(--dark)'
            }}>
              设置每日学习目标
            </h3>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: 'var(--dark)'
              }}>
                每日学习单词数
              </label>
              <input
                type="number"
                className="input"
                value={tempGoal}
                onChange={(e) => setTempGoal(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max="100"
                style={{ width: '100%' }}
              />
              <div style={{
                marginTop: '8px',
                fontSize: '12px',
                color: 'var(--gray)'
              }}>
                当前目标: {tempGoal} 个单词/天，完成后可获得 {tempGoal * 2} 积分
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setDailyGoal(tempGoal)
                  setShowGoalModal(false)
                  toast.success(`每日目标已设置为 ${tempGoal} 个单词`)
                }}
                style={{ flex: 1 }}
              >
                确定
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowGoalModal(false)
                  setTempGoal(dailyGoal)
                }}
                style={{ flex: 1 }}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
