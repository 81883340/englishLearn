import React from 'react'
import toast from 'react-hot-toast'

function Home({ progress, wordLibrary, setCurrentPage, handleBackupProgress, handleRestoreProgress }) {
  const accuracy = progress.correctAnswers + progress.wrongAnswers > 0
    ? Math.round((progress.correctAnswers / (progress.correctAnswers + progress.wrongAnswers)) * 100)
    : 0

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
            onClick={() => setCurrentPage('library')}
          >
            词库管理
          </button>
          <button
            className={`nav-link`}
            onClick={() => setCurrentPage('badges')}
          >
            徽章成就
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
        maxWidth: '600px',
        margin: '0 auto 60px',
        textAlign: 'center'
      }}>
        <button
          className="btn btn-primary"
          onClick={() => setCurrentPage('study')}
          style={{
            width: '100%',
            padding: '24px 40px',
            fontSize: '20px',
            fontWeight: '700',
            borderRadius: '16px',
            boxShadow: '0 8px 30px rgba(99, 102, 241, 0.4)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-4px)'
            e.target.style.boxShadow = '0 12px 40px rgba(99, 102, 241, 0.5)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 8px 30px rgba(99, 102, 241, 0.4)'
          }}
        >
          <span style={{ fontSize: '36px' }}>🚀</span>
          <div style={{ textAlign: 'left' }}>
            <div>开始学习</div>
            <div style={{ fontSize: '14px', fontWeight: '500', opacity: 0.9 }}>
              使用虚拟键盘提升拼写能力
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
          学习进度
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
            <div className="stat-icon">🏅</div>
            <div className="stat-value">{progress.badges.length}</div>
            <div className="stat-label">获得徽章</div>
          </div>
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

        <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => setCurrentPage('badges')}>
          <div style={{ fontSize: '50px', marginBottom: '16px' }}>🏆</div>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '700',
            marginBottom: '8px',
            color: 'var(--dark)'
          }}>
            徽章成就
          </h3>
          <p style={{ color: 'var(--gray)', fontSize: '14px', marginBottom: '16px' }}>
            查看所有已获得的徽章
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
    </div>
  )
}

export default Home
