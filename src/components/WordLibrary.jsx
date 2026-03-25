import React, { useState, useEffect } from 'react'

// 技术术语翻译映射（备用）
const techTermsMap = {
  'font': '字体',
  'size': '大小',
  'fontsize': '字体大小',
  'color': '颜色',
  'background': '背景',
  'width': '宽度',
  'height': '高度',
  'margin': '外边距',
  'padding': '内边距',
  'border': '边框',
  'display': '显示',
  'flex': '弹性布局',
  'grid': '网格',
  'position': '定位',
  'absolute': '绝对定位',
  'relative': '相对定位',
  'fixed': '固定定位',
  'overflow': '溢出',
  'text': '文本',
  'align': '对齐',
  'justify': '两端对齐',
  'center': '居中',
  'left': '左对齐',
  'right': '右对齐',
  'apple': '苹果',
  'banana': '香蕉',
  'orange': '橙子',
  'hello': '你好',
  'world': '世界',
  'computer': '电脑',
  'study': '学习',
  'book': '书',
  'student': '学生',
  'teacher': '老师',
  'school': '学校',
  'home': '家',
  'family': '家庭',
  'friend': '朋友',
  'love': '爱',
  'happy': '快乐',
  'sad': '悲伤',
  'good': '好的',
  'bad': '坏的',
  'big': '大的',
  'small': '小的',
  'beautiful': '美丽的',
  'important': '重要的',
  'develop': '发展',
  'language': '语言',
  'english': '英语',
  'chinese': '中文',
  'learn': '学习',
  'practice': '练习',
  'remember': '记住',
  'forget': '忘记',
  'understand': '理解',
  'think': '思考',
  'speak': '说',
  'listen': '听',
  'read': '读',
  'write': '写',
  'word': '单词',
  'sentence': '句子',
  'paragraph': '段落',
  'text': '文本',
  'page': '页面',
  'example': '例子',
  'meaning': '意思',
  'definition': '定义',
  'pronunciation': '发音',
  'grammar': '语法',
  'vocabulary': '词汇',
  'dictionary': '字典',
  'test': '测试',
  'exam': '考试',
  'score': '分数',
  'pass': '通过',
  'fail': '失败',
  'success': '成功',
  'failure': '失败',
  'try': '尝试',
  'help': '帮助',
  'thank': '感谢',
  'please': '请',
  'sorry': '抱歉',
  'excuse': '原谅',
  'mistake': '错误',
  'correct': '正确',
  'wrong': '错误',
  'right': '对',
  'left': '左',
  'up': '上',
  'down': '下',
  'front': '前面',
  'back': '后面',
  'inside': '内部',
  'outside': '外部',
  'top': '顶部',
  'bottom': '底部',
  'middle': '中间',
  'center': '中心',
  'side': '侧面',
  'corner': '角落',
  'edge': '边缘',
  'line': '线',
  'shape': '形状',
  'color': '颜色',
  'size': '大小',
  'weight': '重量',
  'height': '高度',
  'width': '宽度',
  'length': '长度',
  'area': '面积',
  'volume': '体积',
  'temperature': '温度',
  'weather': '天气',
  'season': '季节',
  'month': '月',
  'week': '周',
  'day': '天',
  'hour': '小时',
  'minute': '分钟',
  'second': '秒',
  'time': '时间',
  'date': '日期',
  'year': '年',
  'today': '今天',
  'tomorrow': '明天',
  'yesterday': '昨天',
  'morning': '早晨',
  'afternoon': '下午',
  'evening': '晚上',
  'night': '夜晚',
  'sun': '太阳',
  'moon': '月亮',
  'star': '星星',
  'sky': '天空',
  'cloud': '云',
  'rain': '雨',
  'snow': '雪',
  'wind': '风',
  'storm': '暴风雨',
  'earth': '地球',
  'water': '水',
  'fire': '火',
  'air': '空气',
  'light': '光',
  'dark': '黑暗',
  'tree': '树',
  'flower': '花',
  'grass': '草',
  'leaf': '叶子',
  'fruit': '水果',
  'vegetable': '蔬菜',
  'food': '食物',
  'drink': '饮料',
  'meat': '肉',
  'fish': '鱼',
  'chicken': '鸡',
  'beef': '牛肉',
  'pork': '猪肉',
  'bread': '面包',
  'rice': '米饭',
  'milk': '牛奶',
  'egg': '蛋',
  'sugar': '糖',
  'salt': '盐',
  'oil': '油',
  'tea': '茶',
  'coffee': '咖啡',
  'juice': '果汁',
  'water': '水',
  'glass': '玻璃',
  'cup': '杯子',
  'plate': '盘子',
  'bowl': '碗',
  'spoon': '勺子',
  'fork': '叉子',
  'knife': '刀',
  'chair': '椅子',
  'table': '桌子',
  'bed': '床',
  'desk': '桌子',
  'shelf': '架子',
  'room': '房间',
  'house': '房子',
  'building': '建筑',
  'city': '城市',
  'town': '城镇',
  'village': '村庄',
  'country': '国家',
  'road': '路',
  'street': '街道',
  'bridge': '桥',
  'river': '河',
  'lake': '湖',
  'sea': '海',
  'ocean': '海洋',
  'mountain': '山',
  'hill': '小山',
  'valley': '山谷',
  'forest': '森林',
  'park': '公园',
  'garden': '花园',
  'farm': '农场',
  'field': '田野',
  'animal': '动物',
  'bird': '鸟',
  'dog': '狗',
  'cat': '猫',
  'horse': '马',
  'cow': '牛',
  'sheep': '羊',
  'pig': '猪',
  'chicken': '鸡',
  'duck': '鸭',
  'fish': '鱼',
  'insect': '昆虫',
  'snake': '蛇',
  'tiger': '老虎',
  'lion': '狮子',
  'bear': '熊',
  'elephant': '大象',
  'monkey': '猴子',
  'giraffe': '长颈鹿',
  'zebra': '斑马',
  'panda': '熊猫',
  'kangaroo': '袋鼠',
  'rabbit': '兔子',
  'fox': '狐狸',
  'wolf': '狼',
  'deer': '鹿',
  'horse': '马',
  'donkey': '驴',
  'mouse': '老鼠',
  'hamster': '仓鼠',
  'goldfish': '金鱼',
  'turtle': '乌龟',
  'frog': '青蛙',
  'butterfly': '蝴蝶',
  'bee': '蜜蜂',
  'ant': '蚂蚁',
  'spider': '蜘蛛',
  'fly': '苍蝇',
  'mosquito': '蚊子',
  'beetle': '甲虫',
  'ladybug': '瓢虫',
  'dragonfly': '蜻蜓',
  'grasshopper': '蚱蜢',
  'cricket': '蟋蟀',
  'centipede': '蜈蚣',
  'scorpion': '蝎子',
  'snake': '蛇',
  'lizard': '蜥蜴',
  'chameleon': '变色龙',
  'crocodile': '鳄鱼',
  'alligator': '短吻鳄',
  'shark': '鲨鱼',
  'whale': '鲸鱼',
  'dolphin': '海豚',
  'seal': '海豹',
  'penguin': '企鹅',
  'octopus': '章鱼',
  'squid': '鱿鱼',
  'jellyfish': '水母',
  'starfish': '海星',
  'coral': '珊瑚',
  'shell': '贝壳',
  'pearl': '珍珠',
  'gem': '宝石',
  'diamond': '钻石',
  'gold': '金',
  'silver': '银',
  'copper': '铜',
  'iron': '铁',
  'steel': '钢',
  'metal': '金属',
  'plastic': '塑料',
  'glass': '玻璃',
  'wood': '木头',
  'paper': '纸',
  'cloth': '布',
  'leather': '皮革',
  'stone': '石头',
  'sand': '沙子',
  'dust': '灰尘',
  'dirt': '泥土',
  'soil': '土壤',
  'earth': '大地',
  'planet': '行星',
  'star': '星星',
  'galaxy': '星系',
  'universe': '宇宙',
  'space': '空间',
  'time': '时间',
  'energy': '能量',
  'force': '力量',
  'power': '力量',
  'strength': '强度',
  'weakness': '弱点',
  'ability': '能力',
  'skill': '技能',
  'talent': '天赋',
  'knowledge': '知识',
  'wisdom': '智慧',
  'intelligence': '智力',
  'mind': '思想',
  'brain': '大脑',
  'heart': '心脏',
  'body': '身体',
  'hand': '手',
  'foot': '脚',
  'eye': '眼睛',
  'ear': '耳朵',
  'nose': '鼻子',
  'mouth': '嘴巴',
  'face': '脸',
  'head': '头',
  'hair': '头发',
  'skin': '皮肤',
  'blood': '血液',
  'bone': '骨头',
  'muscle': '肌肉',
  'nerve': '神经',
  'organ': '器官',
  'system': '系统',
  'cell': '细胞',
  'atom': '原子',
  'molecule': '分子',
  'electron': '电子',
  'proton': '质子',
  'neutron': '中子',
  'physics': '物理',
  'chemistry': '化学',
  'biology': '生物',
  'mathematics': '数学',
  'geography': '地理',
  'history': '历史',
  'literature': '文学',
  'art': '艺术',
  'music': '音乐',
  'sport': '运动',
  'game': '游戏',
  'play': '玩',
  'work': '工作',
  'job': '工作',
  'career': '职业',
  'business': '商业',
  'company': '公司',
  'office': '办公室',
  'factory': '工厂',
  'shop': '商店',
  'market': '市场',
  'store': '商店',
  'restaurant': '餐厅',
  'hotel': '酒店',
  'hospital': '医院',
  'bank': '银行',
  'school': '学校',
  'university': '大学',
  'college': '学院',
  'library': '图书馆',
  'museum': '博物馆',
  'theater': '剧院',
  'cinema': '电影院',
  'park': '公园',
  'beach': '海滩',
  'pool': '游泳池',
  'gym': '健身房',
  'station': '车站',
  'airport': '机场',
  'port': '港口',
  'police': '警察',
  'government': '政府',
  'law': '法律',
  'rule': '规则',
  'policy': '政策',
  'plan': '计划',
  'project': '项目',
  'program': '程序',
  'system': '系统',
  'network': '网络',
  'internet': '互联网',
  'computer': '电脑',
  'phone': '电话',
  'mobile': '手机',
  'television': '电视',
  'radio': '收音机',
  'camera': '相机',
  'video': '视频',
  'audio': '音频',
  'sound': '声音',
  'voice': '声音',
  'speech': '演讲',
  'language': '语言',
  'letter': '字母',
  'number': '数字',
  'symbol': '符号',
  'sign': '标志',
  'signal': '信号',
  'message': '消息',
  'information': '信息',
  'data': '数据',
  'file': '文件',
  'document': '文档',
  'record': '记录',
  'history': '历史',
  'story': '故事',
  'news': '新闻',
  'report': '报告',
  'article': '文章',
  'book': '书',
  'magazine': '杂志',
  'newspaper': '报纸',
  'website': '网站',
  'blog': '博客',
  'social': '社交',
  'media': '媒体',
  'communication': '交流',
  'connection': '连接',
  'relationship': '关系',
  'friendship': '友谊',
  'love': '爱',
  'marriage': '婚姻',
  'family': '家庭',
  'parent': '父母',
  'child': '孩子',
  'brother': '兄弟',
  'sister': '姐妹',
  'son': '儿子',
  'daughter': '女儿',
  'father': '父亲',
  'mother': '母亲',
  'grandfather': '祖父',
  'grandmother': '祖母',
  'uncle': '叔叔',
  'aunt': '阿姨',
  'cousin': '表兄弟',
  'nephew': '侄子',
  'niece': '侄女',
  'husband': '丈夫',
  'wife': '妻子',
  'partner': '伙伴',
  'colleague': '同事',
  'classmate': '同学',
  'roommate': '室友',
  'neighbor': '邻居',
  'stranger': '陌生人',
  'enemy': '敌人',
  'rival': '竞争对手',
  'opponent': '对手',
  'ally': '盟友',
  'supporter': '支持者',
  'follower': '追随者',
  'leader': '领导者',
  'manager': '经理',
  'director': '总监',
  'boss': '老板',
  'employee': '员工',
  'worker': '工人',
  'staff': '员工',
  'team': '团队',
  'group': '团队',
  'organization': '组织',
  'community': '社区',
  'society': '社会',
  'culture': '文化',
  'tradition': '传统',
  'custom': '习俗',
  'habit': '习惯',
  'routine': '例行公事',
  'lifestyle': '生活方式',
  'attitude': '态度',
  'behavior': '行为',
  'character': '性格',
  'personality': '个性',
  'temperament': '气质',
  'mood': '情绪',
  'emotion': '情感',
  'feeling': '感觉',
  'sensation': '感觉',
  'perception': '感知',
  'thought': '思想',
  'idea': '想法',
  'concept': '概念',
  'theory': '理论',
  'hypothesis': '假设',
  'experiment': '实验',
  'research': '研究',
  'investigation': '调查',
  'analysis': '分析',
  'conclusion': '结论',
  'result': '结果',
  'outcome': '结果',
  'effect': '效果',
  'impact': '影响',
  'influence': '影响',
  'change': '变化',
  'development': '发展',
  'growth': '增长',
  'progress': '进步',
  'improvement': '改善',
  'success': '成功',
  'achievement': '成就',
  'accomplishment': '成就',
  'goal': '目标',
  'objective': '目标',
  'purpose': '目的',
  'reason': '原因',
  'cause': '原因',
  'basis': '基础',
  'foundation': '基础',
  'principle': '原则',
  'rule': '规则',
  'law': '法律',
  'regulation': '规定',
  'policy': '政策',
  'strategy': '策略',
  'tactic': '战术',
  'method': '方法',
  'technique': '技术',
  'skill': '技能',
  'ability': '能力',
  'capacity': '能力',
  'potential': '潜力',
  'opportunity': '机会',
  'possibility': '可能性',
  'probability': '概率',
  'likelihood': '可能性',
  'chance': '机会',
  'risk': '风险',
  'danger': '危险',
  'threat': '威胁',
  'problem': '问题',
  'issue': '问题',
  'difficulty': '困难',
  'challenge': '挑战',
  'obstacle': '障碍',
  'barrier': '障碍',
  'hindrance': '阻碍',
  'limit': '限制',
  'constraint': '约束',
  'restriction': '限制',
  'condition': '条件',
  'requirement': '要求',
  'standard': '标准',
  'criterion': '标准',
  'measure': '措施',
  'step': '步骤',
  'stage': '阶段',
  'phase': '阶段',
  'process': '过程',
  'procedure': '程序',
  'system': '系统',
  'structure': '结构',
  'organization': '组织',
  'arrangement': '安排',
  'order': '顺序',
  'sequence': '序列',
  'series': '系列',
  'set': '集合',
  'collection': '集合',
  'group': '组',
  'category': '类别',
  'type': '类型',
  'kind': '种类',
  'sort': '种类',
  'class': '类别',
  'species': '物种',
  'variety': '种类',
  'version': '版本',
  'edition': '版本',
  'copy': '副本',
  'original': '原件',
  'duplicate': '副本',
  'sample': '样品',
  'example': '例子',
  'model': '模型',
  'pattern': '模式',
  'design': '设计',
  'plan': '计划',
  'scheme': '计划',
  'project': '项目',
  'proposal': '提议',
  'suggestion': '建议',
  'recommendation': '推荐',
  'advice': '建议',
  'tip': '提示',
  'hint': '提示',
  'clue': '线索',
  'sign': '迹象',
  'symptom': '症状',
  'evidence': '证据',
  'proof': '证明',
  'fact': '事实',
  'truth': '真相',
  'reality': '现实',
  'fiction': '小说',
  'fantasy': '幻想',
  'dream': '梦',
  'nightmare': '噩梦',
  'hope': '希望',
  'wish': '愿望',
  'desire': '欲望',
  'need': '需求',
  'want': '想要',
  'require': '需要',
  'demand': '要求',
  'supply': '供应',
  'provide': '提供',
  'offer': '提供',
  'give': '给予',
  'take': '拿',
  'receive': '接收',
  'accept': '接受',
  'refuse': '拒绝',
  'reject': '拒绝',
  'deny': '否认',
  'admit': '承认',
  'confess': '坦白',
  'tell': '告诉',
  'say': '说',
  'speak': '说话',
  'talk': '谈话',
  'discuss': '讨论',
  'debate': '辩论',
  'argue': '争论',
  'agree': '同意',
  'disagree': '不同意',
  'accept': '接受',
  'reject': '拒绝',
  'approve': '批准',
  'disapprove': '不批准',
  'support': '支持',
  'oppose': '反对',
  'favor': '赞成',
  'object': '反对',
  'encourage': '鼓励',
  'discourage': '阻止',
  'motivate': '激励',
  'inspire': '激发',
  'persuade': '说服',
  'convince': '使确信',
  'influence': '影响',
  'affect': '影响',
  'change': '改变',
  'modify': '修改',
  'adjust': '调整',
  'adapt': '适应',
  'adopt': '采用',
  'use': '使用',
  'utilize': '利用',
  'apply': '应用',
  'employ': '雇用',
  'operate': '操作',
  'control': '控制',
  'manage': '管理',
  'direct': '指导',
  'guide': '引导',
  'lead': '领导',
  'follow': '跟随',
  'obey': '服从',
  'serve': '服务',
  'help': '帮助',
  'assist': '协助',
  'support': '支持',
  'protect': '保护',
  'defend': '防御',
  'guard': '守卫',
  'save': '拯救',
  'rescue': '救援',
  'heal': '治愈',
  'cure': '治疗',
  'treat': '对待',
  'care': '关心',
  'love': '爱',
  'hate': '恨',
  'like': '喜欢',
  'dislike': '不喜欢',
  'prefer': '偏好',
  'enjoy': '享受',
  'appreciate': '欣赏',
  'value': '重视',
  'respect': '尊重',
  'admire': '钦佩',
  'trust': '信任',
  'believe': '相信',
  'doubt': '怀疑',
  'suspect': '怀疑',
  'wonder': '想知道',
  'ask': '问',
  'answer': '回答',
  'reply': '回复',
  'respond': '回应',
  'react': '反应',
  'behave': '表现',
  'act': '行动',
  'do': '做',
  'make': '制造',
  'create': '创造',
  'build': '建造',
  'construct': '构造',
  'design': '设计',
  'develop': '开发',
  'produce': '生产',
  'manufacture': '制造',
  'grow': '生长',
  'raise': '抚养',
  'feed': '喂养',
  'nourish': '滋养',
  'sustain': '维持',
  'maintain': '保持',
  'keep': '保持',
  'hold': '保持',
  'carry': '携带',
  'bring': '带来',
  'take': '拿',
  'fetch': '取',
  'deliver': '递送',
  'send': '发送',
  'receive': '接收',
  'transfer': '转移',
  'move': '移动',
  'shift': '移动',
  'change': '改变',
  'replace': '替换',
  'substitute': '替代',
  'exchange': '交换',
  'trade': '贸易',
  'buy': '买',
  'sell': '卖',
  'purchase': '购买',
  'pay': '支付',
  'spend': '花费',
  'cost': '花费',
  'price': '价格',
  'value': '价值',
  'worth': '价值',
  'cheap': '便宜',
  'expensive': '昂贵',
  'free': '免费',
  'charged': '收费',
  'quality': '质量',
  'quantity': '数量',
  'amount': '数量',
  'number': '数字',
  'count': '计数',
  'calculate': '计算',
  'measure': '测量',
  'estimate': '估计',
  'predict': '预测',
  'forecast': '预报',
  'expect': '期望',
  'anticipate': '预期',
  'wait': '等待',
  'hope': '希望',
  'wish': '希望',
  'dream': '梦想',
  'imagine': '想象',
  'create': '创造',
  'invent': '发明',
  'discover': '发现',
  'find': '找到',
  'search': '搜索',
  'look': '看',
  'see': '看见',
  'watch': '观看',
  'observe': '观察',
  'notice': '注意',
  'realize': '意识到',
  'understand': '理解',
  'comprehend': '领会',
  'grasp': '抓住',
  'learn': '学习',
  'study': '研究',
  'teach': '教',
  'train': '训练',
  'educate': '教育',
  'inform': '通知',
  'communicate': '交流',
  'express': '表达',
  'describe': '描述',
  'explain': '解释',
  'clarify': '澄清',
  'illustrate': '说明',
  'demonstrate': '演示',
  'show': '展示',
  'display': '显示',
  'present': '呈现',
  'represent': '代表',
  'symbolize': '象征',
  'signify': '表示',
  'mean': '意味着',
  'indicate': '指示',
  'suggest': '建议',
  'imply': '暗示',
  'infer': '推断',
  'conclude': '得出结论',
  'deduce': '推导',
  'reason': '推理',
  'think': '思考',
  'consider': '考虑',
  'weigh': '权衡',
  'evaluate': '评估',
  'assess': '评估',
  'judge': '判断',
  'decide': '决定',
  'choose': '选择',
  'select': '选择',
  'pick': '挑选',
  'prefer': '偏好',
  'favor': '偏爱',
  'recommend': '推荐',
  'suggest': '建议',
  'propose': '提议',
  'offer': '提供',
  'grant': '授予',
  'allow': '允许',
  'permit': '许可',
  'authorize': '授权',
  'approve': '批准',
  'accept': '接受',
  'refuse': '拒绝',
  'deny': '否认',
  'reject': '拒绝',
  'decline': '谢绝',
  'dismiss': '解雇',
  'fire': '解雇',
  'hire': '雇用',
  'employ': '雇佣',
  'recruit': '招聘',
  'interview': '面试',
  'apply': '申请',
  'candidate': '候选人',
  'position': '职位',
  'role': '角色',
  'function': '功能',
  'purpose': '目的',
  'goal': '目标',
  'objective': '目标',
  'target': '目标',
  'aim': '目标',
  'ambition': '抱负',
  'aspiration': '抱负',
  'desire': '欲望',
  'wish': '愿望',
  'hope': '希望',
  'dream': '梦想',
  'fantasy': '幻想',
  'imagination': '想象力',
  'creativity': '创造力',
  'innovation': '创新',
  'originality': '原创性',
  'uniqueness': '独特性',
  'distinctiveness': '特色',
  'individuality': '个性',
  'personality': '性格',
  'character': '品格',
  'nature': '本性',
  'essence': '本质',
  'substance': '实质',
  'reality': '现实',
  'existence': '存在',
  'life': '生命',
  'death': '死亡',
  'birth': '出生',
  'growth': '成长',
  'aging': '衰老',
  'health': '健康',
  'disease': '疾病',
  'illness': '疾病',
  'sickness': '疾病',
  'injury': '伤害',
  'wound': '伤口',
  'pain': '疼痛',
  'suffering': '痛苦',
  'healing': '治愈',
  'recovery': '恢复',
  'rehabilitation': '康复',
  'treatment': '治疗',
  'therapy': '疗法',
  'medicine': '药物',
  'drug': '药物',
  'medication': '药物',
  'remedy': '补救',
  'cure': '治愈',
  'prevention': '预防',
  'protection': '保护',
  'safety': '安全',
  'security': '安全',
  'defense': '防御',
  'guard': '守卫',
  'shield': '盾牌',
  'barrier': '屏障',
  'obstacle': '障碍',
  'hindrance': '阻碍',
  'difficulty': '困难',
  'problem': '问题',
  'challenge': '挑战',
  'test': '测试',
  'trial': '试验',
  'experiment': '实验',
  'experience': '经验',
  'practice': '练习',
  'exercise': '锻炼',
  'training': '训练',
  'education': '教育',
  'learning': '学习',
  'study': '学习',
  'knowledge': '知识',
  'information': '信息',
  'data': '数据',
  'fact': '事实',
  'truth': '真相',
  'wisdom': '智慧',
  'insight': '洞察力',
  'understanding': '理解',
  'comprehension': '理解',
  'awareness': '意识',
  'consciousness': '意识',
  'mind': '思想',
  'thought': '思想',
  'thinking': '思考',
  'reasoning': '推理',
  'logic': '逻辑',
  'rationality': '理性',
  'intelligence': '智力',
  'cleverness': '聪明',
  'smartness': '聪明',
  'wisdom': '智慧',
  'knowledge': '知识',
  'expertise': '专业知识',
  'skill': '技能',
  'ability': '能力',
  'talent': '天赋',
  'gift': '天赋',
  'capacity': '容量',
  'potential': '潜力',
  'possibility': '可能性',
  'opportunity': '机会',
  'chance': '机会',
  'luck': '运气',
  'fortune': '财富',
  'destiny': '命运',
  'fate': '命运',
  'luck': '运气',
  'chance': '机会',
  'coincidence': '巧合',
  'accident': '事故',
  'incident': '事件',
  'event': '事件',
  'occurrence': '发生',
  'happening': '事情',
  'phenomenon': '现象',
  'situation': '情况',
  'circumstance': '情况',
  'condition': '条件',
  'state': '状态',
  'status': '状态',
  'position': '位置',
  'location': '地点',
  'place': '地方',
  'spot': '地点',
  'area': '区域',
  'region': '地区',
  'territory': '领土',
  'land': '土地',
  'ground': '地面',
  'soil': '土壤',
  'earth': '地球',
  'world': '世界',
  'globe': '地球仪',
  'universe': '宇宙',
  'cosmos': '宇宙',
  'space': '空间',
  'void': '虚空',
  'nothing': '无',
  'everything': '一切',
  'all': '所有',
  'none': '无',
  'some': '一些',
  'any': '任何',
  'every': '每一个',
  'each': '每个',
  'both': '两者',
  'neither': '都不',
  'either': '任一',
  'other': '其他',
  'another': '另一个',
  'same': '相同',
  'different': '不同',
  'similar': '相似',
  'like': '像',
  'unlike': '不像',
  'equal': '相等',
  'unequal': '不等',
  'same': '相同',
  'identical': '相同',
  'equivalent': '等价',
  'comparable': '可比较',
  'related': '相关',
  'connected': '连接',
  'associated': '关联',
  'linked': '链接',
  'tied': '系',
  'bound': '绑定',
  'attached': '附',
  'joined': '加入',
  'combined': '组合',
  'united': '联合',
  'divided': '分开',
  'separated': '分离',
  'isolated': '隔离',
  'alone': '独自',
  'together': '一起',
  'apart': '分开',
  'away': '离开',
  'near': '近',
  'far': '远',
  'close': '近',
  'distant': '远',
  'adjacent': '相邻',
  'next': '下一个',
  'previous': '前一个',
  'before': '之前',
  'after': '之后',
  'during': '期间',
  'while': '当',
  'when': '当',
  'where': '哪里',
  'why': '为什么',
  'how': '如何',
  'what': '什么',
  'who': '谁',
  'which': '哪个',
  'that': '那个',
  'this': '这个',
  'these': '这些',
  'those': '那些',
  'it': '它',
  'he': '他',
  'she': '她',
  'they': '他们',
  'we': '我们',
  'you': '你',
  'i': '我',
  'my': '我的',
  'your': '你的',
  'his': '他的',
  'her': '她的',
  'its': '它的',
  'our': '我们的',
  'their': '他们的',
  'me': '我',
  'him': '他',
  'us': '我们',
  'them': '他们',
  'be': '是',
  'have': '有',
  'do': '做',
  'say': '说',
  'get': '得到',
  'make': '制造',
  'go': '去',
  'know': '知道',
  'take': '拿',
  'see': '看见',
  'come': '来',
  'think': '思考',
  'look': '看',
  'want': '想要',
  'give': '给',
  'use': '使用',
  'find': '找到',
  'tell': '告诉',
  'ask': '问',
  'work': '工作',
  'seem': '似乎',
  'feel': '感觉',
  'try': '尝试',
  'leave': '离开',
  'call': '叫',
  'good': '好',
  'new': '新',
  'first': '第一',
  'last': '最后',
  'long': '长',
  'great': '伟大',
  'little': '小',
  'own': '自己的',
  'other': '其他',
  'old': '老',
  'right': '对',
  'big': '大',
  'high': '高',
  'different': '不同',
  'small': '小',
  'large': '大',
  'next': '下一个',
  'early': '早',
  'young': '年轻',
  'important': '重要',
  'few': '少',
  'public': '公共',
  'bad': '坏',
  'same': '相同',
  'able': '能够'
};

