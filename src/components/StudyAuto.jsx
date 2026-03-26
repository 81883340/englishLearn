import React, { useState, useEffect } from 'react'
import Study from './Study'
import MobileExam from './MobileExam'

// 检测是否为移动设备
const isMobileDevice = () => {
  // 检测用户代理
  const userAgent = navigator.userAgent || navigator.vendor || window.opera

  // 移动设备关键词
  const mobileKeywords = [
    'Android', 'webOS', 'iPhone', 'iPad', 'iPod',
    'BlackBerry', 'IEMobile', 'Opera Mini',
    'Mobile', 'Tablet', 'Touch'
  ]

  const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword))

  // 检测触摸设备
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0

  // 检测屏幕宽度（小于 768px 视为移动设备）
  const isSmallScreen = window.innerWidth < 768

  return isMobileUA || (hasTouch && isSmallScreen)
}

function StudyAuto(props) {
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // 初始化时检测设备类型
    const mobile = isMobileDevice()
    setIsMobile(mobile)
    setMounted(true)

    // 监听窗口大小变化
    const handleResize = () => {
      setIsMobile(isMobileDevice())
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // 避免服务端渲染时的问题
  if (!mounted) {
    return null
  }

  // 移动设备显示 MobileExam，桌面端显示 Study
  if (isMobile) {
    return <MobileExam {...props} />
  }

  return <Study {...props} />
}

export default StudyAuto
