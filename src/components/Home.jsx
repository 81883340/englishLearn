import React from 'react'

function Home({ progress, wordLibrary, setCurrentPage }) {
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

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-value">{progress.totalLearned}</div>
          <div className="stat-label">已学单词</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{progress.correctAnswers}</div>
          <div className="stat-label">正确答题</div>
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
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-value">{wordLibrary.length}</div>
          <div className="stat-label">词库数量</div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginTop: '40px'
      }}>
        <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => setCurrentPage('study')}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>🚀</div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '12px',
            color: 'var(--dark)'
          }}>
            开始学习
          </h2>
          <p style={{ color: 'var(--gray)', marginBottom: '20px' }}>
            使用虚拟键盘输入单词，提升拼写能力
          </p>
          <button className="btn btn-primary" style={{ width: '100%' }}>
            立即开始
          </button>
        </div>

        <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => setCurrentPage('library')}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>📝</div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '12px',
            color: 'var(--dark)'
          }}>
            词库管理
          </h2>
          <p style={{ color: 'var(--gray)', marginBottom: '20px' }}>
            自定义你的单词库，添加、编辑、删除单词
          </p>
          <button className="btn btn-secondary" style={{ width: '100%' }}>
            管理词库
          </button>
        </div>

        <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => setCurrentPage('badges')}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>🏆</div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '12px',
            color: 'var(--dark)'
          }}>
            徽章成就
          </h2>
          <p style={{ color: 'var(--gray)', marginBottom: '20px' }}>
            查看所有已获得的徽章和待解锁成就
          </p>
          <button className="btn btn-secondary" style={{ width: '100%' }}>
            查看徽章
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home
