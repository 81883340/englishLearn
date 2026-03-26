import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

function MistakeBook({ mistakeBook, setMistakeBook, setCurrentPage }) {
  const [selectedWords, setSelectedWords] = useState([])
  const [filterType, setFilterType] = useState('all') // 'all', 'today', 'week', 'month'
  const [sortType, setSortType] = useState('date') // 'date', 'word', 'wrongCount'
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [printOptions, setPrintOptions] = useState({
    showWord: true,
    showMeaning: true,
    showPhonetic: false,
    showExample: false,
    showWritingSpace: true,
    columns: 2
  })

  useEffect(() => {
    localStorage.setItem('mistakeBook', JSON.stringify(mistakeBook))
  }, [mistakeBook])

  const filteredMistakes = mistakeBook.filter(item => {
    const itemDate = new Date(item.wrongDate)
    const now = new Date()

    switch (filterType) {
      case 'today':
        return itemDate.toDateString() === now.toDateString()
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return itemDate >= weekAgo
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        return itemDate >= monthAgo
      default:
        return true
    }
  })

  const sortedMistakes = [...filteredMistakes].sort((a, b) => {
    switch (sortType) {
      case 'date':
        return new Date(b.wrongDate) - new Date(a.wrongDate)
      case 'word':
        return a.word.localeCompare(b.word)
      case 'wrongCount':
        return b.wrongCount - a.wrongCount
      default:
        return 0
    }
  })

  const handleDeleteSelected = () => {
    if (selectedWords.length === 0) {
      toast.error('请选择要删除的单词')
      return
    }

    if (confirm(`确定要删除选中的 ${selectedWords.length} 个单词吗？`)) {
      setMistakeBook(mistakeBook.filter(item => !selectedWords.includes(item.id)))
      setSelectedWords([])
      toast.success(`成功删除 ${selectedWords.length} 个单词`)
    }
  }

  const handleDeleteSingle = (id) => {
    if (confirm('确定要从单词本中删除这个单词吗？')) {
      setMistakeBook(mistakeBook.filter(item => item.id !== id))
      toast.success('已从单词本删除')
    }
  }

  const handleExportPDF = async () => {
    const jsPDF = (await import('jspdf')).default
    const doc = new jsPDF()

    let y = 20
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    const colWidth = (pageWidth - margin * 3) / printOptions.columns

    doc.setFontSize(20)
    doc.text('单词本 - 错词复习', margin, y)
    y += 15

    doc.setFontSize(10)
    doc.text(`生成日期: ${new Date().toLocaleDateString()}`, margin, y)
    y += 20

    const wordsToPrint = selectedWords.length > 0
      ? mistakeBook.filter(item => selectedWords.includes(item.id))
      : sortedMistakes

    wordsToPrint.forEach((item, index) => {
      const colIndex = index % printOptions.columns
      const x = margin + colIndex * (colWidth + margin)

      if (colIndex === 0 && index > 0) {
        y += 40
      }

      if (y > 250) {
        doc.addPage()
        y = 20
      }

      doc.setFontSize(14)
      if (printOptions.showWord) {
        doc.text(`${index + 1}. ${item.word}`, x, y)
        y += 8
      }

      doc.setFontSize(10)
      if (printOptions.showPhonetic && item.phonetic) {
        doc.text(item.phonetic, x, y)
        y += 6
      }

      if (printOptions.showMeaning && item.meaning) {
        doc.setFontSize(10)
        doc.text(item.meaning, x, y)
        y += 6
      }

      if (printOptions.showExample && item.example) {
        doc.setFontSize(8)
        doc.text(`"${item.example}"`, x, y)
        y += 6
      }

      if (printOptions.showWritingSpace) {
        doc.setDrawColor(200)
        doc.line(x, y, x + colWidth, y)
        y += 20
      }

      if (colIndex === printOptions.columns - 1 || index === wordsToPrint.length - 1) {
        y += 10
      }
    })

    doc.save(`单词本-${new Date().toLocaleDateString()}.pdf`)
    toast.success('PDF导出成功')
    setShowPrintModal(false)
  }

  const handleClearAll = () => {
    if (confirm('确定要清空整个单词本吗？此操作不可恢复！')) {
      setMistakeBook([])
      toast.success('单词本已清空')
    }
  }

  const handleReviewWord = (id) => {
    const item = mistakeBook.find(m => m.id === id)
    if (item && window.confirm(`"${item.word}" 已掌握，从单词本移除吗？`)) {
      setMistakeBook(mistakeBook.filter(m => m.id !== id))
      toast.success('单词已移除')
    }
  }

  const toggleSelectAll = () => {
    if (selectedWords.length === sortedMistakes.length) {
      setSelectedWords([])
    } else {
      setSelectedWords(sortedMistakes.map(item => item.id))
    }
  }

  const getDaysAgo = (dateStr) => {
    const days = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24))
    if (days === 0) return '今天'
    if (days === 1) return '昨天'
    if (days < 7) return `${days}天前`
    if (days < 30) return `${Math.floor(days / 7)}周前`
    return `${Math.floor(days / 30)}月前`
  }

  return (
    <div className="container fade-in">
      <nav className="navbar">
        <div className="navbar-brand">
          <span>📖 错词本</span>
        </div>
        <div className="navbar-nav">
          <button className="nav-link" onClick={() => setCurrentPage('home')}>
            返回首页
          </button>
        </div>
      </nav>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <select
              className="input"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="all">全部</option>
              <option value="today">今天</option>
              <option value="week">本周</option>
              <option value="month">本月</option>
            </select>

            <select
              className="input"
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="date">按时间</option>
              <option value="word">按单词</option>
              <option value="wrongCount">按错误次数</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {selectedWords.length > 0 && (
              <button className="btn btn-danger" onClick={handleDeleteSelected}>
                删除选中 ({selectedWords.length})
              </button>
            )}
            <button className="btn btn-primary" onClick={() => setShowPrintModal(true)}>
              📄 导出PDF
            </button>
            <button className="btn btn-danger" onClick={handleClearAll}>
              🗑️ 清空全部
            </button>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '20px',
          color: 'var(--gray)',
          fontSize: '14px',
          marginBottom: '10px'
        }}>
          <span>总错词数: {mistakeBook.length}</span>
          <span>显示: {sortedMistakes.length}</span>
          <span>已选: {selectedWords.length}</span>
        </div>
      </div>

      {showPrintModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              marginBottom: '20px',
              color: 'var(--dark)'
            }}>
              PDF打印设置
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={printOptions.showWord}
                  onChange={(e) => setPrintOptions({...printOptions, showWord: e.target.checked})}
                />
                显示单词
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={printOptions.showMeaning}
                  onChange={(e) => setPrintOptions({...printOptions, showMeaning: e.target.checked})}
                />
                显示释义
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={printOptions.showPhonetic}
                  onChange={(e) => setPrintOptions({...printOptions, showPhonetic: e.target.checked})}
                />
                显示音标
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={printOptions.showExample}
                  onChange={(e) => setPrintOptions({...printOptions, showExample: e.target.checked})}
                />
                显示例句
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={printOptions.showWritingSpace}
                  onChange={(e) => setPrintOptions({...printOptions, showWritingSpace: e.target.checked})}
                />
                默写空间
              </label>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  列数: {printOptions.columns}
                </label>
                <input
                  type="range"
                  min="1"
                  max="3"
                  value={printOptions.columns}
                  onChange={(e) => setPrintOptions({...printOptions, columns: parseInt(e.target.value)})}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button className="btn btn-primary" onClick={handleExportPDF}>
                  生成PDF
                </button>
                <button className="btn btn-secondary" onClick={() => setShowPrintModal(false)}>
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        {sortedMistakes.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--gray)'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🎉</div>
            <p style={{ fontSize: '18px', marginBottom: '10px' }}>
              单词本是空的
            </p>
            <p>在学习时答错的单词会自动加入这里</p>
          </div>
        ) : (
          <>
            <div style={{
              marginBottom: '16px',
              paddingBottom: '16px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <input
                type="checkbox"
                checked={selectedWords.length === sortedMistakes.length}
                onChange={toggleSelectAll}
              />
              <span style={{ fontSize: '14px', color: 'var(--gray)' }}>
                全选 ({sortedMistakes.length})
              </span>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              {sortedMistakes.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '16px',
                    background: selectedWords.includes(item.id)
                      ? 'rgba(99, 102, 241, 0.1)'
                      : 'white',
                    border: selectedWords.includes(item.id)
                      ? '2px solid var(--primary)'
                      : '1px solid #e5e7eb',
                    borderRadius: '12px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedWords.includes(item.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedWords([...selectedWords, item.id])
                      } else {
                        setSelectedWords(selectedWords.filter(id => id !== item.id))
                      }
                    }}
                    style={{ marginTop: '4px' }}
                  />

                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '8px'
                    }}>
                      <span style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: 'var(--primary)'
                      }}>
                        {item.word}
                      </span>
                      {item.phonetic && (
                        <span style={{
                          fontSize: '14px',
                          color: 'var(--gray)',
                          fontFamily: 'Arial, sans-serif'
                        }}>
                          {item.phonetic}
                        </span>
                      )}
                      <span style={{
                        fontSize: '12px',
                        padding: '2px 8px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        borderRadius: '4px',
                        fontWeight: '500'
                      }}>
                        错误 {item.wrongCount} 次
                      </span>
                    </div>

                    <p style={{
                      fontSize: '16px',
                      color: 'var(--dark)',
                      fontWeight: '500',
                      marginBottom: '6px'
                    }}>
                      {item.meaning}
                    </p>

                    {item.example && (
                      <p style={{
                        fontSize: '14px',
                        color: 'var(--gray)',
                        fontStyle: 'italic',
                        marginBottom: '8px'
                      }}>
                        "{item.example}"
                      </p>
                    )}

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '12px',
                      color: 'var(--gray)'
                    }}>
                      <span>📅 {getDaysAgo(item.wrongDate)}</span>
                      <span>🔁 下次复习: {getDaysAgo(item.nextReviewDate)}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-success"
                      onClick={() => handleReviewWord(item.id)}
                      style={{ padding: '8px 12px', fontSize: '12px' }}
                    >
                      ✓ 已掌握
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteSingle(item.id)}
                      style={{ padding: '8px 12px', fontSize: '12px' }}
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default MistakeBook
