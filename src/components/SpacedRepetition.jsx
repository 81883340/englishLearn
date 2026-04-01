import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import confetti from '../utils/confetti';

const SpacedRepetition = () => {
  const [reviewWords, setReviewWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showHint, setShowHint] = useState(false);

  // 加载需要复习的单词
  useEffect(() => {
    loadReviewWords();
  }, []);

  const loadReviewWords = () => {
    const allWords = JSON.parse(localStorage.getItem('wordLibrary') || '[]');
    const today = new Date();
    
    const dueWords = allWords.filter(word => {
      if (!word.nextReviewDate) return true;
      return new Date(word.nextReviewDate) <= today;
    });

    setReviewWords(dueWords);
  };

  const currentWord = reviewWords[currentIndex];

  // 提交答案
  const handleSubmit = () => {
    if (!userInput.trim() || showAnswer) return;

    const correct = userInput.trim().toLowerCase() === currentWord.word.toLowerCase();
    setIsCorrect(correct);
    setShowAnswer(true);
    setTotalCount(prev => prev + 1);

    if (correct) {
      setCorrectCount(prev => prev + 1);
      updateWordMemory(currentWord, true);
      toast.success('✅ 正确！');
    } else {
      updateWordMemory(currentWord, false);
      toast.error('❌ 错误');
    }
  };

  // 更新记忆等级（遗忘曲线核心功能 保留）
  const updateWordMemory = (word, correct) => {
    const words = JSON.parse(localStorage.getItem('wordLibrary') || '[]');
    const index = words.findIndex(w => w.id === word.id);
    if (index === -1) return;

    let newLevel = word.memoryLevel || 1;
    if (correct) {
      newLevel = Math.min(newLevel + 1, 5);
    } else {
      newLevel = 1;
    }

    const nextReviewDate = getNextReviewDate(newLevel);
    words[index] = {
      ...word,
      memoryLevel: newLevel,
      lastReviewDate: new Date().toISOString(),
      nextReviewDate: nextReviewDate.toISOString()
    };

    localStorage.setItem('wordLibrary', JSON.stringify(words));
  };

  // 计算下次复习时间
  const getNextReviewDate = (level) => {
    const date = new Date();
    const days = [1, 2, 4, 7, 14][level - 1];
    date.setDate(date.getDate() + days);
    return date;
  };

  // 下一个单词
  const nextWord = () => {
    if (currentIndex < reviewWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
      resetState();
    } else {
      toast.success('🎉 复习完成！');
      confetti();
      loadReviewWords();
    }
  };

  const resetState = () => {
    setUserInput('');
    setShowAnswer(false);
    setIsCorrect(null);
    setShowHint(false);
  };

  // 虚拟键盘点击
  const handleKeyClick = (key) => {
    if (showAnswer) return;
    if (key === 'enter') {
      handleSubmit();
    } else if (key === 'backspace') {
      setUserInput(prev => prev.slice(0, -1));
    } else {
      setUserInput(prev => prev + key);
    }
  };

  if (reviewWords.length === 0) {
    return (
      <div className="study-container">
        <div className="study-card">
          <h2>🎉 太棒了！</h2>
          <p>目前没有需要复习的单词</p>
          <button className="nav-btn" onClick={() => window.location.reload()}>
            刷新
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="study-container">
      <div className="study-card">
        <div className="study-header">
          <h2>🔄 遗忘曲线复习</h2>
          <div className="progress-info">
            进度：{currentIndex + 1}/{reviewWords.length} | 正确率：
            {totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0}%
          </div>
          <div className="memory-level">
            记忆等级：{currentWord.memoryLevel || 1}/5
          </div>
        </div>

        <div className="word-display">
          <div className="phonetic">{currentWord.phonetic || ''}</div>
          <div className="translation">{currentWord.translation}</div>
          {showHint && (
            <div className="example-sentence">
              {currentWord.example || '暂无例句'}
            </div>
          )}
        </div>

        <div className="spelling-section">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="请输入单词拼写"
            className={`spelling-input ${showAnswer ? (isCorrect ? 'correct' : 'error') : ''}`}
            disabled={showAnswer}
            autoComplete="off"
          />

          <div className="hint-info">
            单词长度：{currentWord.word.length} 个字母
          </div>
        </div>

        <div className="button-group">
          <button
            className="hint-btn"
            onClick={() => setShowHint(true)}
            disabled={showAnswer}
          >
            💡 提示
          </button>

          {!showAnswer ? (
            <button className="submit-btn" onClick={handleSubmit}>
              提交
            </button>
          ) : (
            <button className="next-btn" onClick={nextWord}>
              下一个
            </button>
          )}
        </div>

        {/* 虚拟键盘 → 和考试模式完全一样 */}
        <div className="keyboard-container">
          {['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'].map(key => (
            <button key={key} className="key-btn" onClick={() => handleKeyClick(key)}>
              {key}
            </button>
          ))}
          <br />
          {['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'].map(key => (
            <button key={key} className="key-btn" onClick={() => handleKeyClick(key)}>
              {key}
            </button>
          ))}
          <br />
          {['z', 'x', 'c', 'v', 'b', 'n', 'm'].map(key => (
            <button key={key} className="key-btn" onClick={() => handleKeyClick(key)}>
              {key}
            </button>
          ))}
          <br />
          <button className="key-btn action-btn" onClick={() => handleKeyClick('backspace')}>
            删除
          </button>
          <button className="key-btn action-btn" onClick={() => handleKeyClick('enter')}>
            回车
          </button>
        </div>

        {showAnswer && (
          <div className={`answer-result ${isCorrect ? 'correct' : 'error'}`}>
            {isCorrect ? '✅ 回答正确！' : `❌ 正确答案：${currentWord.word}`}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpacedRepetition;