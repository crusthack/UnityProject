// 예제 백엔드 API 서버 (Node.js + Express)
// 이 파일은 테스트용 예제입니다. 실제 프로덕션 환경에서는 보안을 강화해야 합니다.

/*

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = 'your-secret-key-here';

// 임시 사용자 저장소 (실제로는 데이터베이스 사용)
const users = {};

// 회원가입
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (users[email]) {
      return res.status(400).json({ message: '이미 등록된 이메일입니다' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = Date.now().toString();
    
    users[email] = {
      id: userId,
      email,
      password: hashedPassword,
      name
    };

    const token = jwt.sign({ id: userId, email }, SECRET_KEY, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: userId,
        email,
        name
      }
    });
  } catch (error) {
    res.status(500).json({ message: '회원가입 실패' });
  }
});

// 로그인
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!users[email]) {
      return res.status(400).json({ message: '이메일 또는 비밀번호가 틀렸습니다' });
    }

    const user = users[email];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({ message: '이메일 또는 비밀번호가 틀렸습니다' });
    }

    const token = jwt.sign({ id: user.id, email }, SECRET_KEY, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: '로그인 실패' });
  }
});

// 사용자 정보 조회
app.get('/api/user/info', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: '토큰이 없습니다' });
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    const user = users[decoded.email];

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(401).json({ message: '인증 실패' });
  }
});

// 로그아웃
app.post('/api/auth/logout', (req, res) => {
  res.json({ message: '로그아웃 완료' });
});

app.listen(3001, () => {
  console.log('서버가 포트 3001에서 실행 중입니다');
});

*/

/*
실행 방법:
1. 새 폴더를 만들고 이 파일을 server.js로 저장
2. package.json 생성:
   {
     "name": "auth-server",
     "version": "1.0.0",
     "main": "server.js",
     "dependencies": {
       "express": "^4.18.2",
       "cors": "^2.8.5",
       "jsonwebtoken": "^9.0.0",
       "bcrypt": "^5.1.0"
     }
   }
3. npm install 실행
4. node server.js로 서버 실행
*/
