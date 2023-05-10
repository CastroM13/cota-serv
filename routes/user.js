import express from 'express';
import bodyParser from 'body-parser';
import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'

const userRoutes = express.Router();
var jsonParser = bodyParser.json()

userRoutes.post('/login', jsonParser, (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        res.status(401).json({ message: 'Email ou senha inválidos' });
      } else {
        bcrypt.compare(password, user.password, (err, result) => {
          if (result) {
            const token = jwt.sign({ id: user.id }, 'oiporco');
            res.status(200).json({ token: token });
          } else {
            res.status(401).json({ message: 'Email ou senha inválidos' });
          }
        });
      }
    })
    .catch(err => res.status(500).json({ message: err.message }));
});

userRoutes.post('', jsonParser, async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'Usuário já registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();
    const token = jwt.sign({ id: user.id }, 'oiporco');

    res.json({ token: token, message: 'Usuário criado com sucesso' });
  } catch (error) {
    next(error);
  }
});

userRoutes.delete('', async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Credenciais não enviadas!' });
  }

  try {
    const token = jwt.decode(req.headers.authorization.split('Bearer ')[1], { complete: true });
    
    const existingUser = await User.findById(token.payload.id);
    
    if (existingUser) {
      await User.findByIdAndDelete(existingUser.id);
      return res.status(200).json({ message: 'Usuário removido com sucesso' });
    } else {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
  } catch (error) {
    next(error);
  }
});

userRoutes.patch('', jsonParser, async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Credenciais não enviadas!' });
  }

  if (!req.body) {
    return res.status(401).json({ error: 'Requisição sem corpo!' });
  }

  if (req.body.password) {
    return res.status(401).json({ error: 'Use a função de mudança de senha para trocá-la!' });
  }

  try {
    const token = jwt.decode(req.headers.authorization.split('Bearer ')[1], { complete: true });
    
    const existingUser = await User.findById(token.payload.id);
    
    if (existingUser) {
      await User.findByIdAndUpdate(existingUser.id, {...req.body});
      return res.status(200).json({ message: 'Usuário atualizado com sucesso' });
    } else {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
  } catch (error) {
    next(error);
  }
});

userRoutes.patch('/password', jsonParser, async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Credenciais não enviadas!' });
  }

  if (!req.body.password) {
    return res.status(401).json({ error: 'Dados não enviados!' });
  }

  try {
    const token = jwt.decode(req.headers.authorization.split('Bearer ')[1], { complete: true });
    
    const existingUser = await User.findById(token.payload.id);
    
    if (existingUser) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      await User.findByIdAndUpdate(existingUser.id, {password: hashedPassword});
      return res.status(200).json({ message: 'Senha do usuário atualizada com sucesso' });
    } else {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
  } catch (error) {
    next(error);
  }
});

userRoutes.get('', async (req,res) => {
  const token = jwt.decode(req.query.token, { complete: true });
  try {
    const user = await User.findById(token.payload.id)
    if (user) {
      res.json(user)
    } else {
      res.json({ error: 'Usuário não encontrado!' });
    }
  } catch (error) {
    next(error);
  }
  
})

export { userRoutes }