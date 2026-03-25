import React, { useState } from 'react'

function Badges({ progress, badgeDefinitions, setCurrentPage }) {
  const [showAll, setShowAll] = useState(false)

  const earnedBadges = badgeDefinitions.filter(b => progress.badges.includes(b.id))
  const unearnedBadges = badgeDefinitions.filter(b => !progress.badges.includes(b.id))

  return (
    <div className="container fade-in">
      <nav className="navbar">
        <div className="navbar-brand">
          <span>🏆 徽章成就</span>
        </div>
        <div className="navbar-nav">
          <button className="nav-link" onClick={() => setCurrentPage('home')}>
            返回首页
          </button>
        </div>
      </nav>

      <div className="card" style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: '800',
          marginBottom: '16px',
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          成就系统
        </h1>
        <p style={{ color: 'var(--gray)', fontSize: '18px', marginBottom: '30px' }}>
          已获得 {earnedBadges.length} / {badgeDefinitions.length} 个徽章
        </p>

        <div style={{
          width: '100%',
          height: '12px',
          background: 'rgba(99, 102, 241, 0.1)',
          borderRadius: '6px',
          overflow: 'hidden',
          marginBottom: '20px'
        }}>
          <div
            style={{
              width: `${(earnedBadges.length / badgeDefinitions.length) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
              transition: 'width 0.5s ease',
              borderRadius: '6px'
            }}
          />
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? '只看已获得' : '查看全部徽章'}
        </button>
      </div>

      <div className="card">
        {earnedBadges.length > 0 && (
          <>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '20px',
              color: 'var(--dark)'
            }}>
              已获得的徽章
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px',
              marginBottom: '40px'
            }}>
              {earnedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="badge-earned"
                  style={{
                    padding: '24px',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
                    borderRadius: '16px',
                    border: '2px solid #10b981',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-8px) scale(1.02)'
                    e.target.style.boxShadow = '0 20px 40px rgba(16, 185, 129, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0) scale(1)'
                    e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)',
                    transform: 'rotate(45deg)',
                    animation: 'shine 3s infinite'
                  }} />
                  <div style={{
                    fontSize: '64px',
                    marginBottom: '16px',
                    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))'
                  }}>
                    {badge.icon}
                  </div>
                  <h3 style={{
                    fontSize: '22px',
                    fontWeight: '700',
                    color: 'var(--dark)',
                    marginBottom: '8px'
                  }}>
                    {badge.name}
                  </h3>
                  <p style={{
                    color: 'var(--gray)',
                    fontSize: '15px'
                  }}>
                    {badge.description}
                  </p>
                  <div style={{
                    marginTop: '12px',
                    padding: '6px 16px',
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#10b981',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '600',
                    display: 'inline-block'
                  }}>
                    已解锁 ✓
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {(showAll || earnedBadges.length === 0) && unearnedBadges.length > 0 && (
          <>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '20px',
              color: 'var(--dark)',
              marginTop: earnedBadges.length > 0 ? '40px' : '0'
            }}>
              待解锁的徽章
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {unearnedBadges.map((badge) => (
                <div
                  key={badge.id}
                  style={{
                    padding: '24px',
                    background: 'rgba(229, 231, 235, 0.3)',
                    borderRadius: '16px',
                    border: '2px solid rgba(156, 163, 175, 0.3)',
                    textAlign: 'center',
                    opacity: '0.7',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.opacity = '1'
                    e.target.style.transform = 'translateY(-4px)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = '0.7'
                    e.target.style.transform = 'translateY(0)'
                  }}
                >
                  <div style={{
                    fontSize: '64px',
                    marginBottom: '16px',
                    opacity: '0.5',
                    filter: 'grayscale(100%)'
                  }}>
                    {badge.icon}
                  </div>
                  <h3 style={{
                    fontSize: '22px',
                    fontWeight: '700',
                    color: 'var(--dark)',
                    marginBottom: '8px'
                  }}>
                    {badge.name}
                  </h3>
                  <p style={{
                    color: 'var(--gray)',
                    fontSize: '15px',
                    marginBottom: '12px'
                  }}>
                    {badge.description}
                  </p>
                  <div style={{
                    padding: '6px 16px',
                    background: 'rgba(156, 163, 175, 0.2)',
                    color: 'var(--gray)',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '600',
                    display: 'inline-block'
                  }}>
                    🔒 未解锁
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {badgeDefinitions.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--gray)'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🏅</div>
            <p style={{ fontSize: '18px', marginBottom: '10px' }}>
              暂无徽章
            </p>
            <p>开始学习单词来解锁你的第一个徽章吧！</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Badges