// 翻译API池 - 优先使用Google翻译API
const translationAPIs = [
  // Google Translate (免费，有速率限制但质量好)
  {
    name: 'GoogleTranslate',
    fn: async (text) => {
      try {
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=${encodeURIComponent(text)}`);
        const data = await res.json();
        if (data && data[0]) {
          return data[0].map(item => item[0]).join('');
        }
        return text;
      } catch (error) {
        console.error('Google翻译失败:', error);
        return text;
      }
    }
  },
  // MyMemory (5000 chars/day - 备用)
  {
    name: 'MyMemory',
    fn: async (text) => {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh-CN`);
      const data = await res.json();
      return data.responseData?.translatedText || text;
    }
  }
];

let currentAPIIndex = 0;

// 免费翻译接口（优先本地映射，然后Google翻译API）
const translate = async (text) => {
  if (!text) return "";

  // 优先检查技术术语映射
  const textLower = text.toLowerCase();
  if (techTermsMap[textLower]) {
    console.log(`使用本地映射: "${text}" -> "${techTermsMap[textLower]}"`);
    return techTermsMap[textLower];
  }

  // 优先使用Google翻译API
  const googleAPI = translationAPIs[0];
  try {
    console.log(`优先使用 ${googleAPI.name} API翻译: "${text}"`);
    const translated = await googleAPI.fn(text);
    console.log(`${googleAPI.name} 翻译结果: "${text}" -> "${translated}"`);
    return translated;
  } catch (error) {
    console.error(`${googleAPI.name} 翻译失败:`, error);
  }

  // Google失败，尝试MyMemory
  const myMemoryAPI = translationAPIs[1];
  try {
    console.log(`尝试使用 ${myMemoryAPI.name} API翻译: "${text}"`);
    const translated = await myMemoryAPI.fn(text);
    console.log(`${myMemoryAPI.name} 翻译结果: "${text}" -> "${translated}"`);
    return translated;
  } catch (error) {
    console.error(`${myMemoryAPI.name} 翻译失败:`, error);
  }

  // 所有API都失败，返回原文
  console.warn(`所有翻译API都失败，返回原文: "${text}"`);
  return text;
};

