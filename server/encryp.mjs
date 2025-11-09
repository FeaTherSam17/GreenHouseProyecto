import bcrypt from 'bcrypt';

const password = '123';  // ← la contraseña que querés encriptar
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error al encriptar:', err);
    return;
  }
  console.log('Contraseña original:', password);
  console.log('Hash generado:', hash);
});
