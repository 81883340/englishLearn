import React, { useState } from 'react'

function WordLibrary({ wordLibrary, setWordLibrary, setCurrentPage }) {
  const [newWord, setNewWord] = useState({ word: '', meaning: '', example: '' })
  const [editingId, setEditingId] = useState(null)
  const [editingWord, setEditingWord] = useState({ word: '', meaning: '', example: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  const handleAddWord = () => {
    if (!newWord.word.trim() || !newWord.meaning.trim()) {
      alert('请填写单词和释义')
      return
    }

    const word = {
      id: Date.now(),
      word: newWord.word.trim().toLowerCase(),
      meaning: newWord.meaning.trim(),
      example: newWord.example.trim() || `${newWord.word} - example sentence`
    }

    setWordLibrary([...wordLibrary, word])
    setNewWord({ word: '', meaning: '', example: '' })
    setShowAddForm(false)
  }

  const handleEditWord = () => {
    if (!editingWord.word.trim() || !editingWord.meaning.trim()) {
      alert('请填写单词和释义')
      return
    }

    setWordLibrary(wordLibrary.map(w =>
      w.id === editingId
        ? {
            ...w,
            word: editingWord.word.trim().toLowerCase(),
            meaning: editingWord.meaning.trim(),
            example: editingWord.example.trim()
          }
        : w
    ))
    setEditingId(null)
    setEditingWord({ word: '', meaning: '', example: '' })
  }

  const handleDeleteWord = (id) => {
    if (confirm('确定要删除这个单词吗？')) {
      setWordLibrary(wordLibrary.filter(w => w.id !== id))
    }
  }

  const startEditing = (word) => {
    setEditingId(word.id)
    setEditingWord({
      word: word.word,
      meaning: word.meaning,
      example: word.example
    })
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result)
          if (Array.isArray(imported)) {
            const newWords = imported.map((w, index) => ({
              id: Date.now() + index,
              word: w.word?.trim().toLowerCase() || '',
              meaning: w.meaning?.trim() || '',
              example: w.example?.trim() || ''
            })).filter(w => w.word && w.meaning)
            setWordLibrary([...wordLibrary, ...newWords])
            alert(`成功导入 ${newWords.length} 个单词`)
          }
        } catch (error) {
          alert('导入失败: 文件格式错误')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(wordLibrary, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'word-library.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const filteredWords = wordLibrary.filter(w =>
    w.word.includes(searchTerm.toLowerCase()) ||
    w.meaning.includes(searchTerm)
  )

  return (
    <div className="container fade-in">
      <nav className="navbar">
        <div className="navbar-brand">
          <span>📚 词库管理</span>
        </div>
        <div className="navbar-nav">
          <button className="nav-link" onClick={() => setCurrentPage('home')}>
            返回首页
          </button>
        </div>
      </nav>

      <div className="card" style={{ marginBottom: '30px' }}>
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          <button
            className="btn btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? '收起表单' : '+ 添加单词'}
          </button>
          <button className="btn btn-secondary" onClick={handleImport}>
            📥 导入词库
          </button>
          <button className="btn btn-secondary" onClick={handleExport}>
            📤 导出词库
          </button>
          <input
            type="text"
            className="input"
            placeholder="搜索单词或释义..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, minWidth: '200px' }}
          />
        </div>

        <div style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '20px',
          color: 'var(--gray)',
          fontSize: '14px'
        }}>
          <span>总单词数: {wordLibrary.length}</span>
          <span>搜索结果: {filteredWords.length}</span>
        </div>

        {showAddForm && (
          <div style={{
            padding: '24px',
            background: 'rgba(99, 102, 241, 0.05)',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              marginBottom: '20px',
              color: 'var(--dark)'
            }}>
              添加新单词
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: 'var(--dark)'
                }}>
                  单词 *
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="例如: hello"
                  value={newWord.word}
                  onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: 'var(--dark)'
                }}>
                  释义 *
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="例如: 你好"
                  value={newWord.meaning}
                  onChange={(e) => setNewWord({ ...newWord, meaning: e.target.value })}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: 'var(--dark)'
                }}>
                  例句
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="例如: Hello, how are you?"
                  value={newWord.example}
                  onChange={(e) => setNewWord({ ...newWord, example: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-primary" onClick={handleAddWord}>
                  添加单词
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddForm(false)
                    setNewWord({ word: '', meaning: '', example: '' })
                  }}
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {filteredWords.map((word) => (
            <div
              key={word.id}
              style={{
                padding: '20px',
                background: 'rgba(99, 102, 241, 0.05)',
                borderRadius: '12px',
                border: '2px solid transparent',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = 'var(--primary)'
                e.target.style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'transparent'
                e.target.style.transform = 'translateY(0)'
              }}
            >
              {editingId === word.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    type="text"
                    className="input"
                    value={editingWord.word}
                    onChange={(e) => setEditingWord({ ...editingWord, word: e.target.value })}
                    placeholder="单词"
                  />
                  <input
                    type="text"
                    className="input"
                    value={editingWord.meaning}
                    onChange={(e) => setEditingWord({ ...editingWord, meaning: e.target.value })}
                    placeholder="释义"
                  />
                  <input
                    type="text"
                    className="input"
                    value={editingWord.example}
                    onChange={(e) => setEditingWord({ ...editingWord, example: e.target.value })}
                    placeholder="例句"
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-success" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={handleEditWord}>
                      保存
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '8px 16px', fontSize: '14px' }}
                      onClick={() => {
                        setEditingId(null)
                        setEditingWord({ word: '', meaning: '', example: '' })
                      }}
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h4 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: 'var(--primary)',
                    marginBottom: '8px'
                  }}>
                    {word.word}
                  </h4>
                  <p style={{
                    fontSize: '16px',
                    color: 'var(--dark)',
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>
                    {word.meaning}
                  </p>
                  <p style={{
                    fontSize: '14px',
                    color: 'var(--gray)',
                    fontStyle: 'italic',
                    marginBottom: '16px'
                  }}>
                    "{word.example}"
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '8px 16px', fontSize: '14px' }}
                      onClick={() => startEditing(word)}
                    >
                      编辑
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '8px 16px', fontSize: '14px' }}
                      onClick={() => handleDeleteWord(word.id)}
                    >
                      删除
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {filteredWords.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--gray)'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>📭</div>
            <p style={{ fontSize: '18px', marginBottom: '10px' }}>
              {searchTerm ? '没有找到匹配的单词' : '词库为空'}
            </p>
            <p>点击"添加单词"按钮开始构建你的词库</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default WordLibrary