// 获取单词信息（音标、释义、例句）- 使用 Free Dictionary API（包含翻译）
const fetchWordInfo = async (word) => {
  console.log(`开始获取单词信息: ${word}`);
  const wordLower = word.toLowerCase();

  try {
    // 使用 Free Dictionary API，包含翻译、音标、例句
    // 正确的URL格式: https://freedictionaryapi.com/api/v1/entries/en/{word}
    const response = await fetch(`https://freedictionaryapi.com/api/v1/entries/en/${word}`)

    if (response.ok) {
      console.log(`字典API请求成功: ${word}`);
      const data = await response.json()

      if (data && data.entries && data.entries.length > 0) {
        const entry = data.entries[0]

        // 获取音标
        let phonetic = ''
        if (entry.pronunciations && entry.pronunciations.length > 0) {
          const phoneticObj = entry.pronunciations.find(p => p.type === 'IPA') || entry.pronunciations[0]
          phonetic = phoneticObj.text || ''
          console.log(`找到音标: "${phonetic}"`)
        }

        // 获取第一个含义和例句
        let englishDefinition = ''
        let exampleSentence = ''

        if (entry.senses && entry.senses.length > 0) {
          const firstSense = entry.senses[0]
          englishDefinition = firstSense.definition || ''

          // 获取例句
          if (firstSense.examples && firstSense.examples.length > 0) {
            exampleSentence = firstSense.examples[0]
            console.log(`找到例句: "${exampleSentence}"`)
          } else {
            // 如果第一个含义没有例句，查找其他含义
            for (const sense of entry.senses) {
              if (sense.examples && sense.examples.length > 0) {
                exampleSentence = sense.examples[0]
                console.log(`在其他含义中找到例句: "${exampleSentence}"`)
                break
              }
            }
          }

          // 获取中文翻译
          let chineseTranslation = ''
          if (firstSense.translations && firstSense.translations.length > 0) {
            // 查找中文翻译
            const zhTranslation = firstSense.translations.find(t => t.language && (t.language.code === 'zh' || t.language.name === 'Chinese'))
            if (zhTranslation) {
              chineseTranslation = zhTranslation.word
              console.log(`找到中文翻译: "${chineseTranslation}"`)
            }
          }

          // 如果第一个含义没有中文翻译，查找其他含义
          if (!chineseTranslation) {
            for (const sense of entry.senses) {
              if (sense.translations && sense.translations.length > 0) {
                const zhTranslation = sense.translations.find(t => t.language && (t.language.code === 'zh' || t.language.name === 'Chinese'))
                if (zhTranslation) {
                  chineseTranslation = zhTranslation.word
                  console.log(`在其他含义中找到中文翻译: "${chineseTranslation}"`)
                  break
                }
              }
              if (chineseTranslation) break
            }
          }

          console.log(`字典API返回 - 音标: "${phonetic}", 英文释义: "${englishDefinition.substring(0, 50)}...", 中文: "${chineseTranslation}", 例句: "${exampleSentence || '无'}"`)

          // 如果API没有返回中文翻译，使用翻译API
          let chineseMeaning = chineseTranslation
          if (!chineseMeaning) {
            console.log(`API未返回中文翻译，使用翻译API`)
            chineseMeaning = await translate(word)
          }

          console.log(`单词 ${word} 最终结果:`, {
            phonetic,
            englishDefinition,
            chineseMeaning,
            exampleSentence
          });

          return {
            word: wordLower,
            phonetic,
            englishDefinition,
            chineseMeaning,
            example: exampleSentence || `${word} - example sentence`
          }
        }
      }
    } else {
      console.log(`字典API请求失败 (${response.status}): ${word}`);
    }

    // 如果字典API没有返回数据，使用翻译API
    console.log(`字典API无数据，使用翻译API翻译单词: "${word}"`)
    const chineseMeaning = await translate(word);

    return {
      word: wordLower,
      phonetic: '',
      englishDefinition: word,
      chineseMeaning,
      example: `${word} - example sentence`
    }
  } catch (error) {
    console.error('获取单词信息失败:', error)
    // 即使出错也返回基本结构
    let chineseMeaning = techTermsMap[wordLower] || word;
    return {
      word: wordLower,
      phonetic: '',
      englishDefinition: word,
      chineseMeaning,
      example: `${word} - example sentence`
    }
  }
}

