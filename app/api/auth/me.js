// pages/api/auth/me.js
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Token de acesso necessário' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Buscar usuário no banco
    // const user = await User.findById(decoded.userId);
    
    // Simulação
    const user = {
      id: decoded.userId,
      name: 'Usuário Teste',
      email: decoded.email
    };

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.status(200).json({ user });

  } catch (error) {
    console.error('Erro na verificação do token:', error);
    res.status(401).json({ message: 'Token inválido' });
  }
}