// 简单的中文释义映射（备用方案）
const getChineseMeaning = async (word) => {
  const commonWords = {
    'apple': '苹果',
    'banana': '香蕉',
    'orange': '橙子',
    'hello': '你好',
    'world': '世界',
    'computer': '电脑',
    'study': '学习',
    'book': '书',
    'student': '学生',
    'teacher': '老师',
    'school': '学校',
    'home': '家',
    'family': '家庭',
    'friend': '朋友',
    'love': '爱',
    'happy': '快乐',
    'sad': '悲伤',
    'good': '好的',
    'bad': '坏的',
    'big': '大的',
    'small': '小的',
    'beautiful': '美丽的',
    'important': '重要的',
    'develop': '发展',
    'language': '语言',
    'english': '英语',
    'chinese': '中文',
    'learn': '学习',
    'practice': '练习',
    'remember': '记住',
    'forget': '忘记',
    'understand': '理解',
    'think': '思考',
    'speak': '说',
    'listen': '听',
    'read': '读',
    'write': '写',
    'word': '单词',
    'sentence': '句子',
    'paragraph': '段落',
    'text': '文本',
    'page': '页面',
    'example': '例子',
    'meaning': '意思',
    'definition': '定义',
    'pronunciation': '发音',
    'grammar': '语法',
    'vocabulary': '词汇',
    'dictionary': '字典',
    'test': '测试',
    'exam': '考试',
    'score': '分数',
    'pass': '通过',
    'fail': '失败',
    'success': '成功',
    'failure': '失败',
    'try': '尝试',
    'help': '帮助',
    'thank': '感谢',
    'please': '请',
    'sorry': '抱歉',
    'excuse': '原谅',
    'mistake': '错误',
    'correct': '正确',
    'wrong': '错误',
    'right': '对',
    'left': '左',
    'up': '上',
    'down': '下',
    'front': '前面',
    'back': '后面',
    'inside': '内部',
    'outside': '外部',
    'top': '顶部',
    'bottom': '底部',
    'middle': '中间',
    'center': '中心',
    'side': '侧面',
    'corner': '角落',
    'edge': '边缘',
    'line': '线',
    'shape': '形状',
    'color': '颜色',
    'size': '大小',
    'weight': '重量',
    'height': '高度',
    'width': '宽度',
    'length': '长度',
    'area': '面积',
    'volume': '体积',
    'temperature': '温度',
    'weather': '天气',
    'season': '季节',
    'month': '月',
    'week': '周',
    'day': '天',
    'hour': '小时',
    'minute': '分钟',
    'second': '秒',
    'time': '时间',
    'date': '日期',
    'year': '年',
    'today': '今天',
    'tomorrow': '明天',
    'yesterday': '昨天',
    'morning': '早晨',
    'afternoon': '下午',
    'evening': '晚上',
    'night': '夜晚',
    'sun': '太阳',
    'moon': '月亮',
    'star': '星星',
    'sky': '天空',
    'cloud': '云',
    'rain': '雨',
    'snow': '雪',
    'wind': '风',
    'storm': '暴风雨',
    'earth': '地球',
    'water': '水',
    'fire': '火',
    'air': '空气',
    'light': '光',
    'dark': '黑暗',
    'tree': '树',
    'flower': '花',
    'grass': '草',
    'leaf': '叶子',
    'fruit': '水果',
    'vegetable': '蔬菜',
    'food': '食物',
    'drink': '饮料',
    'meat': '肉',
    'fish': '鱼',
    'chicken': '鸡',
    'beef': '牛肉',
    'pork': '猪肉',
    'bread': '面包',
    'rice': '米饭',
    'milk': '牛奶',
    'egg': '蛋',
    'sugar': '糖',
    'salt': '盐',
    'oil': '油',
    'tea': '茶',
    'coffee': '咖啡',
    'juice': '果汁',
    'water': '水',
    'glass': '玻璃',
    'cup': '杯子',
    'plate': '盘子',
    'bowl': '碗',
    'spoon': '勺子',
    'fork': '叉子',
    'knife': '刀',
    'chair': '椅子',
    'table': '桌子',
    'bed': '床',
    'desk': '桌子',
    'shelf': '架子',
    'room': '房间',
    'house': '房子',
    'building': '建筑',
    'city': '城市',
    'town': '城镇',
    'village': '村庄',
    'country': '国家',
    'road': '路',
    'street': '街道',
    'bridge': '桥',
    'river': '河',
    'lake': '湖',
    'sea': '海',
    'ocean': '海洋',
    'mountain': '山',
    'hill': '小山',
    'valley': '山谷',
    'forest': '森林',
    'park': '公园',
    'garden': '花园',
    'farm': '农场',
    'field': '田野',
    'animal': '动物',
    'bird': '鸟',
    'dog': '狗',
    'cat': '猫',
    'horse': '马',
    'cow': '牛',
    'sheep': '羊',
    'pig': '猪',
    'chicken': '鸡',
    'duck': '鸭',
    'fish': '鱼',
    'insect': '昆虫',
    'snake': '蛇',
    'tiger': '老虎',
    'lion': '狮子',
    'bear': '熊',
    'elephant': '大象',
    'monkey': '猴子',
    'giraffe': '长颈鹿',
    'zebra': '斑马',
    'panda': '熊猫',
    'kangaroo': '袋鼠',
    'rabbit': '兔子',
    'fox': '狐狸',
    'wolf': '狼',
    'deer': '鹿',
    'horse': '马',
    'donkey': '驴',
    'mouse': '老鼠',
    'hamster': '仓鼠',
    'goldfish': '金鱼',
    'turtle': '乌龟',
    'frog': '青蛙',
    'butterfly': '蝴蝶',
    'bee': '蜜蜂',
    'ant': '蚂蚁',
    'spider': '蜘蛛',
    'fly': '苍蝇',
    'mosquito': '蚊子',
    'beetle': '甲虫',
    'ladybug': '瓢虫',
    'dragonfly': '蜻蜓',
    'grasshopper': '蚱蜢',
    'cricket': '蟋蟀',
    'centipede': '蜈蚣',
    'scorpion': '蝎子',
    'snake': '蛇',
    'lizard': '蜥蜴',
    'chameleon': '变色龙',
    'crocodile': '鳄鱼',
    'alligator': '短吻鳄',
    'shark': '鲨鱼',
    'whale': '鲸鱼',
    'dolphin': '海豚',
    'seal': '海豹',
    'penguin': '企鹅',
    'octopus': '章鱼',
    'squid': '鱿鱼',
    'jellyfish': '水母',
    'starfish': '海星',
    'coral': '珊瑚',
    'shell': '贝壳',
    'pearl': '珍珠',
    'gem': '宝石',
    'diamond': '钻石',
    'gold': '金',
    'silver': '银',
    'copper': '铜',
    'iron': '铁',
    'steel': '钢',
    'metal': '金属',
    'plastic': '塑料',
    'glass': '玻璃',
    'wood': '木头',
    'paper': '纸',
    'cloth': '布',
    'leather': '皮革',
    'stone': '石头',
    'sand': '沙子',
    'dust': '灰尘',
    'dirt': '泥土',
    'soil': '土壤',
    'earth': '大地',
    'planet': '行星',
    'star': '星星',
    'galaxy': '星系',
    'universe': '宇宙',
    'space': '空间',
    'time': '时间',
    'energy': '能量',
    'force': '力量',
    'power': '力量',
    'strength': '强度',
    'weakness': '弱点',
    'ability': '能力',
    'skill': '技能',
    'talent': '天赋',
    'knowledge': '知识',
    'wisdom': '智慧',
    'intelligence': '智力',
    'mind': '思想',
    'brain': '大脑',
    'heart': '心脏',
    'body': '身体',
    'hand': '手',
    'foot': '脚',
    'eye': '眼睛',
    'ear': '耳朵',
    'nose': '鼻子',
    'mouth': '嘴巴',
    'face': '脸',
    'head': '头',
    'hair': '头发',
    'skin': '皮肤',
    'blood': '血液',
    'bone': '骨头',
    'muscle': '肌肉',
    'nerve': '神经',
    'organ': '器官',
    'system': '系统',
    'cell': '细胞',
    'atom': '原子',
    'molecule': '分子',
    'electron': '电子',
    'proton': '质子',
    'neutron': '中子',
    'physics': '物理',
    'chemistry': '化学',
    'biology': '生物',
    'mathematics': '数学',
    'geography': '地理',
    'history': '历史',
    'literature': '文学',
    'art': '艺术',
    'music': '音乐',
    'sport': '运动',
    'game': '游戏',
    'play': '玩',
    'work': '工作',
    'job': '工作',
    'career': '职业',
    'business': '商业',
    'company': '公司',
    'office': '办公室',
    'factory': '工厂',
    'shop': '商店',
    'market': '市场',
    'store': '商店',
    'restaurant': '餐厅',
    'hotel': '酒店',
    'hospital': '医院',
    'bank': '银行',
    'school': '学校',
    'university': '大学',
    'college': '学院',
    'library': '图书馆',
    'museum': '博物馆',
    'theater': '剧院',
    'cinema': '电影院',
    'park': '公园',
    'beach': '海滩',
    'pool': '游泳池',
    'gym': '健身房',
    'station': '车站',
    'airport': '机场',
    'port': '港口',
    'police': '警察',
    'government': '政府',
    'law': '法律',
    'rule': '规则',
    'policy': '政策',
    'plan': '计划',
    'project': '项目',
    'program': '程序',
    'system': '系统',
    'network': '网络',
    'internet': '互联网',
    'computer': '电脑',
    'phone': '电话',
    'mobile': '手机',
    'television': '电视',
    'radio': '收音机',
    'camera': '相机',
    'video': '视频',
    'audio': '音频',
    'sound': '声音',
    'voice': '声音',
    'speech': '演讲',
    'language': '语言',
    'letter': '字母',
    'number': '数字',
    'symbol': '符号',
    'sign': '标志',
    'signal': '信号',
    'message': '消息',
    'information': '信息',
    'data': '数据',
    'file': '文件',
    'document': '文档',
    'record': '记录',
    'history': '历史',
    'story': '故事',
    'news': '新闻',
    'report': '报告',
    'article': '文章',
    'book': '书',
    'magazine': '杂志',
    'newspaper': '报纸',
    'website': '网站',
    'blog': '博客',
    'social': '社交',
    'media': '媒体',
    'communication': '交流',
    'connection': '连接',
    'relationship': '关系',
    'friendship': '友谊',
    'love': '爱',
    'marriage': '婚姻',
    'family': '家庭',
    'parent': '父母',
    'child': '孩子',
    'brother': '兄弟',
    'sister': '姐妹',
    'son': '儿子',
    'daughter': '女儿',
    'father': '父亲',
    'mother': '母亲',
    'grandfather': '祖父',
    'grandmother': '祖母',
    'uncle': '叔叔',
    'aunt': '阿姨',
    'cousin': '表兄弟',
    'nephew': '侄子',
    'niece': '侄女',
    'husband': '丈夫',
    'wife': '妻子',
    'partner': '伙伴',
    'colleague': '同事',
    'classmate': '同学',
    'roommate': '室友',
    'neighbor': '邻居',
    'stranger': '陌生人',
    'enemy': '敌人',
    'rival': '竞争对手',
    'opponent': '对手',
    'ally': '盟友',
    'supporter': '支持者',
    'follower': '追随者',
    'leader': '领导者',
    'manager': '经理',
    'director': '总监',
    'boss': '老板',
    'employee': '员工',
    'worker': '工人',
    'staff': '员工',
    'team': '团队',
    'group': '团队',
    'organization': '组织',
    'community': '社区',
    'society': '社会',
    'culture': '文化',
    'tradition': '传统',
    'custom': '习俗',
    'habit': '习惯',
    'routine': '例行公事',
    'lifestyle': '生活方式',
    'attitude': '态度',
    'behavior': '行为',
    'character': '性格',
    'personality': '个性',
    'temperament': '气质',
    'mood': '情绪',
    'emotion': '情感',
    'feeling': '感觉',
    'sensation': '感觉',
    'perception': '感知',
    'thought': '思想',
    'idea': '想法',
    'concept': '概念',
    'theory': '理论',
    'hypothesis': '假设',
    'experiment': '实验',
    'research': '研究',
    'investigation': '调查',
    'analysis': '分析',
    'conclusion': '结论',
    'result': '结果',
    'outcome': '结果',
    'effect': '效果',
    'impact': '影响',
    'influence': '影响',
    'change': '变化',
    'development': '发展',
    'growth': '增长',
    'progress': '进步',
    'improvement': '改善',
    'success': '成功',
    'achievement': '成就',
    'accomplishment': '成就',
    'goal': '目标',
    'objective': '目标',
    'purpose': '目的',
    'reason': '原因',
    'cause': '原因',
    'basis': '基础',
    'foundation': '基础',
    'principle': '原则',
    'rule': '规则',
    'law': '法律',
    'regulation': '规定',
    'policy': '政策',
    'strategy': '策略',
    'tactic': '战术',
    'method': '方法',
    'technique': '技术',
    'skill': '技能',
    'ability': '能力',
    'capacity': '能力',
    'potential': '潜力',
    'opportunity': '机会',
    'possibility': '可能性',
    'probability': '概率',
    'likelihood': '可能性',
    'chance': '机会',
    'risk': '风险',
    'danger': '危险',
    'threat': '威胁',
    'problem': '问题',
    'issue': '问题',
    'difficulty': '困难',
    'challenge': '挑战',
    'obstacle': '障碍',
    'barrier': '障碍',
    'hindrance': '阻碍',
    'limit': '限制',
    'constraint': '约束',
    'restriction': '限制',
    'condition': '条件',
    'requirement': '要求',
    'standard': '标准',
    'criterion': '标准',
    'measure': '措施',
    'step': '步骤',
    'stage': '阶段',
    'phase': '阶段',
    'process': '过程',
    'procedure': '程序',
    'system': '系统',
    'structure': '结构',
    'organization': '组织',
    'arrangement': '安排',
    'order': '顺序',
    'sequence': '序列',
    'series': '系列',
    'set': '集合',
    'collection': '集合',
    'group': '组',
    'category': '类别',
    'type': '类型',
    'kind': '种类',
    'sort': '种类',
    'class': '类别',
    'species': '物种',
    'variety': '种类',
    'version': '版本',
    'edition': '版本',
    'copy': '副本',
    'original': '原件',
    'duplicate': '副本',
    'sample': '样品',
    'example': '例子',
    'model': '模型',
    'pattern': '模式',
    'design': '设计',
    'plan': '计划',
    'scheme': '计划',
    'project': '项目',
    'proposal': '提议',
    'suggestion': '建议',
    'recommendation': '推荐',
    'advice': '建议',
    'tip': '提示',
    'hint': '提示',
    'clue': '线索',
    'sign': '迹象',
    'symptom': '症状',
    'evidence': '证据',
    'proof': '证明',
    'fact': '事实',
    'truth': '真相',
    'reality': '现实',
    'fiction': '小说',
    'fantasy': '幻想',
    'dream': '梦',
    'nightmare': '噩梦',
    'hope': '希望',
    'wish': '愿望',
    'desire': '欲望',
    'need': '需求',
    'want': '想要',
    'require': '需要',
    'demand': '要求',
    'supply': '供应',
    'provide': '提供',
    'offer': '提供',
    'give': '给予',
    'take': '拿',
    'receive': '接收',
    'accept': '接受',
    'refuse': '拒绝',
    'reject': '拒绝',
    'deny': '否认',
    'admit': '承认',
    'confess': '坦白',
    'tell': '告诉',
    'say': '说',
    'speak': '说话',
    'talk': '谈话',
    'discuss': '讨论',
    'debate': '辩论',
    'argue': '争论',
    'agree': '同意',
    'disagree': '不同意',
    'accept': '接受',
    'reject': '拒绝',
    'approve': '批准',
    'disapprove': '不批准',
    'support': '支持',
    'oppose': '反对',
    'favor': '赞成',
    'object': '反对',
    'encourage': '鼓励',
    'discourage': '阻止',
    'motivate': '激励',
    'inspire': '激发',
    'persuade': '说服',
    'convince': '使确信',
    'influence': '影响',
    'affect': '影响',
    'change': '改变',
    'modify': '修改',
    'adjust': '调整',
    'adapt': '适应',
    'adopt': '采用',
    'use': '使用',
    'utilize': '利用',
    'apply': '应用',
    'employ': '雇用',
    'operate': '操作',
    'control': '控制',
    'manage': '管理',
    'direct': '指导',
    'guide': '引导',
    'lead': '领导',
    'follow': '跟随',
    'obey': '服从',
    'serve': '服务',
    'help': '帮助',
    'assist': '协助',
    'support': '支持',
    'protect': '保护',
    'defend': '防御',
    'guard': '守卫',
    'save': '拯救',
    'rescue': '救援',
    'heal': '治愈',
    'cure': '治疗',
    'treat': '对待',
    'care': '关心',
    'love': '爱',
    'hate': '恨',
    'like': '喜欢',
    'dislike': '不喜欢',
    'prefer': '偏好',
    'enjoy': '享受',
    'appreciate': '欣赏',
    'value': '重视',
    'respect': '尊重',
    'admire': '钦佩',
    'trust': '信任',
    'believe': '相信',
    'doubt': '怀疑',
    'suspect': '怀疑',
    'wonder': '想知道',
    'ask': '问',
    'answer': '回答',
    'reply': '回复',
    'respond': '回应',
    'react': '反应',
    'behave': '表现',
    'act': '行动',
    'do': '做',
    'make': '制造',
    'create': '创造',
    'build': '建造',
    'construct': '构造',
    'design': '设计',
    'develop': '开发',
    'produce': '生产',
    'manufacture': '制造',
    'grow': '生长',
    'raise': '抚养',
    'feed': '喂养',
    'nourish': '滋养',
    'sustain': '维持',
    'maintain': '保持',
    'keep': '保持',
    'hold': '保持',
    'carry': '携带',
    'bring': '带来',
    'take': '拿',
    'fetch': '取',
    'deliver': '递送',
    'send': '发送',
    'receive': '接收',
    'transfer': '转移',
    'move': '移动',
    'shift': '移动',
    'change': '改变',
    'replace': '替换',
    'substitute': '替代',
    'exchange': '交换',
    'trade': '贸易',
    'buy': '买',
    'sell': '卖',
    'purchase': '购买',
    'pay': '支付',
    'spend': '花费',
    'cost': '花费',
    'price': '价格',
    'value': '价值',
    'worth': '价值',
    'cheap': '便宜',
    'expensive': '昂贵',
    'free': '免费',
    'charged': '收费',
    'quality': '质量',
    'quantity': '数量',
    'amount': '数量',
    'number': '数字',
    'count': '计数',
    'calculate': '计算',
    'measure': '测量',
    'estimate': '估计',
    'predict': '预测',
    'forecast': '预报',
    'expect': '期望',
    'anticipate': '预期',
    'wait': '等待',
    'hope': '希望',
    'wish': '希望',
    'dream': '梦想',
    'imagine': '想象',
    'create': '创造',
    'invent': '发明',
    'discover': '发现',
    'find': '找到',
    'search': '搜索',
    'look': '看',
    'see': '看见',
    'watch': '观看',
    'observe': '观察',
    'notice': '注意',
    'realize': '意识到',
    'understand': '理解',
    'comprehend': '领会',
    'grasp': '抓住',
    'learn': '学习',
    'study': '研究',
    'teach': '教',
    'train': '训练',
    'educate': '教育',
    'inform': '通知',
    'communicate': '交流',
    'express': '表达',
    'describe': '描述',
    'explain': '解释',
    'clarify': '澄清',
    'illustrate': '说明',
    'demonstrate': '演示',
    'show': '展示',
    'display': '显示',
    'present': '呈现',
    'represent': '代表',
    'symbolize': '象征',
    'signify': '表示',
    'mean': '意味着',
    'indicate': '指示',
    'suggest': '建议',
    'imply': '暗示',
    'infer': '推断',
    'conclude': '得出结论',
    'deduce': '推导',
    'reason': '推理',
    'think': '思考',
    'consider': '考虑',
    'weigh': '权衡',
    'evaluate': '评估',
    'assess': '评估',
    'judge': '判断',
    'decide': '决定',
    'choose': '选择',
    'select': '选择',
    'pick': '挑选',
    'prefer': '偏好',
    'favor': '偏爱',
    'recommend': '推荐',
    'suggest': '建议',
    'propose': '提议',
    'offer': '提供',
    'grant': '授予',
    'allow': '允许',
    'permit': '许可',
    'authorize': '授权',
    'approve': '批准',
    'accept': '接受',
    'refuse': '拒绝',
    'deny': '否认',
    'reject': '拒绝',
    'decline': '谢绝',
    'dismiss': '解雇',
    'fire': '解雇',
    'hire': '雇用',
    'employ': '雇佣',
    'recruit': '招聘',
    'interview': '面试',
    'apply': '申请',
    'candidate': '候选人',
    'position': '职位',
    'role': '角色',
    'function': '功能',
    'purpose': '目的',
    'goal': '目标',
    'objective': '目标',
    'target': '目标',
    'aim': '目标',
    'mission': '使命',
    'vision': '愿景',
    'strategy': '战略',
    'plan': '计划',
    'tactics': '战术',
    'method': '方法',
    'way': '方式',
    'means': '手段',
    'tool': '工具',
    'instrument': '仪器',
    'device': '设备',
    'machine': '机器',
    'engine': '引擎',
    'motor': '马达',
    'mechanism': '机制',
    'system': '系统',
    'structure': '结构',
    'framework': '框架',
    'foundation': '基础',
    'basis': '基础',
    'ground': '地面',
    'floor': '地板',
    'ceiling': '天花板',
    'wall': '墙',
    'door': '门',
    'window': '窗户',
    'roof': '屋顶',
    'building': '建筑',
    'house': '房子',
    'home': '家',
    'room': '房间',
    'space': '空间',
    'area': '区域',
    'region': '地区',
    'zone': '地带',
    'district': '区域',
    'sector': '部门',
    'section': '部分',
    'part': '部分',
    'piece': '片',
    'fragment': '碎片',
    'segment': '段',
    'portion': '部分',
    'share': '份额',
    'percentage': '百分比',
    'rate': '比率',
    'speed': '速度',
    'velocity': '速度',
    'acceleration': '加速度',
    'momentum': '动量',
    'force': '力',
    'pressure': '压力',
    'stress': '压力',
    'strain': '张力',
    'tension': '紧张',
    'relaxation': '放松',
    'comfort': '舒适',
    'convenience': '便利',
    'benefit': '利益',
    'advantage': '优势',
    'profit': '利润',
    'gain': '收益',
    'loss': '损失',
    'damage': '损害',
    'injury': '伤害',
    'harm': '伤害',
    'pain': '痛苦',
    'suffering': '痛苦',
    'misery': '苦难',
    'difficulty': '困难',
    'trouble': '麻烦',
    'problem': '问题',
    'issue': '议题',
    'matter': '事情',
    'topic': '话题',
    'subject': '主题',
    'theme': '主题',
    'idea': '想法',
    'concept': '概念',
    'notion': '概念',
    'theory': '理论',
    'hypothesis': '假设',
    'assumption': '假设',
    'premise': '前提',
    'argument': '论点',
    'claim': '主张',
    'assertion': '断言',
    'statement': '声明',
    'declaration': '宣布',
    'announcement': '公告',
    'proclamation': '宣言',
    'notice': '通知',
    'warning': '警告',
    'alert': '警报',
    'alarm': '警报',
    'signal': '信号',
    'sign': '标志',
    'symbol': '象征',
    'mark': '标记',
    'indication': '指示',
    'evidence': '证据',
    'proof': '证明',
    'demonstration': '演示',
    'example': '例子',
    'instance': '实例',
    'case': '案例',
    'situation': '情况',
    'condition': '条件',
    'circumstance': '情况',
    'context': '上下文',
    'environment': '环境',
    'surroundings': '周围环境',
    'atmosphere': '大气',
    'climate': '气候',
    'weather': '天气',
    'temperature': '温度',
    'heat': '热',
    'cold': '冷',
    'warmth': '温暖',
    'coolness': '凉爽',
    'humidity': '湿度',
    'dryness': '干燥',
    'wetness': '潮湿',
    'moisture': '水分',
    'light': '光',
    'darkness': '黑暗',
    'brightness': '亮度',
    'dimness': '昏暗',
    'shade': '阴影',
    'shadow': '影子',
    'reflection': '反射',
    'refraction': '折射',
    'transmission': '传输',
    'absorption': '吸收',
    'emission': '发射',
    'radiation': '辐射',
    'wave': '波',
    'particle': '粒子',
    'atom': '原子',
    'molecule': '分子',
    'compound': '化合物',
    'element': '元素',
    'substance': '物质',
    'material': '材料',
    'matter': '物质',
    'energy': '能量',
    'power': '功率',
    'electricity': '电力',
    'magnetism': '磁性',
    'gravity': '重力',
    'friction': '摩擦',
    'motion': '运动',
    'movement': '移动',
    'action': '行动',
    'reaction': '反应',
    'interaction': '交互',
    'relation': '关系',
    'connection': '连接',
    'link': '链接',
    'bond': '纽带',
    'tie': '联系',
    'association': '关联',
    'union': '联合',
    'alliance': '联盟',
    'coalition': '联盟',
    'partnership': '伙伴关系',
    'cooperation': '合作',
    'collaboration': '协作',
    'teamwork': '团队合作',
    'coordination': '协调',
    'organization': '组织',
    'management': '管理',
    'administration': '行政',
    'control': '控制',
    'supervision': '监督',
    'oversight': '监督',
    'regulation': '监管',
    'governance': '治理',
    'leadership': '领导',
    'direction': '指导',
    'guidance': '引导',
    'mentoring': '指导',
    'coaching': '教练',
    'training': '培训',
    'development': '发展',
    'growth': '增长',
    'improvement': '改进',
    'progress': '进步',
    'advancement': '进步',
    'innovation': '创新',
    'invention': '发明',
    'creation': '创造',
    'discovery': '发现',
    'exploration': '探索',
    'investigation': '调查',
    'research': '研究',
    'study': '研究',
    'analysis': '分析',
    'examination': '检查',
    'inspection': '视察',
    'review': '审查',
    'evaluation': '评估',
    'assessment': '评价',
    'appraisal': '评估',
    'critique': '评论',
    'feedback': '反馈',
    'comment': '评论',
    'opinion': '意见',
    'view': '观点',
    'perspective': '视角',
    'outlook': '展望',
    'attitude': '态度',
    'approach': '方法',
    'method': '方法',
    'technique': '技术',
    'strategy': '策略',
    'tactic': '战术',
    'plan': '计划',
    'scheme': '计划',
    'project': '项目',
    'program': '程序',
    'initiative': '倡议',
    'campaign': '活动',
    'movement': '运动',
    'cause': '事业',
    'mission': '使命',
    'purpose': '目的',
    'goal': '目标',
    'objective': '目标',
    'target': '目标',
    'aim': '目标',
    'ambition': '抱负',
    'aspiration': '抱负',
    'desire': '欲望',
    'wish': '愿望',
    'hope': '希望',
    'dream': '梦想',
    'fantasy': '幻想',
    'imagination': '想象力',
    'creativity': '创造力',
    'innovation': '创新',
    'originality': '原创性',
    'uniqueness': '独特性',
    'distinctiveness': '特色',
    'individuality': '个性',
    'personality': '性格',
    'character': '品格',
    'nature': '本性',
    'essence': '本质',
    'substance': '实质',
    'reality': '现实',
    'existence': '存在',
    'life': '生命',
    'death': '死亡',
    'birth': '出生',
    'growth': '成长',
    'aging': '衰老',
    'health': '健康',
    'disease': '疾病',
    'illness': '疾病',
    'sickness': '疾病',
    'injury': '伤害',
    'wound': '伤口',
    'pain': '疼痛',
    'suffering': '痛苦',
    'healing': '治愈',
    'recovery': '恢复',
    'rehabilitation': '康复',
    'treatment': '治疗',
    'therapy': '疗法',
    'medicine': '药物',
    'drug': '药物',
    'medication': '药物',
    'remedy': '补救',
    'cure': '治愈',
    'prevention': '预防',
    'protection': '保护',
    'safety': '安全',
    'security': '安全',
    'defense': '防御',
    'guard': '守卫',
    'shield': '盾牌',
    'barrier': '屏障',
    'obstacle': '障碍',
    'hindrance': '阻碍',
    'difficulty': '困难',
    'problem': '问题',
    'challenge': '挑战',
    'test': '测试',
    'trial': '试验',
    'experiment': '实验',
    'experience': '经验',
    'practice': '练习',
    'exercise': '锻炼',
    'training': '训练',
    'education': '教育',
    'learning': '学习',
    'study': '学习',
    'knowledge': '知识',
    'information': '信息',
    'data': '数据',
    'fact': '事实',
    'truth': '真相',
    'wisdom': '智慧',
    'insight': '洞察力',
    'understanding': '理解',
    'comprehension': '理解',
    'awareness': '意识',
    'consciousness': '意识',
    'mind': '思想',
    'thought': '思想',
    'thinking': '思考',
    'reasoning': '推理',
    'logic': '逻辑',
    'rationality': '理性',
    'intelligence': '智力',
    'cleverness': '聪明',
    'smartness': '聪明',
    'wisdom': '智慧',
    'knowledge': '知识',
    'expertise': '专业知识',
    'skill': '技能',
    'ability': '能力',
    'talent': '天赋',
    'gift': '天赋',
    'capacity': '容量',
    'potential': '潜力',
    'possibility': '可能性',
    'opportunity': '机会',
    'chance': '机会',
    'luck': '运气',
    'fortune': '财富',
    'destiny': '命运',
    'fate': '命运',
    'luck': '运气',
    'chance': '机会',
    'coincidence': '巧合',
    'accident': '事故',
    'incident': '事件',
    'event': '事件',
    'occurrence': '发生',
    'happening': '事情',
    'phenomenon': '现象',
    'situation': '情况',
    'circumstance': '情况',
    'condition': '条件',
    'state': '状态',
    'status': '状态',
    'position': '位置',
    'location': '地点',
    'place': '地方',
    'spot': '地点',
    'area': '区域',
    'region': '地区',
    'territory': '领土',
    'land': '土地',
    'ground': '地面',
    'soil': '土壤',
    'earth': '地球',
    'world': '世界',
    'globe': '地球仪',
    'universe': '宇宙',
    'cosmos': '宇宙',
    'space': '空间',
    'void': '虚空',
    'nothing': '无',
    'everything': '一切',
    'all': '所有',
    'none': '无',
    'some': '一些',
    'any': '任何',
    'every': '每一个',
    'each': '每个',
    'both': '两者',
    'neither': '都不',
    'either': '任一',
    'other': '其他',
    'another': '另一个',
    'same': '相同',
    'different': '不同',
    'similar': '相似',
    'like': '像',
    'unlike': '不像',
    'equal': '相等',
    'unequal': '不等',
    'same': '相同',
    'identical': '相同',
    'equivalent': '等价',
    'comparable': '可比较',
    'related': '相关',
    'connected': '连接',
    'associated': '关联',
    'linked': '链接',
    'tied': '系',
    'bound': '绑定',
    'attached': '附',
    'joined': '加入',
    'combined': '组合',
    'united': '联合',
    'divided': '分开',
    'separated': '分离',
    'isolated': '隔离',
    'alone': '独自',
    'together': '一起',
    'apart': '分开',
    'away': '离开',
    'near': '近',
    'far': '远',
    'close': '近',
    'distant': '远',
    'adjacent': '相邻',
    'next': '下一个',
    'previous': '前一个',
    'before': '之前',
    'after': '之后',
    'during': '期间',
    'while': '当',
    'when': '当',
    'where': '哪里',
    'why': '为什么',
    'how': '如何',
    'what': '什么',
    'who': '谁',
    'which': '哪个',
    'that': '那个',
    'this': '这个',
    'these': '这些',
    'those': '那些',
    'it': '它',
    'he': '他',
    'she': '她',
    'they': '他们',
    'we': '我们',
    'you': '你',
    'i': '我',
    'my': '我的',
    'your': '你的',
    'his': '他的',
    'her': '她的',
    'its': '它的',
    'our': '我们的',
    'their': '他们的',
    'me': '我',
    'him': '他',
    'us': '我们',
    'them': '他们',
    'be': '是',
    'have': '有',
    'do': '做',
    'say': '说',
    'get': '得到',
    'make': '制造',
    'go': '去',
    'know': '知道',
    'take': '拿',
    'see': '看见',
    'come': '来',
    'think': '思考',
    'look': '看',
    'want': '想要',
    'give': '给',
    'use': '使用',
    'find': '找到',
    'tell': '告诉',
    'ask': '问',
    'work': '工作',
    'seem': '似乎',
    'feel': '感觉',
    'try': '尝试',
    'leave': '离开',
    'call': '叫',
    'good': '好',
    'new': '新',
    'first': '第一',
    'last': '最后',
    'long': '长',
    'great': '伟大',
    'little': '小',
    'own': '自己的',
    'other': '其他',
    'old': '老',
    'right': '对',
    'big': '大',
    'high': '高',
    'different': '不同',
    'small': '小',
    'large': '大',
    'next': '下一个',
    'early': '早',
    'young': '年轻',
    'important': '重要',
    'few': '少',
    'public': '公共',
    'bad': '坏',
    'same': '相同',
    'able': '能够'
  }

  return commonWords[word.toLowerCase()] || ''
}

function WordLibrary({ wordLibrary, setWordLibrary, setCurrentPage }) {
  const [newWord, setNewWord] = useState({ word: '', meaning: '', example: '', phonetic: '' })
  const [editingId, setEditingId] = useState(null)
  const [editingWord, setEditingWord] = useState({ word: '', meaning: '', example: '', phonetic: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [isAutoFetching, setIsAutoFetching] = useState(false)
  const [autoFetchProgress, setAutoFetchProgress] = useState({ current: 0, total: 0 })

  // 自动获取单词信息
  const handleAutoFetch = async (wordText) => {
    setIsAutoFetching(true)
    try {
      const wordInfo = await fetchWordInfo(wordText.trim())
      if (wordInfo) {
        setNewWord({
          word: wordInfo.word,
          meaning: wordInfo.chineseMeaning || wordInfo.englishDefinition,
          example: wordInfo.example,
          phonetic: wordInfo.phonetic
        })
        return true
      } else {
        alert('未找到该单词信息，请手动输入')
        return false
      }
    } catch (error) {
      console.error('获取单词信息失败:', error)
      alert('获取单词信息失败，请检查网络或手动输入')
      return false
    } finally {
      setIsAutoFetching(false)
    }
  }

  // 批量自动获取（从文本列表）
  const handleBatchAutoFetch = async (words) => {
    setIsAutoFetching(true)
    setAutoFetchProgress({ current: 0, total: words.length })
    const newWords = []

    for (let i = 0; i < words.length; i++) {
      const wordText = words[i].trim()
      if (!wordText) continue

      try {
        const wordInfo = await fetchWordInfo(wordText)
        if (wordInfo) {
          newWords.push({
            id: Date.now() + i,
            word: wordInfo.word,
            meaning: wordInfo.chineseMeaning || wordInfo.englishDefinition,
            example: wordInfo.example,
            phonetic: wordInfo.phonetic
          })
        }
      } catch (error) {
        console.error(`获取单词 "${wordText}" 信息失败:`, error)
      }

      setAutoFetchProgress({ current: i + 1, total: words.length })
      // 添加延迟，避免请求过快
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    setWordLibrary([...wordLibrary, ...newWords])
    setIsAutoFetching(false)
    alert(`成功获取 ${newWords.length} 个单词的信息`)
  }

  // 从TXT文件批量导入
  const handleTxtImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.txt'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target.result
        const words = content.split('\n').map(w => w.trim()).filter(w => w)

        if (confirm(`找到 ${words.length} 个单词，是否自动获取释义和例句？\n取消则按原有格式导入`)) {
          handleBatchAutoFetch(words)
        } else {
          // 按原有格式导入（每行一个单词，不获取释义）
          const newWords = words.map((word, i) => ({
            id: Date.now() + i,
            word: word.toLowerCase(),
            meaning: '',
            example: ''
          }))
          setWordLibrary([...wordLibrary, ...newWords])
          alert(`成功导入 ${newWords.length} 个单词`)
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const handleAddWord = () => {
    if (!newWord.word.trim() || !newWord.meaning.trim()) {
      alert('请填写单词和释义')
      return
    }

    const word = {
      id: Date.now(),
      word: newWord.word.trim().toLowerCase(),
      meaning: newWord.meaning.trim(),
      example: newWord.example.trim() || `${newWord.word} - example sentence`,
      phonetic: newWord.phonetic || ''
    }

    setWordLibrary([...wordLibrary, word])
    setNewWord({ word: '', meaning: '', example: '', phonetic: '' })
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
            example: editingWord.example.trim(),
            phonetic: editingWord.phonetic || ''
          }
        : w
    ))
    setEditingId(null)
    setEditingWord({ word: '', meaning: '', example: '', phonetic: '' })
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
      example: word.example,
      phonetic: word.phonetic || ''
    })
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv'
    input.onchange = (e) => {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target.result

        try {
          let newWords = []

          // CSV 格式: word,meaning,example
          const lines = content.split('\n').filter(line => line.trim())
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase())

          // 检测列顺序
          const wordIndex = headers.findIndex(h => h.includes('word') || h === '单词')
          const meaningIndex = headers.findIndex(h => h.includes('meaning') || h === '释义' || h === '意思')
          const exampleIndex = headers.findIndex(h => h.includes('example') || h === '例句')
          const phoneticIndex = headers.findIndex(h => h.includes('phonetic') || h === '音标')

          // 如果没有表头，默认顺序: word,meaning,example
          const useDefault = wordIndex === -1 && meaningIndex === -1

          for (let i = useDefault ? 0 : 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map(c => c.trim())
            const word = useDefault ? cols[0] : cols[wordIndex]
            const meaning = useDefault ? cols[1] : cols[meaningIndex]
            const example = useDefault ? (cols[2] || '') : (exampleIndex >= 0 ? cols[exampleIndex] : '')
            const phonetic = useDefault ? (cols[3] || '') : (phoneticIndex >= 0 ? cols[phoneticIndex] : '')

            if (word && meaning) {
              newWords.push({
                id: Date.now() + i,
                word: word.toLowerCase(),
                meaning: meaning,
                example: example,
                phonetic: phonetic
              })
            }
          }

          if (newWords.length > 0) {
            setWordLibrary([...wordLibrary, ...newWords])
            alert(`成功导入 ${newWords.length} 个单词`)
          } else {
            alert('导入失败: 文件中没有找到有效的单词')
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
    // 导出 CSV 格式（包含音标）
    const csvHeader = 'word,meaning,example,phonetic\n'
    const csvContent = wordLibrary.map(w =>
      `"${w.word}","${w.meaning}","${w.example.replace(/"/g, '""')}","${(w.phonetic || '').replace(/"/g, '""')}"`
    ).join('\n')
    const csvData = csvHeader + csvContent

    const dataBlob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'word-library.csv'
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
            disabled={isAutoFetching}
          >
            {showAddForm ? '收起表单' : '+ 添加单词'}
          </button>
          <button className="btn btn-secondary" onClick={handleImport} disabled={isAutoFetching}>
            📥 导入词库 (CSV)
          </button>
          <button className="btn btn-secondary" onClick={handleTxtImport} disabled={isAutoFetching}>
            📄 导入TXT并自动获取
          </button>
          <button className="btn btn-secondary" onClick={handleExport}>
            📤 导出词库 (CSV)
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

        {isAutoFetching && (
          <div style={{
            padding: '16px',
            background: 'rgba(99, 102, 241, 0.1)',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div style={{ color: 'var(--primary)', fontWeight: '500', marginBottom: '8px' }}>
              正在获取单词信息...
            </div>
            <div style={{ color: 'var(--gray)', fontSize: '14px' }}>
              进度: {autoFetchProgress.current} / {autoFetchProgress.total}
            </div>
          </div>
        )}

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
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="input"
                    placeholder="例如: hello"
                    value={newWord.word}
                    onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                    style={{ flex: 1 }}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={() => handleAutoFetch(newWord.word)}
                    disabled={isAutoFetching || !newWord.word.trim()}
                  >
                    {isAutoFetching ? '获取中...' : '🔍 自动获取'}
                  </button>
                </div>
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
                  音标
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="例如: /həˈloʊ/"
                  value={newWord.phonetic}
                  onChange={(e) => setNewWord({ ...newWord, phonetic: e.target.value })}
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
                    setNewWord({ word: '', meaning: '', example: '', phonetic: '' })
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
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px'
          }}>
            <thead>
              <tr style={{
                borderBottom: '2px solid var(--gray)',
                textAlign: 'left'
              }}>
                <th style={{ padding: '16px', fontWeight: '700', color: 'var(--dark)', minWidth: '120px' }}>
                  单词
                </th>
                <th style={{ padding: '16px', fontWeight: '700', color: 'var(--dark)', minWidth: '100px' }}>
                  音标
                </th>
                <th style={{ padding: '16px', fontWeight: '700', color: 'var(--dark)', minWidth: '150px' }}>
                  释义
                </th>
                <th style={{ padding: '16px', fontWeight: '700', color: 'var(--dark)', minWidth: '200px' }}>
                  例句
                </th>
                <th style={{ padding: '16px', fontWeight: '700', color: 'var(--dark)', width: '120px', textAlign: 'center' }}>
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredWords.map((word) => (
                <tr
                  key={word.id}
                  style={{
                    borderBottom: '1px solid var(--gray)',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  {editingId === word.id ? (
                    <>
                      <td style={{ padding: '16px' }}>
                        <input
                          type="text"
                          className="input"
                          value={editingWord.word}
                          onChange={(e) => setEditingWord({ ...editingWord, word: e.target.value })}
                          placeholder="单词"
                          style={{ width: '100%', fontSize: '14px' }}
                        />
                      </td>
                      <td style={{ padding: '16px' }}>
                        <input
                          type="text"
                          className="input"
                          value={editingWord.phonetic}
                          onChange={(e) => setEditingWord({ ...editingWord, phonetic: e.target.value })}
                          placeholder="音标"
                          style={{ width: '100%', fontSize: '14px' }}
                        />
                      </td>
                      <td style={{ padding: '16px' }}>
                        <input
                          type="text"
                          className="input"
                          value={editingWord.meaning}
                          onChange={(e) => setEditingWord({ ...editingWord, meaning: e.target.value })}
                          placeholder="释义"
                          style={{ width: '100%', fontSize: '14px' }}
                        />
                      </td>
                      <td style={{ padding: '16px' }}>
                        <input
                          type="text"
                          className="input"
                          value={editingWord.example}
                          onChange={(e) => setEditingWord({ ...editingWord, example: e.target.value })}
                          placeholder="例句"
                          style={{ width: '100%', fontSize: '14px' }}
                        />
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            className="btn btn-success"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            onClick={handleEditWord}
                          >
                            保存
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => {
                              setEditingId(null)
                              setEditingWord({ word: '', meaning: '', example: '', phonetic: '' })
                            }}
                          >
                            取消
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          fontSize: '16px',
                          fontWeight: '700',
                          color: 'var(--primary)'
                        }}>
                          {word.word}
                        </span>
                      </td>
                      <td style={{ padding: '16px', color: 'var(--gray)', fontFamily: 'Arial, sans-serif' }}>
                        {word.phonetic || '-'}
                      </td>
                      <td style={{ padding: '16px', color: 'var(--dark)', fontWeight: '500' }}>
                        {word.meaning}
                      </td>
                      <td style={{ padding: '16px', color: 'var(--gray)', fontStyle: 'italic' }}>
                        "{word.example}"
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => startEditing(word)}
                          >
                            编辑
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => handleDeleteWord(word.id)}
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
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
